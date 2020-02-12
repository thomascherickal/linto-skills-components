const debug = require('debug')('linto:linto-components:connect:authToken')

const authTokenLabel = require('../data/label').connect.authToken

class AuthToken {
  constructor() {
  }

  init() {
    debug(authTokenLabel.initNotSupported)
    return this
  }

  isValid() {
    debug(authTokenLabel.notSupported)
    return true
  }

}
module.exports = new AuthToken()