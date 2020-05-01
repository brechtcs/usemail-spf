var Opt = require('stdopt')
var reasons = [
  'None',
  'Neutral',
  'Fail',
  'SoftFail',
  'TempError',
  'PermError'
]

class Reason extends Opt {
  static parse (reason) {
    if (reasons.includes(reason)) return reason
  }
}

module.exports = Opt.construct(Reason)
