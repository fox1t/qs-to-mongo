import { regexpTest } from '../convert/get-typed-value'
import { type FieldQueryCriteria, convertToMongoOperators } from '../convert/mongo-operators'

interface Options {
  ignore?: string[]
  dateFields?: string[]
  objectIdFields?: string[]
  fullTextFields?: string[]
  qParameter?: string
}

// Checks for keys that are ordinal positions, such as {'0':'one','1':'two','2':'three'}
// This function is needed to exclude arrays like from objects
const hasOrdinalKeys = (obj: { [key: string]: unknown }): boolean => {
  let c = 0
  for (const key in obj) {
    if (Number(key) !== c++) {
      return false
    }
  }
  return true
}

// Convert query parameters to a mongo query criteria.
// for example {field1:"red","field2>2":""} becomes {field1:"red",field2:{$gt:2}}
export function queryCriteriaToMongo<T extends { [key: string]: unknown }>(
  query: T,
  { dateFields, ignore, objectIdFields, fullTextFields, qParameter }: Options = {},
) {
  const criteria: { [key: string]: unknown } = {}
  // check if dateFields is inside fullTExtFields and extend it
  for (const key of Object.keys(query)) {
    if (!ignore || ignore.indexOf(key) === -1 || key === qParameter) {
      // check here if key is q parameter
      if (key === qParameter) {
        if (!Array.isArray(fullTextFields) || fullTextFields.length === 0) {
          throw new Error('Fulltext search is not enabled for this resource.')
        }
        criteria.$or = fullTextFields
          .map(field => {
            const regexp = regexpTest(query[key] as string)
            if (regexp?.[1]?.length) {
              const words = regexp[1].split(' ').filter(Boolean)
              if (words.length > 1) {
                const andArray: { [key: string]: FieldQueryCriteria['value'] }[] = []
                for (const word of words) {
                  const regexpedWord = `/${word}/${regexp[2]}`
                  const wordP = convertToMongoOperators(field, regexpedWord, {
                    dateFields,
                    objectIdFields,
                  })
                  if (wordP) {
                    andArray.push({ [field]: wordP.value })
                  }
                }
                return { $and: andArray }
              }
            }
            const p = convertToMongoOperators(field, query[key] as string, {
              dateFields,
              objectIdFields,
            })
            if (p) {
              return { [field]: p.value }
            }
          })
          .filter(Boolean)
      } else {
        const queryObj = query[key]
        const deep =
          typeof queryObj === 'object' && !hasOrdinalKeys(queryObj as { [key: string]: unknown })
        const p = deep
          ? {
              key: key,
              value: queryCriteriaToMongo(queryObj as { [key: string]: unknown }, {
                dateFields,
                objectIdFields,
              }),
            }
          : convertToMongoOperators(key, queryObj as string, { dateFields, objectIdFields })

        if (p) {
          if (!criteria[p.key]) {
            criteria[p.key] = p.value
          } else {
            criteria[p.key] = Object.assign(criteria[p.key] as object, p.value)
          }
        }
      }
    }
  }
  return criteria
}
