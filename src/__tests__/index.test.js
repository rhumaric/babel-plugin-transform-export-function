const test = require('ava');
const testname = require('testname');
const { transformSync } = require('@babel/core');
const { readFileSync, existsSync } = require('fs');
const { resolve, dirname, relative } = require('path');
const { sync: glob } = require('fast-glob');
const transform = require('..');

const macro = fileBasedTest(__filename, (t, { input, options = {} }) => {
  return transformSync(input, {
    // Control whether to allow top-level through filename
    plugins: [[transform, options]],
    parserOpts: {
      allowReturnOutsideFunction: true,
      sourceType: 'module'
    }
  }).code;
});

// Use some globbing to generate tests based on the files in __fixtures__
const fixtures = glob(resolve(fixturesPath(__filename), '**', '*.input.js'));

// A regexp for filtering tests by fixtureName
const filterByFixtureName = /shortcut-over/;

fixtures
  .map(path => relative(fixturesPath(__filename), path))
  .map(dropAllExtensions)
  .forEach(fixtureName => {
    if (filterByFixtureName) {
      if (filterByFixtureName.test(fixtureName)) {
        return test.only(macro, { fixtureName });
      }
    }
    return test(macro, { fixtureName });
  });

function fileBasedTest(testFileName, fn) {
  const macro = withFixtures(
    testFileName,
    withInput(withOptions(withOutputComparison(fn)))
  );
  macro.title = (definedTitle, options) => definedTitle || options.fixtureName;
  return macro;
}

function withFixtures(testFileName, fn) {
  return function(t, options) {
    return fn(t, {
      fixturesPath: fixturesPath(testFileName),
      ...options
    });
  };
}

function withOptions(fn) {
  return function(t, options) {
    const optionsPath = resolve(
      options.fixturesPath,
      `${options.fixtureName}.options.js`
    );
    if (existsSync(optionsPath)) {
      const testOptions = require(optionsPath);
      return fn(t, { options: testOptions, ...options });
    }
    return fn(t, options);
  };
}

function withInput(fn) {
  return function(t, options) {
    const input = readFileSync(
      resolve(options.fixturesPath, `${options.fixtureName}.input.js`),
      'utf-8'
    );
    return fn(t, { input, ...options });
  };
}

function withOutputComparison(fn) {
  return function(t, options) {
    let compared;
    const compare = output => {
      if (!compared) {
        const expected = readFileSync(
          resolve(options.fixturesPath, `${options.fixtureName}.output.js`),
          'utf-8'
        );

        compared = true;
        return t.is(
          // Ignore whitespace
          output.replace(/\s/g, '').replace(/;/g, ''),
          expected
            .replace(/\/\/\s*prettier-ignore/, '') // Ignore prettier comments
            .replace(/\s/g, '') // Ignore whitespace
            .replace(/;/g, '') // Ignore semi colons, rather than disabling prettier
        );
      }
    };
    const result = fn(t, { compare, ...options });
    compare(result);
  };
}

function fixturesPath(testFileName) {
  return resolve(dirname(testFileName), '__fixtures__', testname(testFileName));
}

function dropAllExtensions(filename) {
  const indexOfFirstDot = filename.indexOf('.');
  if (indexOfFirstDot === -1) return filename;
  return filename.substring(0, indexOfFirstDot);
}
