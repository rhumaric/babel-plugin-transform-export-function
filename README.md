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

- [x] Basic implementation
- [x] Only activate if there's no top `module.exports` call

### Future

- [ ] Hoist imports via `require`, ignore dynamic `require`
- [ ] Ignore functions & classes in top-level
- [ ] Configure function arguments (default `data`)
- [ ] Configure function name (default: anonymous)
- [ ] Named vs default export (default: default export)
- [ ] ES6 exports through option
- [ ] Automatic detection of ES6 vs CJS (existing `require` => CJS, existing `import` or `import()` => ES6)
