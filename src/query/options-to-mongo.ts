import { fieldsToProjection } from './fields-to-projection'
import { omitFieldsToProjection } from './omit-to-projection'
import { sortToMongo } from './sort-to-mongo'

interface QueryStringOptions {
  fields?: string
  omit?: string
  sort?: string
  offset?: string | number
  limit?: string | number
}

export interface ParsedOptions {
  projection: {
    [key: string]: 0 | 1
  }
  sort: {
    [key: string]: 1 | -1
  }
  skip: number
  limit: number
}

interface Options {
  maxLimit?: number
  parameters: {
    fields: string
    omit: string
    sort: string
    offset: string
    limit: string
  }
}

// Convert query parameters to a mongo query options.
// for example {fields:'a,b',offset:8,limit:16} becomes {fields:{a:1,b:1},skip:8,limit:16}
export function parseQueryOptions(
  query: QueryStringOptions,
  { maxLimit = 9007199254740992, parameters }: Options,
): ParsedOptions {
  const parsedOptions: ParsedOptions = {} as any
  const projection = fieldsToProjection(query[parameters.fields])
  const negativeProjection = omitFieldsToProjection(query[parameters.omit])
  const sort = sortToMongo(query[parameters.sort])

  if (!Number.isInteger(maxLimit) || maxLimit < 0) {
    throw new Error(`'maxLimit' option must be a positive integer.`)
  }

  if (projection) {
    parsedOptions.projection = projection
  }
  // Omit intentionally overwrites projection if both have been specified in the query
  // MongoDB does not accept mixed true/false field specifiers for projections
  if (negativeProjection) {
    parsedOptions.projection = negativeProjection
  }
  if (sort) {
    parsedOptions.sort = sort
  }

  if (query[parameters.offset]) {
    const skip = parseInt(query[parameters.offset] as string, 10)
    if (!Number.isInteger(skip) || skip < 0) {
      throw new Error(`'skip' option must be a positive integer.`)
    }
    parsedOptions.skip = skip
  }

  if (query[parameters.limit]) {
    const limit = parseInt(query[parameters.limit] as string, 10)
    if (!Number.isInteger(limit)) {
      throw new Error(`'skip' option must be a positive integer.`)
    }
    parsedOptions.limit = Math.min(limit, maxLimit)
  } else if (query[parameters.limit] === 0) {
    parsedOptions.limit = 0
  }

  return parsedOptions
}
