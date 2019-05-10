import { test } from 'tap'
import { iso8601 } from '../src/convert/iso8601'

test('iso8601-regex', function(t) {
  t.test('should match YYYY', function(t1) {
    t1.ok(iso8601.test('2000'))
    t1.end()
  })
  t.test('should match YYYY-MM', function(t1) {
    t1.ok(iso8601.test('2000-04'))
    t1.end()
  })
  t.test('should match YYYY-MM-DD', function(t1) {
    t1.ok(iso8601.test('2000-04-01'))
    t1.end()
  })
  t.test('should match YYYY-MM-DDThh:mmZ', function(t1) {
    t1.ok(iso8601.test('2000-04-01T12:00Z'), 'Z')
    t1.ok(iso8601.test('2000-04-01T12:00-08:00'), '-08:00')
    t1.ok(iso8601.test('2000-04-01T12:00+01:00'), '+01:00')
    t1.end()
  })
  t.test('should match YYYY-MM-DDThh:mm:ssZ', function(t1) {
    t1.ok(iso8601.test('2000-04-01T12:00:30Z'), 'Z')
    t1.ok(iso8601.test('2000-04-01T12:00:30-08:00'), '-08:00')
    t1.ok(iso8601.test('2000-04-01T12:00:30+01:00'), '+01:00')
    t1.end()
  })
  t.test('should match YYYY-MM-DDThh:mm:ss.sZ', function(t1) {
    t1.ok(iso8601.test('2000-04-01T12:00:30.250Z'), 'Z')
    t1.ok(iso8601.test('2000-04-01T12:00:30.250-08:00'), '-08:00')
    t1.ok(iso8601.test('2000-04-01T12:00:30.250+01:00'), '+01:00')
    t1.end()
  })
  t.test('should not match time without timezone', function(t1) {
    t1.notOk(iso8601.test('2000-04-01T12:00'), 'hh:mm')
    t1.notOk(iso8601.test('2000-04-01T12:00:00'), 'hh:mm:ss')
    t1.notOk(iso8601.test('2000-04-01T12:00:00.000'), 'hh:mm:ss.s')
    t1.end()
  })
  t.test('should not match out of range month', function(t1) {
    t1.notOk(iso8601.test('2000-00'), '00')
    t1.notOk(iso8601.test('2000-13'), '13')
    t1.end()
  })
  t.test('should not match out of range day', function(t1) {
    t1.notOk(iso8601.test('2000-04-00'), '00')
    t1.notOk(iso8601.test('2000-04-32'), '32')
    t1.end()
  })
  t.test('should not match out of range hour', function(t1) {
    t1.notOk(iso8601.test('2000-04-01T24:00Z'))
    t1.end()
  })
  t.test('should not match out of range minute', function(t1) {
    t1.notOk(iso8601.test('2000-04-01T12:60Z'))
    t1.end()
  })
  t.test('should not match out of range second', function(t1) {
    t1.notOk(iso8601.test('2000-04-01T12:00:60Z'))
    t1.end()
  })
  t.test('should not match time without timezone', function(t1) {
    t1.notOk(iso8601.test('2000-04-01T12:00'), 'hh:mm')
    t1.notOk(iso8601.test('2000-04-01T12:00:00'), 'hh:mm:ss')
    t1.notOk(iso8601.test('2000-04-01T12:00:00.000'), 'hh:mm:ss.s')
    t1.end()
  })
  t.end()
})
