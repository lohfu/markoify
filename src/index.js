'use strict'

const p = require('path')
const esprima = require('esprima')
const escodegen = require('escodegen')
const estraverse = require('estraverse')
//const fs = require('fs')
const compiler = require('marko/compiler')
//const raptorAsync = require('raptor-async')

const { createFilter } = require('rollup-pluginutils')

const parseOpts = {}

//function addCompileJob(asyncJobs, sourceFile) {
//  const outFile = sourceFile + '.js'
//
//  asyncJobs.push((callback) => {
//    compiler.compileFile(sourceFile, (err, src) => {
//      if (err) {
//        callback(err)
//        return
//      }
//
//      fs.writeFile(outFile, src, {
//        encoding: 'utf8'
//      }, callback)
//    })
//  })
//}

function transformAST(file, input, callback) {
  const ast = esprima.parse(input, parseOpts)

  const templatePaths = []

  estraverse.traverse(ast, {
    enter: (node, parent) => {
      let path
      let ext

      if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'c' &&
          node.arguments.length === 1 &&
          node.arguments[0].type === 'Identifier' &&
          node.arguments[0].name === '__filename'
      ) {
        node.arguments = [{
          'type': 'Literal',
          'value': file
        }]
      } else if (node.type === 'CallExpression' &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments.length === 1 &&
          node.arguments[0].type === 'Literal') {
        path = node.arguments[0].value
        ext = p.extname(path)

        if (ext === '.marko') {
          templatePaths.push({
            path: path,
            node: node
          })

          node.arguments[0] = {
            'type': 'Literal',
            'value': path
          }
        }
      } else if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'require' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'resolve' &&
          node.arguments.length === 1 &&
          node.arguments[0].type === 'Literal') {
        path = node.arguments[0].value
        ext = p.extname(path)

        if (ext === '.marko') {
          templatePaths.push({
            path: path,
            node: node
          })

          node.callee = {
            'type': 'Identifier',
            'name': 'require'
          }

          node.arguments = [
            {
              'type': 'Literal',
              'value': path
            }
          ]
        }
      }
    }
  })

  //const asyncJobs = []

  //const dirname = p.dirname(file)

  //for (let i = 0, len = templatePaths.length; i < len; i++) {
  //  const templatePath = p.resolve(dirname, templatePaths[i].path)
  //  addCompileJob(asyncJobs, templatePath)
  //}

  const code = escodegen.generate(ast)

  return code

  //raptorAsync.parallel(asyncJobs, (err) => {
  //  if (err) {
  //    return callback(err)
  //  }

  //  callback(null, code)
  //})
}

module.exports = function transform(options = {}) {
  const filter = createFilter(options.include || [ '**/*.marko', '**/*.marko.js' ])

  return {
    name: 'marko',
    transform(code, file) {
      if (!filter(file))
        return null

      if (/.marko$/.test(file))
        code = compiler.compile(code, file)

      return {
        code: transformAST(file, code),
        map: { mappings: '' }
      }
    }
  }
}
