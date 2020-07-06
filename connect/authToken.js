const debug = require('debug')('linto:linto-components:connect:authToken')

const authTokenLabel = require('../data/label').connect.authToken

const request = require("request")

let options

class AuthToken {
  constructor() {
  }

  init(host) {
    options = {
      method: 'GET',
      url: host,
    }
    return this
  }

  async checkToken(token) {
    token ? options.headers = { authorization: token } : null
    return new Promise((resolve, reject) => {
      try {
        request.get(options, function (error, response, body) {
          if (error) {
            reject(error)
          }
          resolve(response.statusCode)
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
module.exports = new AuthToken()