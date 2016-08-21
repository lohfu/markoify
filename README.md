# rollup-plugin-marko

Compiles marko templates

## This is only a Proof of Concept!

WARNING!!! This is only a proof of concept, and is not yet fully tested.

## NPM

```
$ npm install rollup-plugin-marko
```

## Example

NOTE: You have to provide the `process` global for Marko to work outside of CommonJS
bundlers.

### process.js

```
window.process = {
  browser: true,
  env: {},
  nextTick: (fnc) => {
    setTimeout(fnc)
  }
}
```

### rollup.config.js

```
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import nodeGlobals from 'rollup-plugin-node-globals'
import marko from 'rollup-plugin-marko'

export default {
  plugins: [
    marko(),
    babel({
      exclude: 'node_modules/**'
    }),
    nodeResolve({
      jsnext: true,  // Default: false
      main: true,  // Default: true
      browser: true,  // Default: false
      preferBuiltins: false
    }),

    commonjs({
      include: [ 'node_modules/**', 'src/**/*.marko', 'src/**/*.marko.js'],
      extensions: [ '.js', '.marko' ],
      sourceMap: true
    }),
  ],
  entry: 'src/app.js'
  sourceMap: true,
  format: 'iife'
}
```


## TODO

+ Implement source maps correctly (but they are probably not even needed as
  long as this plugin is loaded first)
+ Currently this plugin only transforms `marko.js`, and `.marko` files. Ie, if there
  are any require.resolve('./template.marko') in other js files they will not be fixed
+ Async jobs for compiled nested templates (required templates)
+ Tests
