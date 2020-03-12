module.exports = function({ types }) {
  return {
    visitor: {
      Program: {
        // Only do the transform when we exit the Program
        // so the traversal can inform whether to inject a function
        // or not
        exit(path) {
          if (!this.abort) {
            const functionToExport = wrapInFunction(path.node.body, { types });
            path.node.body = [
              wrapInCommonJSExport(functionToExport, { types })
            ];
          }
        }
      },
      AssignmentExpression(path) {
        // If we find an explicit `module.exports`
        // we abort, unless `module` does not correspond
        // to the top-level `module` (for ex. if the `module.exports`
        // is within a function that has a `module` parameter)
        // We also need to do the same for the `exports` shortcut
        if (
          (isModuleExportAssignment(path.node) &&
            !path.scope.hasBinding('module')) ||
          (isExportAssignment(path.node) && !path.scope.hasBinding('exports'))
        ) {
          this.abort = true;
        }
      }
    }
  };
};

/**
 * Tests if the given `assignmentExpression` sets a value
 * for one of the properties of `exports`
 * (https://nodejs.org/api/modules.html#modules_exports_shortcut)
 * @param {*} assignmentExpression
 */
function isExportAssignment(assignmentExpression) {
  const left = assignmentExpression.left;
  if (left.type == 'MemberExpression') {
    return left.object.type === 'Identifier' && left.object.name === 'exports';
  }
  return false;
}

/**
 * Tests if the given `assignmentExpression` sets a value for
 * `module.exports` or one of its properties
 * (https://nodejs.org/api/modules.html#modules_module_exports)
 * @param {*} assignmentExpression
 */
function isModuleExportAssignment(assignmentExpression) {
  const left = assignmentExpression.left;
  if (left.type == 'MemberExpression') {
    return (
      isModuleExport(left) ||
      (left.object.type == 'MemberExpression' && isModuleExport(left.object))
    );
  }

  return false;
}

/**
 * Tests if the given `memberExpression` corresponds to
 * `module.exports`
 * @param {*} memberExpression
 */
function isModuleExport(memberExpression) {
  return (
    memberExpression.object.type === 'Identifier' &&
    memberExpression.object.name === 'module' &&
    memberExpression.property.type === 'Identifier' &&
    memberExpression.property.name === 'exports'
  );
}

function wrapInFunction(bodyStatements, { types }) {
  return types.FunctionExpression(
    null,
    [types.Identifier('data')],
    types.BlockStatement(bodyStatements)
  );
}

function wrapInCommonJSExport(expression, { types }) {
  return types.AssignmentExpression(
    '=',
    types.MemberExpression(
      types.Identifier('module'),
      types.Identifier('exports')
    ),
    expression
  );
}
