module.exports = function({ types }) {
  return {
    visitor: {
      Program(path) {
        const functionToExport = wrapInFunction(path.node.body, { types });
        path.node.body = [wrapInCommonJSExport(functionToExport, { types })];
      }
    }
  };
};

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
