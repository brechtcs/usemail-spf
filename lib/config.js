var { Opt, hash, string } = require('stdopt')
var Reject = require('./reject')

class Config extends Opt {
  static parse (config) {
    config.token = string(config.token)
      .or(Math.random().toString(36).substring(2))
      .value()

    return hash(config, this.struct)
  }

  static get struct () {
    return {
      reject: Reject,
      token: string
    }
  }
}

module.exports = Config
