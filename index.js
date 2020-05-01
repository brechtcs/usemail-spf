var { SPF } = require('spf-check')
var CustomError = require('custom-error-class')
var Reject = require('./lib/reject')

module.exports = function (opts = {}) {
  var reject = Reject(opts.reject).value()

  return async function spf (session, ctx) {
    var ip = session.remoteAddress
    var domain = session.hostNameAppearsAs
    var sender = session.envelope.mailFrom.address
    var validator = new SPF(domain, sender)

    ctx.spf = await validator.check(ip)

    if (reject.includes(ctx.spf.result)) {
      throw new SPFError(ctx.spf.message)
    }
  }
}

class SPFError extends CustomError {}
