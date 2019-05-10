import { getTypedValues, getTypedValue } from './get-typed-value'

interface Options {
  dateFields?: string[]
  objectIdFields?: string[]
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
  value: any,
  { dateFields, objectIdFields }: Options = {},
) {
  const join = value === '' ? key : key.concat('=', value)
  const parts = join.match(/^(!?[^><!=:]+)(?:=?([><]=?|!?=|:.+=)(.+))?$/)
  const fieldQueryCriteria: { key: string; value: any } = {} as any
  let parseDate = false
  let parseObjectId = false
  let op

  if (!parts) {
    return null
  }

  key = parts[1]
  op = parts[2]

  if (Array.isArray(dateFields) && dateFields.indexOf(key) > -1) {
    parseDate = true
  }
  if (Array.isArray(objectIdFields) && objectIdFields.indexOf(key) > -1) {
    parseObjectId = true
  }

  if (!op) {
    if (key[0] !== '!') {
      value = { $exists: true }
    } else {
      key = key.substr(1)
      value = { $exists: false }
    }
  } else if (op === '=' && parts[3] === '!') {
    value = { $exists: false }
  } else if (op === '=' || op === '!=') {
    if (op === '=' && parts[3][0] === '!') {
      op = '!='
    }
    const array: any[] = getTypedValues(parts[3], { parseDate, parseObjectId })

    if (array.length > 1) {
      value = {}
      op = op === '=' ? '$in' : '$nin'
      value[op] = array
    } else if (op === '!=') {
      // for a RegExp we need to use $not operator
      // it supports only single value after ! and not an array
      value = array[0] instanceof RegExp ? { $not: array[0] } : { $ne: array[0] }
    } else {
      value = array[0]
    }
  } else if (op[0] === ':' && op[op.length - 1] === '=') {
    op = '$' + op.substr(1, op.length - 2)
    const array = parts[3].split(',').map(val => getTypedValue(val, { parseDate, parseObjectId }))
    value = {}
    value[op] = array.length === 1 ? array[0] : array
  } else {
    value = getTypedValue(parts[3], { parseDate, parseObjectId })
    if (op === '>') {
      value = { $gt: value }
    } else if (op === '>=') {
      value = { $gte: value }
    } else if (op === '<') {
      value = { $lt: value }
    } else if (op === '<=') {
      value = { $lte: value }
    }
  }

  fieldQueryCriteria.key = key
  fieldQueryCriteria.value = value
  return fieldQueryCriteria
}
