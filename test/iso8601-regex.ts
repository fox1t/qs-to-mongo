import { equal } from 'node:assert/strict'
import { test } from 'node:test'

import { iso8601 } from '../src/convert/iso8601'

test('iso8601-regex', async t => {
  await t.test('should match YYYY', () => {
    equal(iso8601.test('2000'), true)
  })
  await t.test('should match YYYY-MM', () => {
    equal(iso8601.test('2000-04'), true)
  })
  await t.test('should match YYYY-MM-DD', () => {
    equal(iso8601.test('2000-04-01'), true)
  })
  await t.test('should match YYYY-MM-DDThh:mmZ', () => {
    equal(iso8601.test('2000-04-01T12:00Z'), true, 'Z')
    equal(iso8601.test('2000-04-01T12:00-08:00'), true, '-08:00')
    equal(iso8601.test('2000-04-01T12:00+01:00'), true, '+01:00')
  })
  await t.test('should match YYYY-MM-DDThh:mm:ssZ', () => {
    equal(iso8601.test('2000-04-01T12:00:30Z'), true, 'Z')
    equal(iso8601.test('2000-04-01T12:00:30-08:00'), true, '-08:00')
    equal(iso8601.test('2000-04-01T12:00:30+01:00'), true, '+01:00')
  })
  await t.test('should match YYYY-MM-DDThh:mm:ss.sZ', () => {
    equal(iso8601.test('2000-04-01T12:00:30.250Z'), true, 'Z')
    equal(iso8601.test('2000-04-01T12:00:30.250-08:00'), true, '-08:00')
    equal(iso8601.test('2000-04-01T12:00:30.250+01:00'), true, '+01:00')
  })
  await t.test('should not match time without timezone', () => {
    equal(iso8601.test('2000-04-01T12:00'), false, 'hh:mm')
    equal(iso8601.test('2000-04-01T12:00:00'), false, 'hh:mm:ss')
    equal(iso8601.test('2000-04-01T12:00:00.000'), false, 'hh:mm:ss.s')
  })
  await t.test('should not match out of range month', () => {
    equal(iso8601.test('2000-00'), false, '00')
    equal(iso8601.test('2000-13'), false, '13')
  })
  await t.test('should not match out of range day', () => {
    equal(iso8601.test('2000-04-00'), false, '00')
    equal(iso8601.test('2000-04-32'), false, '32')
  })
  await t.test('should not match out of range hour', () => {
    equal(iso8601.test('2000-04-01T24:00Z'), false)
  })
  await t.test('should not match out of range minute', () => {
    equal(iso8601.test('2000-04-01T12:60Z'), false)
  })
  await t.test('should not match out of range second', () => {
    equal(iso8601.test('2000-04-01T12:00:60Z'), false)
  })
  await t.test('should not match time without timezone', () => {
    equal(iso8601.test('2000-04-01T12:00'), false, 'hh:mm')
    equal(iso8601.test('2000-04-01T12:00:00'), false, 'hh:mm:ss')
    equal(iso8601.test('2000-04-01T12:00:00.000'), false, 'hh:mm:ss.s')
  })
})
