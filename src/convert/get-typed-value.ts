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
    ? true
    : false
}

// Convert String to RegExp, Number, Date, Boolean or null if possible
// If the value is a quoted string it will just strip the quotes
export function getTypedValue(
  value: string,
  { parseDate, parseObjectId }: Options = {},
): string | number | boolean | RegExp | Date | ObjectId | null {
  // if there is a negation operator, removes it beacause it is already handled in convertToMongoOperators function
  if (value[0] === '!') {
    value = value.substr(1)
  }
  const regex = value.match(/^\/(.*)\/(i?)$/)
  const quotedString = value.match(/(["'])(?:\\\1|.)*?\1/)

  if (regex) {
    return new RegExp(regex[1], regex[2])
  } else if (quotedString) {
    return quotedString[0].substr(1, quotedString[0].length - 2)
  } else if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else if (iso8601.test(value) && value.length !== 4) {
    return parseDate ? new Date(value) : new Date(value).toISOString()
  } else if (!isNaN(Number(value))) {
    return Number(value)
  } else if (value === 'null') {
    return null
  } else if (isValidObjectId(value)) {
    return parseObjectId ? new ObjectId(value) : value
  }

  return value
}

// Convert a comma separated string value to an array of values.
// Commas in a quoted string are ignored. Also strips ! prefix from values.
export function getTypedValues(stringValues: string, options: Options = {}) {
  return (stringValues.match(/("[^"]*")|('[^']*')|([^,]+)/g) || []).map(value =>
    getTypedValue(value, options),
  )
}
