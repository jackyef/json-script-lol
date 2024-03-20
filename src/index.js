#!/usr/bin/env node

const path = require('path')

const jsonPath = process.argv[2]
const json = require(path.resolve(process.cwd(), jsonPath))

const main = json.main

;(async () => {
  if (json.$procedures) {
    Object.keys(json.$procedures).forEach(key => {
      const proc = json.$procedures[key]
      eval(`
        $$_${key} = function(${proc.params.join(', ')}) {
          ${proc.run.join('\n')}
        }
      `)
    })
  }

  if (main.with) {
    const rss = json[main.with]
    const resource = await fetch(rss.url).then(res => res.json())
    
    if (rss.construct) {
      Object.keys(rss.construct).forEach(key => {
        const paths = rss.construct[key].split('.')
        global[key] = paths.reduce((acc, path) => acc[path], resource)
      })
    }
  }
  
  eval(main.run.join('\n'))
})()
