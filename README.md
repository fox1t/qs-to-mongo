<div align="center">
  
![qs-to-mongo-logo-v1](https://user-images.githubusercontent.com/6388707/57569044-0f723900-73f0-11e9-8683-b28afd0b7731.png)

</div>

<div align="center">

[![Build Status](https://dev.azure.com/sinik/qs-to-mongo/_apis/build/status/fox1t.qs-to-mongo?branchName=master)](https://dev.azure.com/sinik/qs-to-mongo/_build/latest?definitionId=1&branchName=master)
[![NPM version](https://img.shields.io/npm/v/qs-to-mongo.svg?style=flat)](https://www.npmjs.com/package/qs-to-mongo)
[![NPM downloads](https://img.shields.io/npm/dm/qs-to-mongo.svg?style=flat)](https://www.npmjs.com/package/qs-to-mongo)
[![built with typescript-lib-starter](https://img.shields.io/badge/built%20with-typescript--lib--starter%20-blue.svg)](https://github.com/fox1t/typescript-lib-starter)


</div>

With this package you can parse and convert query parameters into [MongoDB](https://www.mongodb.com/) query criteria and options.

## Install
`npm install qs-to-mongo`

## Usage
```typescript
import qs2m from 'qs-to-mongo' // or const qs2m = require('qs-to-mongo')
const result = qs2m('name=john&age>21&fields=name,age&sort=name,-age&offset=10&limit=10')
```
The result will be
```typescript
{
  criteria: {
    name: 'john',
    age: { $gt: 21 }
  },
  options: {
    fields: { name: true, age: true },
    sort: { name: 1, age: -1 },
    offset: 10,
    limit: 10
  }
}
```

Resulting object props (`criteria` and `options`) are usable as parameters to any MongoDB package. For example:
```typescript
import qs2m from 'qs-to-mongo'
import { MongoClient } from 'mongodb'

;(async function() {
    const { db } = await MongoClient.connect(connectionString)
    const result = qs2m('name=john&age>21&fields=name,age&sort=name,-age&offset=10&limit=10')
    const documents = await db('dbName')
      .collection('collectionName')
      .find(result.criteria, result.options)
})().catch(console.log)
```

## API

### Main function

```typescript
qs2m(query: string, options: {
  ignoredFields?: string | string[]
  parser?: {
    parse(query: string, options?: any): any
    stringify(obj: object, options?: any): string
  }
  parserOptions?: object
  dateFields?: string | string[]
  objectIdFields?: string | string[]
  fullTextFields?: string | string[]
  parameters?: Partial<typeof defaultParameters>
  maxLimit?: number
})
```

### Options
* ignoredFields: array of query parameters that are ignored, in addtion to defalut ones: "fields", "omit", "sort", "offset", "limit", "q";
* parser: custom query parser, must implement `parse(query: string, options?: any): any` and `stringify(obj: object, options?: any): string`. The default parser is [qs](https://github.com/ljharb/qs);
* parserOptions: options to pass to the query parser;
* dateFields: fields that will be converted to `Date`. If no fields are passed, any valid date string will be converted to [ISOString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString);
* objectIdFields: fields that will be converted to [ObjectId](https://docs.mongodb.com/manual/reference/method/ObjectId/);
* fullTextFields: fields that will be used as criteria when passing `q` query parameter;
* parameters: override default parameters used as query options ("fields", "omit", "sort", "offset", "limit", "q"). For example: {fields:'$fields', omit:'$omit', sort:'$sort', offset:'$offset', limit:'$limit'};
* maxLimit: maximum limit that could be passed to `limit` option.

### Returned object

```typescript
{
    criteria: {
        [key: string]: any
    }
    options: {
      projection: {
        [key: string]: 0 | 1
      }
      sort: {
        [key: string]: 1 | -1
      }
      skip: number
      limit: number
    }
    links: (url: string, totalCount: number) => {
        prev: string
        first: string
        next: string
        last: string
    } | null
}
```

### `links` method examples
```typescript
import qs2m from 'qs-to-mongo' //or const qs2m = require('qs-to-mongo')
const query = qs2m('name=john&age>21&offset=20&limit=10')
query.links('http://localhost/api/v1/users', 100)
```
This will generate an object that could be used by express [res.links](http://expressjs.com/en/4x/api.html#res.links) method.
```typescript
{ prev: 'http://localhost/api/v1/users?name=john&age%3E21=&offset=10&limit=10',
  first: 'http://localhost/api/v1/users?name=john&age%3E21=&offset=0&limit=10',
  next: 'http://localhost/api/v1/users?name=john&age%3E21=&offset=30&limit=10',
  last: 'http://localhost/api/v1/users?name=john&age%3E21=&offset=90&limit=10' }
```

### Filtering
Any query parameters other then the special parameters _fields_, _omit_, _sort_, _offset_, _limit_ and _q_ are interpreted as query criteria. For example `name=john&age>21` results in a _criteria_ value of:

```
{
  'name': 'john',
  'age': { $gt: 21 }
}
```

* Supports standard comparison operations (=, !=, >, <, >=, <=).
* Numeric values, where `Number(value) != NaN`, are compared as numbers (ie., `field=10` yields `{field:10}`).
* Values of _true_ and _false_ are compared as booleans (ie. `{field: true}`)
* ObjectId hex strings can be compared as ObjectId instances, if `objectIdFields` is passed.
* Values that are [dates](http://www.w3.org/TR/NOTE-datetime) are compared as dates (except for YYYY which matches the number rule) if `dateFields` is passed. If not, they will be converted to Date [ISOString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString).
* `null` values are compared as `null`. For example `bar=null` yields `{bar: null}`
* special `q` query parameter could be used to perform fulltext search on fields that are passed in `fullTextFields` argument.
* Multiple equals comparisons are merged into a `$in` operator. For example, `id=a&id=b` yields `{id:{$in:['a','b']}}`.
* Multiple not-equals comparisons are merged into a `$nin` operator. For example, `id!=a&id!=b` yields `{id:{$nin:['a','b']}}`.
* Comma separated values in equals or not-equals yeild an `$in` or `$nin` operator. For example, `id=a,b` yields `{id:{$in:['a','b']}}`.
* Regex patterns. For example, `name=/^john/i` yields `{id: /^john/i}`.
* Parameters without a value check that the field is present. For example, `foo&bar=10` yields `{foo: {$exists: true}, bar: 10}`.
* Parameters prefixed with a _not_ (!) and without a value check that the field is not present. For example, `!foo&bar=10` yields `{foo: {$exists: false}, bar: 10}`.
* Supports some of the named comparision operators ($type, $size and $all).  For example, `foo:type=string`, yeilds `{ foo: {$type: 'string} }`.
* Support for forced string comparison; value in single or double quotes (`field='10'` or `field="10"`) would force a string compare. Allows for string with embedded comma (`field="a,b"`) and quotes (`field="that's all folks"`).

### Embedded documents
Comparisons on embedded documents should use mongo's [dot notation](http://docs.mongodb.org/manual/reference/glossary/#term-dot-notation) instead of [qs](https://www.npmjs.com/package/qs) (Use `foo.bar=value` instead of `foo[bar]=value`) 'extended' syntax.

Although exact matches are handled for either method, comparisons (such as `foo[bar]!=value`) are not supported because the `qs` parser expects an equals sign after the nested object reference; if it's not an equals the remainder is discarded.

### Overriding parameters
You can adjust the default parameters (_fields_, _omit_, _sort_, _offset_, _limit_ and _q_) by providing an alternate set as an option. For example:

```typescript
const parameters = {
  fields:'$fields',
  omit:'$omit',
  sort:'$sort',
  offset:'$offset',
  limit:'$limit',
  q: '$q',
}

const query = q2m(res.query, { parameters: parameters });
```

This will then interpret the default parameters as query parameters instead of options. For example a query of `age>21&omit=false&$omit=a` results in a _criteria_ value of:

```typescript
query.criteria = {
  'age': { $gt: 21 },
  'omit': false
}
```

and an _option_ value of:

```typescript
query.option = {
  fields: { a: false }
}
```


### Frameworks integration
This module takes also parsed query as input, so it could be used by [Fastify](https://github.com/fastify/fastify) or [express](https://github.com/expressjs/express) routes without any further addition.

```typescript
const querystring = require('querystring')
const qs2m = require('qs-to-mongo')
const query = 'name=john&age>21&fields=name,age&sort=name,-age&offset=10&limit=10'
const q = q2m(querystring.parse(query))
```

This makes it easy to use it in fastify route:

```typescript
fastify.get('/api/v1/mycollection', (req, reply) =>{
  const q = q2m(req.query);
  ...
}
```
or in express one:
```typescript
router.get('/api/v1/mycollection', function(req, res, next) {
  const q = q2m(res.query);
  ...
}
```

The format and names for query parameters was inspired by [this article](http://blog.mwaysolutions.com/2014/06/05/10-best-practices-for-better-restful-api/) about best practices for RESTful APIs.

## Background

This package started as hard fork of  https://github.com/pbatey/query-to-mongo. This is a TypeScript port, with some fixes and many improvements. Because of the changes to the public API, this is not a drop-in replacement.

### Notable differences with [query-to-mongo](https://github.com/pbatey/query-to-mongo)
* uses [qs](https://github.com/ljharb/qs) instead of [querystring](https://nodejs.org/api/querystring.html) for default query parsing
* adds support for `null` and `ObjectId` hex string values
* adds passing options to parser with `parserOptions` parameter
* adds support for fulltext search on predefined fields (using `fullTextFields` parameter)
* opt-ins date-string conversion to Date with `dateFields` parameter
* opt-ins hexstring ObjectId parsing with `objectIdFields` parameter
* renames [`keywords`](https://github.com/pbatey/query-to-mongo#api) parameter to `parameters`
* renames [`ignore`](https://github.com/pbatey/query-to-mongo#api) to `ignoredFields`
* renames `fields` to `projection` in returnd mongo options
* removes unused and old code
* written in TypeScript, typed out of the box

## License

MIT
