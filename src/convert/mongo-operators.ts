import type ObjectID from 'bson-objectid'
import { getTypedValue, getTypedValues } from './get-typed-value'

interface Options {
  dateFields?: string[]
  objectIdFields?: string[]
}

const operatorsBlackList = ['$where']
type Value =
  | string
  | number
  | boolean
  | RegExp
  | Date
  | ObjectID
  | null
  | Array<string | number | boolean | RegExp | Date | ObjectID | null>

export interface FieldQueryCriteria {
  key: string
  value: { [key: string]: Value } | Value | { [key: string]: Value }[]
}

// Convert a key/value pair split at an equals sign into a mongo comparison.
// Converts value Strings to Numbers or Booleans when possible.
// for example:
// + f('key','value') => {key:'key',value:'value'}
// + f('key>','value') => {key:'key',value:{$gte:'value'}}
// + f('key') => {key:'key',value:{$exists: true}}
// + f('!key') => {key:'key',value:{$exists: false}}
// + f('key:op','value') => {key: 'key', value:{ $op: value}}
// + f('key','op:value') => {key: 'key', value:{ $op: value}}
export function convertToMongoOperators(
  key: string,
  value: string,
  { dateFields, objectIdFields }: Options = {},
) {
  const join = value === '' ? key : key.concat('=', value)
  const parts = join.match(/^(!?[^><!=:]+)(?:=?([><]=?|!?=|:.+=)(.+))?$/)
  let parseDate = false
  let parseObjectId = false

  if (!parts) {
    return null
  }

  let _key = parts[1]
  let op = parts[2]
  let _value: FieldQueryCriteria['value'] = {}

  if (Array.isArray(dateFields) && dateFields.indexOf(_key) > -1) {
    parseDate = true
  }
  if (Array.isArray(objectIdFields) && objectIdFields.indexOf(_key) > -1) {
    parseObjectId = true
  }

  if (!op) {
    if (_key[0] !== '!') {
      _value = { $exists: true }
    } else {
      _key = _key.substr(1)
      _value = { $exists: false }
    }
  } else if (op === '=' && parts[3] === '!') {
    _value = { $exists: false }
  } else if (op === '=' || op === '!=') {
    if (op === '=' && parts[3][0] === '!') {
      op = '!='
    }
    const array = getTypedValues(parts[3], { parseDate, parseObjectId })

    if (array.length > 1) {
      _value = {}
      op = op === '=' ? '$in' : '$nin'
      _value[op] = array
    } else if (op === '!=') {
      // for a RegExp we need to use $not operator
      // it supports only single value after ! and not an array
      _value = array[0] instanceof RegExp ? { $not: array[0] } : { $ne: array[0] }
    } else {
      _value = array[0]
    }
  } else if (op[0] === ':' && op[op.length - 1] === '=') {
    // f('key:op','value')
    op = `$${op.substr(1, op.length - 2)}`
    if (operatorsBlackList.indexOf(op) > -1) {
      throw new Error(`Use of the operator ${op} is forbidden to prevent NoSQL injections.`)
    }
    const array = parts[3].split(',').map(val => getTypedValue(val, { parseDate, parseObjectId }))
    if (op === '$or') {
      _value = array.length === 1 ? { [_key]: array[0] } : array.map(val => ({ [_key]: val }))
      _key = op
    } else {
      _value = {}
      _value[op] = array.length === 1 ? array[0] : array
    }
  } else {
    const typedValue = getTypedValue(parts[3], { parseDate, parseObjectId })
    if (op === '>') {
      _value = { $gt: typedValue }
    } else if (op === '>=') {
      _value = { $gte: typedValue }
    } else if (op === '<') {
      _value = { $lt: typedValue }
    } else if (op === '<=') {
      _value = { $lte: typedValue }
    }
  }

  const fieldQueryCriteria: FieldQueryCriteria = {
    key: _key,
    value: _value,
  }
  return fieldQueryCriteria
}
