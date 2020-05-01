var Opt = require('stdopt')
var Reason = require('./reason')

class Reject extends Opt {
  static parse (reject) {
    if (reject === true || Opt.nothing(reject).isValid) {
      return ['Fail']
    } else if (reject === false) {
      return []
    }
    return Opt.list(reject, Reason)
  }
}

module.exports = Opt.construct(Reject)
