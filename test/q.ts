import { test } from 'tap'
import qs2m from '../src'

test('fulltext search parsing', function(t) {
  t.test(`should throw because of missing 'fullTextFields' parameter`, function(t2) {
    t2.throws(() => qs2m('q=BAZ'), 'Fulltext search is not enabled for this resource.')
    t2.end()
  })
  t.test(`should parse q parameter`, function(t2) {
    const results = qs2m('q=BAZ', { fullTextFields: 'foo' })
    t2.ok(results.criteria)
    t2.deepEqual(results.criteria, { $or: [{ foo: 'BAZ' }] })
    t2.end()
  })
  t.test(`should parse only top level q parameter`, function(t2) {
    const results = qs2m('foo.q=BAZ')
    t2.ok(results.criteria)
    t2.deepEqual(results.criteria, { 'foo.q': 'BAZ' })
    t2.end()
  })
  t.test(`should add multiple text fields to q search`, function(t2) {
    const results = qs2m('q=BAZ', { fullTextFields: ['foo', 'bar', 'ncl'] })
    t2.ok(results.criteria)
    t2.deepEqual(results.criteria, { $or: [{ foo: 'BAZ' }, { bar: 'BAZ' }, { ncl: 'BAZ' }] })
    t2.end()
  })
  t.test(`should add an array of multiple text fields to q search`, function(t2) {
    const results = qs2m('q=BAZ,FOO,NCL', { fullTextFields: ['foo', 'bar', 'ncl'] })
    t2.ok(results.criteria)
    t2.deepEqual(results.criteria, {
      $or: [
        { foo: { $in: ['BAZ', 'FOO', 'NCL'] } },
        { bar: { $in: ['BAZ', 'FOO', 'NCL'] } },
        { ncl: { $in: ['BAZ', 'FOO', 'NCL'] } },
      ],
    })
    t2.end()
  })
  t.test(`should convert RegExp to q search`, function(t2) {
    const results = qs2m('q=/bar/i', { fullTextFields: ['foo'] })
    t2.ok(results.criteria)
    t2.deepEqual(results.criteria, { $or: [{ foo: /bar/i }] })
    t2.end()
  })
  t.test(`should convert Date to q search`, function(t2) {
    const results = qs2m('q=2010-04', { fullTextFields: ['foo'], dateFields: 'foo' })
    t2.ok(results.criteria)
    t2.deepEqual(results.criteria, { $or: [{ foo: new Date(Date.UTC(2010, 3, 1)) }] })
    t2.end()
  })
  t.test(`should add Date string to q search`, function(t2) {
    const results = qs2m('q=2010-04', { fullTextFields: 'foo' })
    t2.ok(results.criteria)
    t2.deepEqual(results.criteria, { $or: [{ foo: new Date(Date.UTC(2010, 3, 1)).toISOString() }] })
    t2.end()
  })
  t.test(`should add unparsed  string to q search`, function(t2) {
    const results = qs2m('q="2010-04"', { fullTextFields: 'foo' })
    t2.ok(results.criteria)
    t2.deepEqual(results.criteria, { $or: [{ foo: '2010-04' }] })
    t2.end()
  })
  t.end()
})
