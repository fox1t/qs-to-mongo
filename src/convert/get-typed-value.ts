import ObjectId from 'bson-objectid'
import { iso8601 } from './iso8601'

interface Options {
  parseDate?: boolean
  parseObjectId?: boolean
}

// we need this function to be sure that passed string hex is a valid ObjectId
function isValidObjectId(id: string | ObjectId): boolean {
  if (!id) {
    return false
  }
  const hexString = id.toString().toLowerCase()

  return ObjectId.isValid(hexString) && new ObjectId(hexString).toString() === hexString
}

export const regexpTest = (value: string) => value.match(/^\/(.*)\/(i?)$/)

// Convert String to RegExp, Number, Date, Boolean or null if possible
// If the value is a quoted string it will just strip the quotes
export function getTypedValue(
  value: string,
  { parseDate, parseObjectId }: Options = {},
): string | number | boolean | RegExp | Date | ObjectId | null {
  let _value = value
  // if there is a negation operator, removes it beacause it is already handled in convertToMongoOperators function
  if (_value[0] === '!') {
    _value = _value.substr(1)
  }
  const regex = regexpTest(_value)
  const quotedString = _value.match(/(["'])(?:\\\1|.)*?\1/)

  if (regex) {
    return new RegExp(regex[1], regex[2])
  }
  if (quotedString) {
    return quotedString[0].substr(1, quotedString[0].length - 2)
  }
  if (_value === 'true') {
    return true
  }
  if (_value === 'false') {
    return false
  }
  if (iso8601.test(_value) && _value.length !== 4) {
    return parseDate ? new Date(_value) : new Date(_value).toISOString()
  }
  if (!Number.isNaN(Number(_value))) {
    return Number(_value)
  }
  if (_value === 'null') {
    return null
  }
  if (isValidObjectId(_value)) {
    return parseObjectId ? new ObjectId(_value) : _value
  }

  return _value
}

// Convert a comma separated string value to an array of values.
// Commas in a quoted string are ignored. Also strips ! prefix from values.
export function getTypedValues(stringValues: string, options: Options = {}) {
  return (stringValues.match(/("[^"]*")|('[^']*')|([^,]+)/g) || []).map(value =>
    getTypedValue(value, options),
  )
}
