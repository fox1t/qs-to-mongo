import { test } from 'tap'
import qs2m from '../src'

test('query-to-mongo(query).links =>', function(t) {
  t.test('#links', function(t2) {
    const links = qs2m('offset=20&limit=10').links('http://localhost', 95)
    t2.test('should create first link', function(t3) {
      t3.ok(links)
      t3.equal(links!.first, 'http://localhost?offset=0&limit=10')
      t3.end()
    })
    t2.test('should create prev link', function(t3) {
      t3.ok(links)
      t3.equal(links!.prev, 'http://localhost?offset=10&limit=10')
      t3.end()
    })
    t2.test('should create next link', function(t3) {
      t3.ok(links)
      t3.equal(links!.next, 'http://localhost?offset=30&limit=10')
      t3.end()
    })
    t2.test('should create last link', function(t3) {
      t3.ok(links)
      t3.equal(links!.last, 'http://localhost?offset=90&limit=10')
      t3.end()
    })

    t2.test('should return null if totalCount equals 0', function(t3) {
      const links2 = qs2m('offset=20&limit=10').links('http://localhost', 0)
      t3.equal(links2, null)
      t3.end()
    })
    t2.test('with no pages', function(t3) {
      const links2 = qs2m('offset=0&limit=100').links('http://localhost', 95)
      t3.test('should not create links', function(t4) {
        t4.notOk(links2!.first)
        t4.notOk(links2!.last)
        t4.notOk(links2!.next)
        t4.notOk(links2!.prev)
        t4.end()
      })
      t3.end()
    })
    t2.test('when on first page', function(t3) {
      const links2 = qs2m('offset=0&limit=10').links('http://localhost', 95)
      t3.test('should not create prev link', function(t4) {
        t4.ok(links2)
        t4.notOk(links2!.prev)
        t4.end()
      })
      t3.test('should not create first link', function(t4) {
        t4.ok(links2)
        t4.notOk(links2!.first)
        t4.end()
      })
      t3.test('should create next link', function(t4) {
        t4.ok(links2)
        t4.equal(links2!.next, 'http://localhost?offset=10&limit=10')
        t4.end()
      })
      t3.test('should create last link', function(t4) {
        t4.ok(links2)
        t4.equal(links2!.last, 'http://localhost?offset=90&limit=10')
        t4.end()
      })
      t3.end()
    })
    t2.test('when on last page', function(t3) {
      const links2 = qs2m('offset=90&limit=10').links('http://localhost', 95)
      t3.test('should not create next link', function(t4) {
        t4.ok(links2)
        t4.notOk(links2!.next)
        t4.end()
      })
      t3.test('should not create last link', function(t4) {
        t4.notOk(links2!.last)
        t4.end()
      })
      t3.test('should create prev link', function(t4) {
        t4.equal(links2!.prev, 'http://localhost?offset=80&limit=10')
        t4.end()
      })
      t3.test('should not create first link', function(t4) {
        t4.equal(links2!.first, 'http://localhost?offset=0&limit=10')
        t4.end()
      })
      t3.end()
    })
    t2.end()
  })
  t.end()
})
