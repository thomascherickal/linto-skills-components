const debug = require('debug')('linto:linto-components:template:node:dictionary-core')
const CoreNode = require('./core-node')
const connectNodeLabel = require('../data/label').nodeRedTemplates.connectCoreNode
const mqtt = require('../connect/mqtt')


class ConnectCoreNode extends CoreNode {
  constructor(node, config) {
    super(node, config)
    this.mqtt = new mqtt(this)
  }

  async configure(nodeComponentToLoad) {
    return new Promise(async (resolve, reject) => {
      onDeletedNode.call(this)
      resolve(this)
    })
  }
}

function onDeletedNode() {
  let clientMqtt = this.mqtt
  if (this.mqtt) {
    this.node.on('close', (remove, done) => {
      clientMqtt.close()
      done()
    })
  }
}

module.exports = ConnectCoreNode