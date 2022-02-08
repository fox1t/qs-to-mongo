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
    parse(query: string, options?: any): any
    stringify(obj: object, options?: any): string
  }
  parserOptions?: any
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

  const queryString: { [key: string]: any } =
    typeof query === 'string' ? parser.parse(query, parserOptions) : query

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

    links: function (url: string, totalCount: number) {
      const offset = parsedOptions.skip || 0
      const limit = Math.min(parsedOptions.limit || 0, totalCount)
      const links: { prev: string; first: string; next: string; last: string } = {} as any
      const last: { pages: number; offset: number } = {} as any

      if (!limit) {
        return null
      }

      if (offset > 0) {
        queryString[parameters.offset] = Math.max(offset - limit, 0)
        links.prev = url + '?' + parser.stringify(queryString)
        queryString[parameters.offset] = 0
        links.first = url + '?' + parser.stringify(queryString)
      }
      if (offset + limit < totalCount) {
        last.pages = Math.ceil(totalCount / limit)
        last.offset = (last.pages - 1) * limit

        queryString[parameters.offset] = Math.min(offset + limit, last.offset)
        links.next = url + '?' + parser.stringify(queryString)
        queryString[parameters.offset] = last.offset
        links.last = url + '?' + parser.stringify(queryString)
      }
      return links
    },
  }
}

export = qsToMongo
