import { deepEqual, throws } from 'node:assert/strict'
import { test } from 'node:test'

import qs2m from '../src'

test('fulltext search parsing', async t => {
  await t.test(`should throw because of missing 'fullTextFields' parameter`, t2 => {
    throws(() => qs2m('q=BAZ'), new Error('Fulltext search is not enabled for this resource.'))
  })
  await t.test('should parse q parameter', t2 => {
    const results = qs2m('q=BAZ', { fullTextFields: 'foo' })
    deepEqual(results.criteria, { $or: [{ foo: 'BAZ' }] })
  })
  await t.test('should parse only top level q parameter', t2 => {
    const results = qs2m('foo.q=BAZ')

    deepEqual(results.criteria, { 'foo.q': 'BAZ' })
  })
  await t.test('should add multiple text fields to q search', t2 => {
    const results = qs2m('q=BAZ', { fullTextFields: ['foo', 'bar', 'ncl'] })

    deepEqual(results.criteria, { $or: [{ foo: 'BAZ' }, { bar: 'BAZ' }, { ncl: 'BAZ' }] })
  })

  await t.test('should add an array of multiple text fields to q search', t2 => {
    const results = qs2m('q=BAZ,FOO,NCL', { fullTextFields: ['foo', 'bar', 'ncl'] })

    deepEqual(results.criteria, {
      $or: [
        { foo: { $in: ['BAZ', 'FOO', 'NCL'] } },
        { bar: { $in: ['BAZ', 'FOO', 'NCL'] } },
        { ncl: { $in: ['BAZ', 'FOO', 'NCL'] } },
      ],
    })
  })
  await t.test('should convert RegExp to q search', t2 => {
    const results = qs2m('q=/bar/i', { fullTextFields: ['foo'] })

    deepEqual(results.criteria, { $or: [{ foo: /bar/i }] })
  })
  await t.test('should split spaces in RegExp and convert to muliple q search', t2 => {
    const results = qs2m('q=/bar baz /i', { fullTextFields: ['foo'] })

    deepEqual(results.criteria, { $or: [{ $and: [{ foo: /bar/i }, { foo: /baz/i }] }] })
  })
  await t.test('should convert Date to q search', t2 => {
    const results = qs2m('q=2010-04', { fullTextFields: ['foo'], dateFields: 'foo' })

    deepEqual(results.criteria, { $or: [{ foo: new Date(Date.UTC(2010, 3, 1)) }] })
  })
  await t.test('should add Date string to q search', t2 => {
    const results = qs2m('q=2010-04', { fullTextFields: 'foo' })

    deepEqual(results.criteria, { $or: [{ foo: new Date(Date.UTC(2010, 3, 1)).toISOString() }] })
  })
  await t.test('should add unparsed  string to q search', t2 => {
    const results = qs2m('q="2010-04"', { fullTextFields: 'foo' })

    deepEqual(results.criteria, { $or: [{ foo: '2010-04' }] })
  })
})
