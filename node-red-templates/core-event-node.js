const debug = require('debug')('linto:linto-components:template:node:core-event')
const fs = require('fs')

const Node = require('./node')
const wireNode = require('../components/wire-node')
const wireEvent = require('../components/wire-event')

const nodeType = require('../data/type-node')

class LintoCoreEventNode extends Node {
  constructor(RED, node, config) {
    super(node, config)
    this.nodeType = nodeType.CORE

    this.wireNode = wireNode
    this.wireEvent = wireEvent.init(RED)
  }

  async loadModule(modulePath) {
    if (fs.existsSync(`${modulePath}.js`)) {
      return require(modulePath)
    }
    return undefined
  }

  notifyEventError(topic, say, error) {
    this.wireEvent.notify(`${this.node.z}-${this.wireEvent.getOutputName()}`, {
      topic,
      payload: {
        say,    //phonetic and text
        error   // message and code
      }
    })
  }
}

module.exports = LintoCoreEventNode