import qs from 'qs'
import { queryCriteriaToMongo } from './query/criteria-to-mongo'
import { parseQueryOptions } from './query/options-to-mongo'

const defaultParameters = {
  fields: 'fields',
  omit: 'omit',
  sort: 'sort',
  offset: 'offset',
  limit: 'limit',
  q: 'q',
}

interface Options {
  ignoredFields?: string | string[]
  parser?: {
    parse(query: string, options?: unknown): unknown
    stringify(obj: object, options?: unknown): string
  }
  parserOptions?: unknown
  dateFields?: string | string[]
  objectIdFields?: string | string[]
  fullTextFields?: string | string[]
  parameters?: Partial<typeof defaultParameters>
  maxLimit?: number
}

function qsToMongo(query: string | object, options: Options = {}) {
  const { parser = qs, parserOptions, ignoredFields = [], maxLimit } = options

  let { dateFields, objectIdFields, fullTextFields } = options
  const parameters = { ...defaultParameters, ...options.parameters }

  const queryString = (typeof query === 'string' ? parser.parse(query, parserOptions) : query) as {
    [key: string]: unknown
  }

  const ignore = ([] as string[])
    .concat(typeof ignoredFields === 'string' ? [ignoredFields] : ignoredFields)
    .concat(Object.values(parameters))

  dateFields = typeof dateFields === 'string' ? [dateFields] : dateFields
  objectIdFields = typeof objectIdFields === 'string' ? [objectIdFields] : objectIdFields
  fullTextFields = typeof fullTextFields === 'string' ? [fullTextFields] : fullTextFields

  const parsedOptions = parseQueryOptions(queryString, { maxLimit, parameters })

  return {
    criteria: queryCriteriaToMongo(queryString, {
      dateFields,
      ignore,
      objectIdFields,
      fullTextFields,
      qParameter: parameters.q,
    }),
    options: parsedOptions,

    links: (url: string, totalCount: number) => {
      const offset = parsedOptions.skip || 0
      const limit = Math.min(parsedOptions.limit || 0, totalCount)
      const links = {} as { prev: string; first: string; next: string; last: string }
      const last = {} as { pages: number; offset: number }

      if (!limit) {
        return null
      }

      if (offset > 0) {
        queryString[parameters.offset] = Math.max(offset - limit, 0)
        links.prev = `${url}?${parser.stringify(queryString)}`
        queryString[parameters.offset] = 0
        links.first = `${url}?${parser.stringify(queryString)}`
      }
      if (offset + limit < totalCount) {
        last.pages = Math.ceil(totalCount / limit)
        last.offset = (last.pages - 1) * limit

        queryString[parameters.offset] = Math.min(offset + limit, last.offset)
        links.next = `${url}?${parser.stringify(queryString)}`
        queryString[parameters.offset] = last.offset
        links.last = `${url}?${parser.stringify(queryString)}`
      }
      return links
    },
  }
}

export = qsToMongo
