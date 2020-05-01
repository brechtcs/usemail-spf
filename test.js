var { sendMail } = require('usemail-test-utils')
var Reject = require('./lib/reject')
var spf = require('./')
var test = require('tape')
var usemail = require('usemail')

test('default settings', async function (t) {
  var server = usemail({ authOptional: true })
  server.use(spf())
  server.use(verify)

  function verify ({ envelope }, ctx) {
    t.equal(envelope.mailFrom.address, 'me@localhost')
    t.notEqual(envelope.mailFrom.address, 'some@example.com')
    t.ok(ctx.spf)
    t.ok(ctx.spf.result)
  }

  await server.listen()
  await sendMail(server.port, { from: 'me@localhost' })
  await sendMail(server.port).catch(err => t.ok(err))

  server.close()
  t.end()
})

test('reject more', async function (t) {
  var reject = ['Fail', 'None']
  var server = usemail({ authOptional: true })
  server.use(spf({ reject }))
  server.use(() => t.fail())

  server.on('bye', function (session, ctx) {
    t.ok(ctx.internalError)
    t.ok(ctx.internalError.message)
    t.equal(ctx.internalError.name, 'SPFError')
    t.equal(ctx.spf.result, 'None')
  })

  var from = 'me@localhost'
  await server.listen()
  await sendMail(server.port, { from }).catch(err => t.ok(err))

  server.close()
  t.end()
})

test('reject less', async function (t) {
  var server = usemail({ authOptional: true })
  server.use(spf({ reject: false }))
  server.use(verify)

  function verify (session, ctx) {
    t.ok(ctx.spf)
    t.ok(ctx.spf.message)
    t.equal(ctx.spf.result, 'Fail')
  }

  await server.listen()
  await sendMail(server.port)

  server.close()
  t.end()
})

test('validate reasons', function (t) {
  t.deepEqual(Reject(true).value(), ['Fail'])
  t.deepEqual(Reject(false).value(), [])
  t.deepEqual(Reject('Fail').value(), ['Fail'])
  t.deepEqual(Reject(['Fail', 'SoftFail']).value(), ['Fail', 'SoftFail'])
  t.throws(() => Reject(['Fail', 'Invalid']).value())
  t.throws(() => Reject('Invalid').value())
  t.throws(() => Reject(NaN).value())
  t.end()
})
