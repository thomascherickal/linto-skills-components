const debug = require('debug')('linto:linto-components:connect:mqtt')
const Mqtt = require('mqtt')

const { HostUndefined, TopicScopeUndefined, WrongFormat } = require('../exception/connect')
const mqttLabel = require('../data/label').connect.mqtt

const KEEPALIVE = 2
const QOS = 2 // MQTT ensures that it will be received with no duplicates

class ConnectorMqtt {
  constructor(node) {
    this.node = node

    this.mqttConfig = {
      clean: true,
      servers: [],
      keepalive: KEEPALIVE, //can live for LOCAL_MQTT_KEEP_ALIVE seconds without a single message sent on broker
      reconnectPeriod: Math.floor(Math.random() * 1000) + 1000, // ms for reconnect,
      qos: QOS
    }

    this.topicSubscribe = []
  }
  async connect(flowMqttConfig) {
    let node = this.node

    let host = flowMqttConfig.host
    let port = flowMqttConfig.port

    if (!host || !port) {
      throw new HostUndefined(mqttLabel.hostUndefined)
    }
    this.mqttConfig.servers.push({
      host,
      port
    })

    let mqttConfig = this.mqttConfig

    if (flowMqttConfig.user && flowMqttConfig.password) {
      mqttConfig.username = flowMqttConfig.user
      mqttConfig.password = flowMqttConfig.password
    }

    return new Promise((resolve, reject) => {
      if (!this.client) { // Allow one connection by node component
        this.client = Mqtt.connect(mqttConfig)

        this.client.on('error', e => {
          console.error(`${mqttLabel.brokerError} : ${e}`)
          this.client.end()
          reject(`${mqttLabel.brokerError} : ${e}`)
        })

        let mqttConnectError = setTimeout(() => {
          console.error(mqttLabel.brokerErrorConnect)
          node.sendStatus('red', 'ring', mqttLabel.brokerErrorConnect)
          reject(mqttLabel.brokerErrorConnect)
        }, 2000)

        this.client.once('connect', () => {
          clearTimeout(mqttConnectError)

          this.client.on('offline', () => {
            console.error(mqttLabel.brokerDisconnected)
            node.sendStatus('red', 'ring', mqttLabel.brokerDisconnected)
          })
          resolve(this)
        })
      } else {
        resolve(this)
      }
    })
  }

  onMessage(handler, topicFilter) {
    this.client.on('message', (topic, payload) => {
      const [_clientCode, _channel, _sn, _etat, _type, _id] = topic.split('/')
      if (topicFilter.indexOf(_etat) > -1) {
        handler(topic, payload)
      }
    })
  }

  publish(topic, payload) {
    let node = this.node
    this.client.publish(topic, payload, (err) => {
      if (err) {
        console.error(err)
        node.sendStatus('red', 'ring', mqttLabel.brokerErrorConnect)
      }
    })
  }

  subscribeToLinto(topicScope, ids = [], topicAction) {
    // this function should subscribe to a topic : ${topicScope}/${ids - serialnumber}/${topicAction}
    if (topicScope === undefined)
      throw new TopicScopeUndefined('Topic is undefined')

    if (topicAction === undefined)
      topicAction = '#'

    if (typeof ids === 'string') {
      this.topicSubscribe.push(`${topicScope}/${ids}/${topicAction}`)
    } else if (Array.isArray(ids)) {
      for (let linto of ids) {
        this.topicSubscribe.push(`${topicScope}/${linto.id}/${topicAction}`)
      }
    } else {
      console.error(mqttLabel.subscribeRequireParam)
      throw new WrongFormat(mqttLabel.subscribeRequireParam)
    }

    // Client is already connected, require to trigger the first subscribe
    for (let topic of this.topicSubscribe) {
      onSubscribe.call(this, topic)
    }

    this.client.on('connect', () => { // Is require to manage only one subscribe to a specific topic
      for (let topic of this.topicSubscribe) {
        onSubscribe.call(this, topic)
      }
    })
  }

  close() {
    this.client.end()
  }
}

function onSubscribe(toSubscribe) {
  let node = this.node
  this.client.unsubscribe(toSubscribe, (err) => {

    if (err) {
      debug(mqttLabel.unsubscribe, err)
    }

    this.client.subscribe(toSubscribe, (err) => {
      if (!err) {
        node.sendStatus('green', 'ring', mqttLabel.connect)
        debug(`${mqttLabel.subscribe} ${toSubscribe}`)
      } else {
        console.error(`${mqttLabel.subscribeError} ${toSubscribe} : ${err}`)
      }
    })
  })
}

module.exports = ConnectorMqtt