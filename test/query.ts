import { deepEqual, equal, notEqual, throws } from 'node:assert/strict'
import { test } from 'node:test'
import ObjectId from 'bson-objectid'

import qs2m from '../src'

test('query parsing', async t => {
  await t.test('basic querystring parsing =>', async t1 => {
    await t1.test('.criteria', async t2 => {
      await t2.test('should create criteria', () => {
        const results = qs2m('field=value')
        deepEqual(results.criteria, { field: 'value' })
      })
      await t2.test('should create numeric criteria', () => {
        const results = qs2m('i=10&f=1.2&z=0')
        deepEqual(results.criteria, { i: 10, f: 1.2, z: 0 })
      })
      await t2.test('should create boolean criteria', () => {
        const results = qs2m('t=true&f=false')
        deepEqual(results.criteria, { t: true, f: false })
      })
      await t2.test('should create regex criteria', () => {
        const results = qs2m('r=/regex/&ri=/regexi/i')
        deepEqual(results.criteria, { r: /regex/, ri: /regexi/i })
      })
      await t2.test('should create null criteria', () => {
        const results = qs2m('n=null')
        deepEqual(results.criteria, { n: null })
      })
      await t2.test('should create single ObjectId criteria', () => {
        const results = qs2m('_id=5c5ae131bd9cb400163fd555', { objectIdFields: ['_id'] })
        deepEqual(results.criteria, { _id: new ObjectId('5c5ae131bd9cb400163fd555') })
      })
      await t2.test('should not create ObjectId criteria from wrong hex string', () => {
        const results = qs2m('_id=5c5ae131bd9cb4001555', { objectIdFields: ['_id'] })
        deepEqual(results.criteria, { _id: '5c5ae131bd9cb4001555' })
      })
      await t2.test('should create ObjectId hex string', () => {
        const results = qs2m('_id=5c5ae131bd9cb400163fd555')
        deepEqual(results.criteria, { _id: '5c5ae131bd9cb400163fd555' })
      })
      await t2.test('should create multiple ObjectId criteria', () => {
        const results = qs2m(
          '_id=5c5ae131bd9cb400163fd555,5c409a06d7c8ac0f302ca914,5c0f7d0fccade990fc1786d6',
          { objectIdFields: ['_id'] },
        )
        const objectIds = [
          new ObjectId('5c5ae131bd9cb400163fd555'),
          new ObjectId('5c409a06d7c8ac0f302ca914'),
          new ObjectId('5c0f7d0fccade990fc1786d6'),
        ]
        notEqual(results.criteria._id, undefined)
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        ;(results.criteria?._id as any)?.$in.map((_id, index) => deepEqual(_id, objectIds[index]))
      })
      await t2.test('should create $ne criteria for negated values', () => {
        const results = qs2m('foo=!bar')
        deepEqual(results.criteria, { foo: { $ne: 'bar' } })
      })
      await t2.test('should create $not criteria for negated RegExp', () => {
        const results = qs2m('foo=!/bar/i')
        deepEqual(results.criteria, { foo: { $not: /bar/i } })
      })
      t2.test('should create Date string criteria from YYYY-MM', () => {
        const results = qs2m('d=2010-04')
        equal(typeof results.criteria.d === 'string', true, 'typeof string')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1)).toISOString() })
      })
      await t2.test('should create Date criteria from YYYY-MM', () => {
        const results = qs2m('d=2010-04', { dateFields: ['d'] })
        equal(results.criteria.d instanceof Date, true, 'instanceof Date')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1)) })
      })
      await t2.test('should create Date string criteria from YYYY-MM-DD', () => {
        const results = qs2m('d=2010-04-01')
        equal(typeof results.criteria.d === 'string', true, 'typeof string')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1)).toISOString() })
      })
      await t2.test('should create Date criteria from YYYY-MM-DD', () => {
        const results = qs2m('d=2010-04-01', { dateFields: ['d'] })
        equal(results.criteria.d instanceof Date, true, 'instanceof Date')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1)) })
      })
      await t2.test('should create Date string criteria from YYYY-MM-DDThh:mmZ', () => {
        const results = qs2m('d=2010-04-01T12:00Z')
        equal(typeof results.criteria.d === 'string', true, 'typeof string')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0)).toISOString() })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mmZ', () => {
        const results = qs2m('d=2010-04-01T12:00Z', { dateFields: ['d'] })
        equal(results.criteria.d instanceof Date, true, 'instanceof Date')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0)) })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mm:ssZ', () => {
        const results = qs2m('d=2010-04-01T12:00:30Z')
        equal(typeof results.criteria.d === 'string', true, 'typeof string')
        deepEqual(results.criteria, {
          d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30)).toISOString(),
        })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mm:ssZ', () => {
        const results = qs2m('d=2010-04-01T12:00:30Z', { dateFields: ['d'] })
        equal(results.criteria.d instanceof Date, true, 'instanceof Date')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30)) })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.sZ', () => {
        const results = qs2m('d=2010-04-01T12:00:30.250Z')
        equal(typeof results.criteria.d === 'string', true, 'typeof string')
        deepEqual(results.criteria, {
          d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)).toISOString(),
        })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.sZ', () => {
        const results = qs2m('d=2010-04-01T12:00:30.250Z', { dateFields: ['d'] })
        equal(results.criteria.d instanceof Date, true, 'instanceof Date')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)) })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.s-hh:mm', () => {
        const results = qs2m('d=2010-04-01T11:00:30.250-01:00')
        equal(typeof results.criteria.d === 'string', true, 'typeof string')
        deepEqual(results.criteria, {
          d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)).toISOString(),
        })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.s-hh:mm', () => {
        const results = qs2m('d=2010-04-01T11:00:30.250-01:00', { dateFields: ['d'] })
        equal(results.criteria.d instanceof Date, true, 'instanceof Date')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)) })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.s+hh:mm', () => {
        const results = qs2m(encodeURIComponent('d=2010-04-01T13:00:30.250+01:00'))
        equal(typeof results.criteria.d === 'string', true, 'typeof string')
        deepEqual(results.criteria, {
          d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)).toISOString(),
        })
      })
      await t2.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.s+hh:mm', () => {
        const results = qs2m(encodeURIComponent('d=2010-04-01T13:00:30.250+01:00'), {
          dateFields: ['d'],
        })
        equal(results.criteria.d instanceof Date, true, 'instanceof Date')
        deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)) })
      })
      await t2.test('should create $gt criteria', () => {
        const results = qs2m('field>value')
        deepEqual(results.criteria, { field: { $gt: 'value' } })
      })
      await t2.test('should create $lt criteria', () => {
        const results = qs2m('field<value')
        deepEqual(results.criteria, { field: { $lt: 'value' } })
      })
      await t2.test('should create $gte criteria', () => {
        const results = qs2m('field>=value')
        deepEqual(results.criteria, { field: { $gte: 'value' } })
      })
      await t2.test('should create $lte criteria', () => {
        const results = qs2m('field<=value')
        deepEqual(results.criteria, { field: { $lte: 'value' } })
      })
      await t2.test('should create $ne criteria', () => {
        const results = qs2m('field!=value')
        deepEqual(results.criteria, { field: { $ne: 'value' } })
      })
      await t2.test('should create $not criteria', () => {
        const results = qs2m('field!=/.*value*./i')
        deepEqual(results.criteria, { field: { $not: /.*value*./i } })
      })
      await t2.test('should create $gt criteria from value', () => {
        const results = qs2m('field=%3Evalue')
        deepEqual(results.criteria, { field: { $gt: 'value' } })
      })
      await t2.test('should create $lt criteria from value', () => {
        const results = qs2m('field=%3Cvalue')
        deepEqual(results.criteria, { field: { $lt: 'value' } })
      })
      await t2.test('should create $gte criteria from value', () => {
        const results = qs2m('field=%3E%3Dvalue')
        deepEqual(results.criteria, { field: { $gte: 'value' } })
      })
      await t2.test('should create $lte criteria from value', () => {
        const results = qs2m('field=%3C%3Dvalue')
        deepEqual(results.criteria, { field: { $lte: 'value' } })
      })
      await t2.test('should create $ne criteria from value', () => {
        const results = qs2m('field=%21%3Dvalue')
        deepEqual(results.criteria, { field: { $ne: 'value' } })
      })
      await t2.test('should create $not criteria from /.*value*./i', () => {
        const results = qs2m('field=%21%3D/.*value*./i')
        deepEqual(results.criteria, { field: { $not: /.*value*./i } })
      })
      await t2.test('should create $ne criteria from !value', () => {
        const results = qs2m('field=%21value')
        deepEqual(results.criteria, { field: { $ne: 'value' } })
      })
      await t2.test('should create $nin criteria from multiple !value', () => {
        const results = qs2m('field=%21a&field=%21b')
        deepEqual(results.criteria, { field: { $nin: ['a', 'b'] } })
      })
      await t2.test('should create $not criteria from !/.*value*./i', () => {
        const results = qs2m('field=%21/.*value*./i')
        deepEqual(results.criteria, { field: { $not: /.*value*./i } })
      })
      await t2.test('should create $in criteria', () => {
        const results = qs2m('field=a&field=b')
        deepEqual(results.criteria, { field: { $in: ['a', 'b'] } })
      })
      await t2.test('should create $nin criteria', () => {
        const results = qs2m('field!=a&field!=b')
        deepEqual(results.criteria, { field: { $nin: ['a', 'b'] } })
      })
      await t2.test('should create mixed criteria', () => {
        const results = qs2m('field!=10&field!=20&field>3')
        deepEqual(results.criteria, { field: { $nin: [10, 20], $gt: 3 } })
      })
      await t2.test('should create range criteria', () => {
        const results = qs2m('field>=10&field<=20')
        deepEqual(results.criteria, { field: { $gte: 10, $lte: 20 } })
      })
      await t2.test('should ignore criteria', () => {
        const results = qs2m('field=value&envelope=true&&offset=0&limit=10&fields=id&sort=name', {
          ignoredFields: ['envelope'],
        })
        notEqual(!!results.criteria.envelope, true, 'envelope')
        notEqual(!!results.criteria.skip, true, 'offset')
        notEqual(!!results.criteria.limit, true, 'limit')
        notEqual(!!results.criteria.fields, true, 'fields')
        notEqual(!!results.criteria.sort, true, 'sort')
        deepEqual(results.criteria, { field: 'value' })
      })
      await t2.test('should create $exists criteria from value', () => {
        const results = qs2m('a=&b=%21')
        deepEqual(results.criteria, { a: { $exists: true }, b: { $exists: false } })
      })
      await t2.test('should create $exists true criteria', () => {
        const results = qs2m('a&b=10&c', { ignoredFields: ['c'] })
        deepEqual(results.criteria, { a: { $exists: true }, b: 10 })
      })
      await t2.test('should create $exists false criteria', () => {
        const results = qs2m('!a&b=10&c', { ignoredFields: ['c'] })
        deepEqual(results.criteria, { a: { $exists: false }, b: 10 })
      })
      await t2.test('should create $type criteria with BSON type number', () => {
        const results = qs2m('field:type=2')
        deepEqual(results.criteria, { field: { $type: 2 } })
      })
      await t2.test('should create $type criteria with BSON type name', () => {
        const results = qs2m('field:type=string')
        deepEqual(results.criteria, { field: { $type: 'string' } })
      })
      await t2.test('should create $size criteria', () => {
        const results = qs2m('array:size=2')
        deepEqual(results.criteria, { array: { $size: 2 } })
      })
      await t2.test('should create $all criteria', () => {
        const results = qs2m('array:all=50,60')
        deepEqual(results.criteria, { array: { $all: [50, 60] } })
      })
      await t2.test('should throw on $where criteria', () => {
        throws(
          () => qs2m('array:where="while(true) {}"'),
          new Error('Use of the operator $where is forbidden to prevent NoSQL injections.'),
        )
      })
      await t2.test('should create $or criteria', () => {
        const results = qs2m('array:or=foo,bar')
        deepEqual(results.criteria, { $or: [{ array: 'foo' }, { array: 'bar' }] })
      })
      await t2.test('should create forced string criteria', () => {
        const results = qs2m("s='a,b'")
        deepEqual(results.criteria, { s: 'a,b' })
      })
      await t2.test('should create numeric criteria from YYYY exception', () => {
        const results = qs2m('d=2016')
        deepEqual(results.criteria, { d: 2016 })
      })
    })

    await t1.test('.options', async t2 => {
      await t2.test('should create paging options', () => {
        const results = qs2m('offset=8&limit=16')
        deepEqual(results.options, { skip: 8, limit: 16 })
      })
      await t2.test('should create field option', () => {
        const results = qs2m('fields=a,b,c')
        deepEqual(results.options, { projection: { a: 1, b: 1, c: 1 } })
      })
      await t2.test('should create field option', () => {
        const results = qs2m('fields=a&fields=b&fields=c')
        deepEqual(results.options, { projection: { a: 1, b: 1, c: 1 } })
      })
      await t2.test('should create omit option', () => {
        const results = qs2m('omit=b')
        deepEqual(results.options, { projection: { b: 0 } })
      })
      await t2.test('should create sort option', () => {
        const results = qs2m('sort=a,+b,-c')
        deepEqual(results.options, { sort: { a: 1, b: 1, c: -1 } })
      })
      await t2.test('should limit queries', () => {
        const results = qs2m('limit=100', { maxLimit: 50 })
        deepEqual(results.options, { limit: 50 })
      })
    })

    await t1.test('.options (altKeywords)', async t2 => {
      await t2.test('should create paging options', () => {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$offset=8&$limit=16', { parameters: altKeywords })
        deepEqual(results.options, { skip: 8, limit: 16 })
      })
      await t2.test('should create field option', () => {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$fields=a,b,c', { parameters: altKeywords })
        deepEqual(results.options, { projection: { a: 1, b: 1, c: 1 } })
      })
      await t2.test('should create omit option', () => {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$omit=b', { parameters: altKeywords })
        deepEqual(results.options, { projection: { b: 0 } })
      })
      await t2.test('should create sort option', () => {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$sort=a,+b,-c', { parameters: altKeywords })
        deepEqual(results.options, { sort: { a: 1, b: 1, c: -1 } })
      })
      await t2.test('should limit queries', () => {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$limit=100', { maxLimit: 50, parameters: altKeywords })
        deepEqual(results.options, { limit: 50 })
      })
    })
  })

  await t.test('advanced qs parsing =>', async t2 => {
    await t2.test('.criteria', async t3 => {
      await t3.test('should create criteria', () => {
        const results = qs2m('foo[bar]=value')
        deepEqual(results.criteria, { foo: { bar: 'value' } })
      })
      await t3.test('should create numeric criteria', () => {
        const results = qs2m('foo[i]=10&foo[f]=1.2&foo[z]=0')
        deepEqual(results.criteria, { foo: { i: 10, f: 1.2, z: 0 } })
      })
      await t3.test('should create boolean criteria', () => {
        const results = qs2m('foo[t]=true&foo[f]=false')
        deepEqual(results.criteria, { foo: { t: true, f: false } })
      })
      await t3.test('should create regex criteria', () => {
        const results = qs2m('foo[r]=/regex/&foo[ri]=/regexi/i')
        deepEqual(results.criteria, { foo: { r: /regex/, ri: /regexi/i } })
      })
      // can't create comparisons for embedded documents
      await t3.test("shouldn't ignore deep criteria", () => {
        const results = qs2m('field=value&foo[envelope]=true', { ignoredFields: ['envelope'] })
        deepEqual(results.criteria, { field: 'value', foo: { envelope: true } })
      })
      await t3.test('should create string criteria when forced with a quote', () => {
        const results = qs2m("a='10'&b='11'&c='a,b'&d=10,11&z=\"that's all folks\"")
        deepEqual(results.criteria, {
          a: '10',
          b: '11',
          c: 'a,b',
          d: { $in: [10, 11] },
          z: "that's all folks",
        })
      })
    })

    await t2.test('.options', async t3 => {
      await t3.test('should create paging options', () => {
        const results = qs2m('offset=8&limit=16')
        deepEqual(results.options, { skip: 8, limit: 16 })
      })
      await t3.test('should create field option', () => {
        const results = qs2m('fields=a,b,c')
        deepEqual(results.options, { projection: { a: 1, b: 1, c: 1 } })
      })
      await t3.test('should create sort option', () => {
        const results = qs2m('sort=a,+b,-c')
        deepEqual(results.options, { sort: { a: 1, b: 1, c: -1 } })
      })
      await t3.test('should limit queries', () => {
        const results = qs2m('limit=100', { maxLimit: 50 })
        deepEqual(results.options, { limit: 50 })
      })
    })

    await t2.test('#links', async t3 => {
      const links = qs2m('foo[bar]=baz&offset=20&limit=10', { maxLimit: 50 }).links(
        'http://localhost',
        100,
      )
      await t3.test('should create first link', () => {
        equal(links?.first, 'http://localhost?foo%5Bbar%5D=baz&offset=0&limit=10')
      })
      await t3.test('should create prev link', () => {
        equal(links?.prev, 'http://localhost?foo%5Bbar%5D=baz&offset=10&limit=10')
      })
      await t3.test('should create next link', () => {
        equal(links?.next, 'http://localhost?foo%5Bbar%5D=baz&offset=30&limit=10')
      })
      await t3.test('should create last link', () => {
        equal(links?.last, 'http://localhost?foo%5Bbar%5D=baz&offset=90&limit=10')
      })
    })
  })
})
