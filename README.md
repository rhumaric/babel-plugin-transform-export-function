babel-plugin-transform-export-function
===

A Babel transform that wraps the module code inside a function, 
that it exports.

```js
const {capitalize} = require('./helpers');
const {name} = require('./data.json');

// Return written explicitely, but you could use
// babel-plugin-transform-last-statement to
// return it automatically
return `<h1>${capitalize(name)}</h1>`

function doSomething() {
  // Do something, but I'm unused
}
```

Will become

```js
const {capitalize} = require('./helpers');
const {name} = require('./data.json');

module.exports = function(data) {
  return `<h1>${capitalize(name)}</h1>`
}

function doSomething() {
  // Do something, but I'm unused
}
```

TODO
---

- [ ] Basic implementation
- [ ] Only activate if there's no top level explicit exports (ignore deep `module.exports`)
- [ ] Hoist imports
- [ ] Ignore functions & classes in top-level
- [ ] Configure function arguments (default `data`)


### Future

- [ ] Configure function name (default: anonymous)
- [ ] ES6 exports through option
- [ ] Automatic detection of ES6 vs CJS (existing `require` => CJS, existing `import` or `import()` => ES6)
- [ ] Handle deep `module.exports`? Probably useless as most new code will be ES6 modules anyways.
