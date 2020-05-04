var { Opt, hash } = require('stdopt')
var { SPF } = require('spf-check')
var CustomError = require('custom-error-class')
var Reject = require('./lib/reject')

var OPTS_ERR = 'Invalid option for `usemail-spf`'

module.exports = function (opts = {}) {
  var { reject } = new Config(opts).catch(OPTS_ERR).value()

  return async function spf (sender, session, ctx) {
    if (!ctx || ctx.phase !== 'from') {
      throw new Error('SPF should be run in `from` phase')
    }
    var ip = session.remoteAddress
    var domain = session.hostNameAppearsAs
    var validator = new SPF(domain, sender.address)

    ctx.spf = await validator.check(ip)

    if (reject.includes(ctx.spf.result)) {
      throw new SPFError(ctx.spf.message)
    }
  }
}

class SPFError extends CustomError {}

class Config extends Opt {
  static parse (config) {
    return hash(config, this.struct)
  }

  static get struct () {
    return { reject: Reject }
  }
}
