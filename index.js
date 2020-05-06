var { Opt, hash, string } = require('stdopt')
var { SPF } = require('spf-check')
var CustomError = require('custom-error-class')
var Reject = require('./lib/reject')

var OPTS_ERR = 'Invalid option for `usemail-spf`'

module.exports = function (opts = {}) {
  var conf = new Config(opts).catch(OPTS_ERR).value()

  return async function spf (session, sender) {
    if (session.phase !== 'from') {
      throw new Error('SPF plugin should run in `from` phase')
    }
    var ip = session.remoteAddress
    var domain = session.remoteHost
    var validator = new SPF(domain, sender.address)
    var result = await validator.check(ip)

    session.set('spf', result, conf.token)

    if (conf.reject.includes(result.result)) {
      return session.end(new SPFError(result.message), true)
    }
  }
}

class SPFError extends CustomError {}

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
