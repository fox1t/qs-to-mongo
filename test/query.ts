import { test } from 'tap'
import ObjectId from 'bson-objectid'
import qs2m from '../src'

test('query parsing', function (t) {
  t.test('basic querystring parsing =>', function (t2) {
    t2.test('.criteria', function (t3) {
      t3.test('should create criteria', function (t4) {
        const results = qs2m('field=value')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: 'value' })
        t4.end()
      })
      t3.test('should create numeric criteria', function (t4) {
        const results = qs2m('i=10&f=1.2&z=0')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { i: 10, f: 1.2, z: 0 })
        t4.end()
      })
      t3.test('should create boolean criteria', function (t4) {
        const results = qs2m('t=true&f=false')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { t: true, f: false })
        t4.end()
      })
      t3.test('should create regex criteria', function (t4) {
        const results = qs2m('r=/regex/&ri=/regexi/i')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { r: /regex/, ri: /regexi/i })
        t4.end()
      })
      t3.test('should create null criteria', function (t4) {
        const results = qs2m('n=null')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { n: null })
        t4.end()
      })
      t3.test('should create single ObjectId criteria', function (t4) {
        const results = qs2m('_id=5c5ae131bd9cb400163fd555', { objectIdFields: ['_id'] })
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { _id: new ObjectId('5c5ae131bd9cb400163fd555') })
        t4.end()
      })
      t3.test('should not create ObjectId criteria from wrong hex string', function (t4) {
        const results = qs2m('_id=5c5ae131bd9cb4001555', { objectIdFields: ['_id'] })
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { _id: '5c5ae131bd9cb4001555' })
        t4.end()
      })
      t3.test('should create ObjectId hex string', function (t4) {
        const results = qs2m('_id=5c5ae131bd9cb400163fd555')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { _id: '5c5ae131bd9cb400163fd555' })
        t4.end()
      })
      t3.test('should create multiple ObjectId criteria', function (t4) {
        const results = qs2m(
          '_id=5c5ae131bd9cb400163fd555,5c409a06d7c8ac0f302ca914,5c0f7d0fccade990fc1786d6',
          { objectIdFields: ['_id'] },
        )
        const objectIds = [
          new ObjectId('5c5ae131bd9cb400163fd555'),
          new ObjectId('5c409a06d7c8ac0f302ca914'),
          new ObjectId('5c0f7d0fccade990fc1786d6'),
        ]
        t4.ok(results.criteria)
        t4.ok(results.criteria._id)

        results.criteria._id.$in.map((_id, index) => t4.deepEqual(_id, objectIds[index]))
        t4.end()
      })
      t3.test('should create $ne criteria for negated values', function (t4) {
        const results = qs2m('foo=!bar')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { foo: { $ne: 'bar' } })
        t4.end()
      })
      t3.test('should create $not criteria for negated RegExp', function (t4) {
        const results = qs2m('foo=!/bar/i')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { foo: { $not: /bar/i } })
        t4.end()
      })
      t3.test('should create Date string criteria from YYYY-MM', function (t4) {
        const results = qs2m('d=2010-04')
        t4.ok(results.criteria)
        t4.ok(typeof results.criteria.d === 'string', 'typeof string')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1)).toISOString() })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM', function (t4) {
        const results = qs2m('d=2010-04', { dateFields: ['d'] })
        t4.ok(results.criteria)
        t4.ok(results.criteria.d instanceof Date, 'instanceof Date')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1)) })
        t4.end()
      })
      t3.test('should create Date string criteria from YYYY-MM-DD', function (t4) {
        const results = qs2m('d=2010-04-01')
        t4.ok(results.criteria)
        t4.ok(typeof results.criteria.d === 'string', 'typeof string')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1)).toISOString() })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DD', function (t4) {
        const results = qs2m('d=2010-04-01', { dateFields: ['d'] })
        t4.ok(results.criteria)
        t4.ok(results.criteria.d instanceof Date, 'instanceof Date')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1)) })
        t4.end()
      })
      t3.test('should create Date string criteria from YYYY-MM-DDThh:mmZ', function (t4) {
        const results = qs2m('d=2010-04-01T12:00Z')
        t4.ok(results.criteria)
        t4.ok(typeof results.criteria.d === 'string', 'typeof string')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0)).toISOString() })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mmZ', function (t4) {
        const results = qs2m('d=2010-04-01T12:00Z', { dateFields: ['d'] })
        t4.ok(results.criteria)
        t4.ok(results.criteria.d instanceof Date, 'instanceof Date')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0)) })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mm:ssZ', function (t4) {
        const results = qs2m('d=2010-04-01T12:00:30Z')
        t4.ok(results.criteria)
        t4.ok(typeof results.criteria.d === 'string', 'typeof string')
        t4.deepEqual(results.criteria, {
          d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30)).toISOString(),
        })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mm:ssZ', function (t4) {
        const results = qs2m('d=2010-04-01T12:00:30Z', { dateFields: ['d'] })
        t4.ok(results.criteria)
        t4.ok(results.criteria.d instanceof Date, 'instanceof Date')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30)) })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.sZ', function (t4) {
        const results = qs2m('d=2010-04-01T12:00:30.250Z')
        t4.ok(results.criteria)
        t4.ok(typeof results.criteria.d === 'string', 'typeof string')
        t4.deepEqual(results.criteria, {
          d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)).toISOString(),
        })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.sZ', function (t4) {
        const results = qs2m('d=2010-04-01T12:00:30.250Z', { dateFields: ['d'] })
        t4.ok(results.criteria)
        t4.ok(results.criteria.d instanceof Date, 'instanceof Date')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)) })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.s-hh:mm', function (t4) {
        const results = qs2m('d=2010-04-01T11:00:30.250-01:00')
        t4.ok(results.criteria)
        t4.ok(typeof results.criteria.d === 'string', 'typeof string')
        t4.deepEqual(results.criteria, {
          d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)).toISOString(),
        })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.s-hh:mm', function (t4) {
        const results = qs2m('d=2010-04-01T11:00:30.250-01:00', { dateFields: ['d'] })
        t4.ok(results.criteria)
        t4.ok(results.criteria.d instanceof Date, 'instanceof Date')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)) })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.s+hh:mm', function (t4) {
        const results = qs2m(encodeURIComponent('d=2010-04-01T13:00:30.250+01:00'))
        t4.ok(results.criteria)
        t4.ok(typeof results.criteria.d === 'string', 'typeof string')
        t4.deepEqual(results.criteria, {
          d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)).toISOString(),
        })
        t4.end()
      })
      t3.test('should create Date criteria from YYYY-MM-DDThh:mm:ss.s+hh:mm', function (t4) {
        const results = qs2m(encodeURIComponent('d=2010-04-01T13:00:30.250+01:00'), {
          dateFields: ['d'],
        })
        t4.ok(results.criteria)
        t4.ok(results.criteria.d instanceof Date, 'instanceof Date')
        t4.deepEqual(results.criteria, { d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250)) })
        t4.end()
      })
      t3.test('should create $gt criteria', function (t4) {
        const results = qs2m('field>value')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $gt: 'value' } })
        t4.end()
      })
      t3.test('should create $lt criteria', function (t4) {
        const results = qs2m('field<value')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $lt: 'value' } })
        t4.end()
      })
      t3.test('should create $gte criteria', function (t4) {
        const results = qs2m('field>=value')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $gte: 'value' } })
        t4.end()
      })
      t3.test('should create $lte criteria', function (t4) {
        const results = qs2m('field<=value')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $lte: 'value' } })
        t4.end()
      })
      t3.test('should create $ne criteria', function (t4) {
        const results = qs2m('field!=value')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $ne: 'value' } })
        t4.end()
      })
      t3.test('should create $not criteria', function (t4) {
        const results = qs2m('field!=/.*value*./i')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $not: /.*value*./i } })
        t4.end()
      })

      t3.test('should create $gt criteria from value', function (t4) {
        const results = qs2m('field=%3Evalue')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $gt: 'value' } })
        t4.end()
      })
      t3.test('should create $lt criteria from value', function (t4) {
        const results = qs2m('field=%3Cvalue')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $lt: 'value' } })
        t4.end()
      })
      t3.test('should create $gte criteria from value', function (t4) {
        const results = qs2m('field=%3E%3Dvalue')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $gte: 'value' } })
        t4.end()
      })
      t3.test('should create $lte criteria from value', function (t4) {
        const results = qs2m('field=%3C%3Dvalue')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $lte: 'value' } })
        t4.end()
      })
      t3.test('should create $ne criteria from value', function (t4) {
        const results = qs2m('field=%21%3Dvalue')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $ne: 'value' } })
        t4.end()
      })
      t3.test('should create $not criteria from /.*value*./i', function (t4) {
        const results = qs2m('field=%21%3D/.*value*./i')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $not: /.*value*./i } })
        t4.end()
      })
      t3.test('should create $ne criteria from !value', function (t4) {
        const results = qs2m('field=%21value')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $ne: 'value' } })
        t4.end()
      })
      t3.test('should create $nin criteria from multiple !value', function (t4) {
        const results = qs2m('field=%21a&field=%21b')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $nin: ['a', 'b'] } })
        t4.end()
      })
      t3.test('should create $not criteria from !/.*value*./i', function (t4) {
        const results = qs2m('field=%21/.*value*./i')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $not: /.*value*./i } })
        t4.end()
      })

      t3.test('should create $in criteria', function (t4) {
        const results = qs2m('field=a&field=b')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $in: ['a', 'b'] } })
        t4.end()
      })
      t3.test('should create $nin criteria', function (t4) {
        const results = qs2m('field!=a&field!=b')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $nin: ['a', 'b'] } })
        t4.end()
      })
      t3.test('should create mixed criteria', function (t4) {
        const results = qs2m('field!=10&field!=20&field>3')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $nin: [10, 20], $gt: 3 } })
        t4.end()
      })
      t3.test('should create range criteria', function (t4) {
        const results = qs2m('field>=10&field<=20')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $gte: 10, $lte: 20 } })
        t4.end()
      })
      t3.test('should ignore criteria', function (t4) {
        const results = qs2m('field=value&envelope=true&&offset=0&limit=10&fields=id&sort=name', {
          ignoredFields: ['envelope'],
        })
        t4.ok(results.criteria)
        t4.notOk(results.criteria.envelope, 'envelope')
        t4.notOk(results.criteria.skip, 'offset')
        t4.notOk(results.criteria.limit, 'limit')
        t4.notOk(results.criteria.fields, 'fields')
        t4.notOk(results.criteria.sort, 'sort')
        t4.deepEqual(results.criteria, { field: 'value' })
        t4.end()
      })
      t3.test('should create $exists criteria from value', function (t4) {
        const results = qs2m('a=&b=%21')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { a: { $exists: true }, b: { $exists: false } })
        t4.end()
      })
      t3.test('should create $exists true criteria', function (t4) {
        const results = qs2m('a&b=10&c', { ignoredFields: ['c'] })
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { a: { $exists: true }, b: 10 })
        t4.end()
      })
      t3.test('should create $exists false criteria', function (t4) {
        const results = qs2m('!a&b=10&c', { ignoredFields: ['c'] })
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { a: { $exists: false }, b: 10 })
        t4.end()
      })
      t3.test('should create $type criteria with BSON type number', function (t4) {
        const results = qs2m('field:type=2')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $type: 2 } })
        t4.end()
      })
      t3.test('should create $type criteria with BSON type name', function (t4) {
        const results = qs2m('field:type=string')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: { $type: 'string' } })
        t4.end()
      })
      t3.test('should create $size criteria', function (t4) {
        const results = qs2m('array:size=2')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { array: { $size: 2 } })
        t4.end()
      })
      t3.test('should create $all criteria', function (t4) {
        const results = qs2m('array:all=50,60')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { array: { $all: [50, 60] } })
        t4.end()
      })
      t3.test('should throw on $where criteria', function (t4) {
        t4.throws(
          () => qs2m('array:where="while(true) {}"'),
          'Use of the operator $where is forbidden to prevent NoSQL injections.',
        )
        t4.end()
      })
      t3.test('should create $or criteria', function (t4) {
        const results = qs2m('array:or=foo,bar')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { $or: [{ array: 'foo' }, { array: 'bar' }] })
        t4.end()
      })
      t3.test('should create forced string criteria', function (t4) {
        const results = qs2m("s='a,b'")
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { s: 'a,b' })
        t4.end()
      })
      t3.test('should create numeric criteria from YYYY exception', function (t4) {
        const results = qs2m('d=2016')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { d: 2016 })
        t4.end()
      })
      t3.end()
    })

    t2.test('.options', function (t3) {
      t3.test('should create paging options', function (t4) {
        const results = qs2m('offset=8&limit=16')
        t4.ok(results.options)
        t4.deepEqual(results.options, { skip: 8, limit: 16 })
        t4.end()
      })
      t3.test('should create field option', function (t4) {
        const results = qs2m('fields=a,b,c')
        t4.ok(results.options)
        t4.deepEqual(results.options, { projection: { a: 1, b: 1, c: 1 } })
        t4.end()
      })
      t3.test('should create field option', function (t4) {
        const results = qs2m('fields=a&fields=b&fields=c')
        t4.ok(results.options)
        t4.deepEqual(results.options, { projection: { a: 1, b: 1, c: 1 } })
        t4.end()
      })
      t3.test('should create omit option', function (t4) {
        const results = qs2m('omit=b')
        t4.ok(results.options)
        t4.deepEqual(results.options, { projection: { b: 0 } })
        t4.end()
      })
      t3.test('should create sort option', function (t4) {
        const results = qs2m('sort=a,+b,-c')
        t4.ok(results.options)
        t4.deepEqual(results.options, { sort: { a: 1, b: 1, c: -1 } })
        t4.end()
      })
      t3.test('should limit queries', function (t4) {
        const results = qs2m('limit=100', { maxLimit: 50 })
        t4.ok(results.options)
        t4.deepEqual(results.options, { limit: 50 })
        t4.end()
      })
      t3.end()
    })

    t2.test('.options (altKeywords)', function (t3) {
      t3.test('should create paging options', function (t4) {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$offset=8&$limit=16', { parameters: altKeywords })
        t4.ok(results.options)
        t4.deepEqual(results.options, { skip: 8, limit: 16 })
        t4.end()
      })
      t3.test('should create field option', function (t4) {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$fields=a,b,c', { parameters: altKeywords })
        t4.ok(results.options)
        t4.deepEqual(results.options, { projection: { a: 1, b: 1, c: 1 } })
        t4.end()
      })
      t3.test('should create omit option', function (t4) {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$omit=b', { parameters: altKeywords })
        t4.ok(results.options)
        t4.deepEqual(results.options, { projection: { b: 0 } })
        t4.end()
      })
      t3.test('should create sort option', function (t4) {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$sort=a,+b,-c', { parameters: altKeywords })
        t4.ok(results.options)
        t4.deepEqual(results.options, { sort: { a: 1, b: 1, c: -1 } })
        t4.end()
      })
      t3.test('should limit queries', function (t4) {
        const altKeywords = {
          fields: '$fields',
          offset: '$offset',
          limit: '$limit',
          sort: '$sort',
          omit: '$omit',
        }
        const results = qs2m('$limit=100', { maxLimit: 50, parameters: altKeywords })
        t4.ok(results.options)
        t4.deepEqual(results.options, { limit: 50 })
        t4.end()
      })
      t3.end()
    })
    t2.end()
  })

  t.test('advanced qs parsing =>', function (t2) {
    t2.test('.criteria', function (t3) {
      t3.test('should create criteria', function (t4) {
        const results = qs2m('foo[bar]=value')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { foo: { bar: 'value' } })
        t4.end()
      })
      t3.test('should create numeric criteria', function (t4) {
        const results = qs2m('foo[i]=10&foo[f]=1.2&foo[z]=0')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { foo: { i: 10, f: 1.2, z: 0 } })
        t4.end()
      })
      t3.test('should create boolean criteria', function (t4) {
        const results = qs2m('foo[t]=true&foo[f]=false')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { foo: { t: true, f: false } })
        t4.end()
      })
      t3.test('should create regex criteria', function (t4) {
        const results = qs2m('foo[r]=/regex/&foo[ri]=/regexi/i')
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { foo: { r: /regex/, ri: /regexi/i } })
        t4.end()
      })
      // can't create comparisons for embedded documents
      t3.test("shouldn't ignore deep criteria", function (t4) {
        const results = qs2m('field=value&foo[envelope]=true', { ignoredFields: ['envelope'] })
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, { field: 'value', foo: { envelope: true } })
        t4.end()
      })
      t3.test('should create string criteria when forced with a quote', function (t4) {
        const results = qs2m("a='10'&b='11'&c='a,b'&d=10,11&z=\"that's all folks\"")
        t4.ok(results.criteria)
        t4.deepEqual(results.criteria, {
          a: '10',
          b: '11',
          c: 'a,b',
          d: { $in: [10, 11] },
          z: "that's all folks",
        })
        t4.end()
      })
      t3.end()
    })

    t2.test('.options', function (t3) {
      t3.test('should create paging options', function (t4) {
        const results = qs2m('offset=8&limit=16')
        t4.ok(results.options)
        t4.deepEqual(results.options, { skip: 8, limit: 16 })
        t4.end()
      })
      t3.test('should create field option', function (t4) {
        const results = qs2m('fields=a,b,c')
        t4.ok(results.options)
        t4.deepEqual(results.options, { projection: { a: 1, b: 1, c: 1 } })
        t4.end()
      })
      t3.test('should create sort option', function (t4) {
        const results = qs2m('sort=a,+b,-c')
        t4.ok(results.options)
        t4.deepEqual(results.options, { sort: { a: 1, b: 1, c: -1 } })
        t4.end()
      })
      t3.test('should limit queries', function (t4) {
        const results = qs2m('limit=100', { maxLimit: 50 })
        t4.ok(results.options)
        t4.deepEqual(results.options, { limit: 50 })
        t4.end()
      })
      t3.end()
    })

    t2.test('#links', function (t3) {
      const links = qs2m('foo[bar]=baz&offset=20&limit=10', { maxLimit: 50 }).links(
        'http://localhost',
        100,
      )
      t3.ok(links)
      t3.test('should create first link', function (t4) {
        t4.equal(links!.first, 'http://localhost?foo%5Bbar%5D=baz&offset=0&limit=10')
        t4.end()
      })
      t3.test('should create prev link', function (t4) {
        t4.equal(links!.prev, 'http://localhost?foo%5Bbar%5D=baz&offset=10&limit=10')
        t4.end()
      })
      t3.test('should create next link', function (t4) {
        t4.equal(links!.next, 'http://localhost?foo%5Bbar%5D=baz&offset=30&limit=10')
        t4.end()
      })
      t3.test('should create last link', function (t4) {
        t4.equal(links!.last, 'http://localhost?foo%5Bbar%5D=baz&offset=90&limit=10')
        t4.end()
      })
      t3.end()
    })
    t2.end()
  })
  t.end()
})
