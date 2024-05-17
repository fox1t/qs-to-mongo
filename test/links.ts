import { equal } from 'node:assert/strict'
import { test } from 'node:test'

import qs2m from '../src'

test('query-to-mongo(query).links =>', async t => {
  const links = qs2m('offset=20&limit=10').links('http://localhost', 95)
  await t.test('should create first link', t3 => {
    equal(links?.first, 'http://localhost?offset=0&limit=10')
  })
  await t.test('should create prev link', t3 => {
    equal(links?.prev, 'http://localhost?offset=10&limit=10')
  })
  await t.test('should create next link', t3 => {
    equal(links?.next, 'http://localhost?offset=30&limit=10')
  })
  await t.test('should create last link', t3 => {
    equal(links?.last, 'http://localhost?offset=90&limit=10')
  })

  await t.test('should return null if totalCount equals 0', () => {
    const links2 = qs2m('offset=20&limit=10').links('http://localhost', 0)
    equal(links2, null)
  })
  await t.test('with no pages', async t1 => {
    const links2 = qs2m('offset=0&limit=100').links('http://localhost', 95)
    await t1.test('should not create links', t4 => {
      equal(links2?.first, undefined)
      equal(links2?.last, undefined)
      equal(links2?.next, undefined)
      equal(links2?.prev, undefined)
    })
  })
  await t.test('when on first page', async t1 => {
    const links2 = qs2m('offset=0&limit=10').links('http://localhost', 95)
    await t1.test('should not create prev link', () => {
      equal(links2?.prev, undefined)
    })
    await t1.test('should not create first link', () => {
      equal(links2?.first, undefined)
    })
    await t1.test('should create next link', () => {
      equal(links2?.next, 'http://localhost?offset=10&limit=10')
    })
    await t1.test('should create last link', () => {
      equal(links2?.last, 'http://localhost?offset=90&limit=10')
    })
  })
  await t.test('when on last page', async t1 => {
    const links2 = qs2m('offset=90&limit=10').links('http://localhost', 95)
    await t1.test('should not create next link', t4 => {
      equal(links2?.next, undefined)
    })
    await t1.test('should not create last link', t4 => {
      equal(links2?.last, undefined)
    })
    await t1.test('should create prev link', t4 => {
      equal(links2?.prev, 'http://localhost?offset=80&limit=10')
    })
    await t1.test('should not create first link', t4 => {
      equal(links2?.first, 'http://localhost?offset=0&limit=10')
    })
  })
})
