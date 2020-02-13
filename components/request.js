const debug = require('debug')('linto:linto-components:components:request')
const request = require('request')

class Request {

  async get(url, token) {
    let options = {
      url
    }
    token ? options.headers = { authorization: token } : null

    return new Promise((resolve, reject) => {
      try {
        request.get(options, function (error, response, body) {
          if (error) {
            reject(error)
          }
          resolve(body)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async post(url, form, token) {
    let options = {
      url,
      ...form
    }
    token && options.headers ? options.headers = {} : null
    token ? options.headers.authorization = token : null

    return new Promise((resolve, reject) => {
      try {
        request.post(options, function (error, response, body) {
          if (error) {
            reject(error)
          }
          resolve(body)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async custom(options, customHandler) {
    request(options, customHandler)
  }
}

module.exports = new Request()