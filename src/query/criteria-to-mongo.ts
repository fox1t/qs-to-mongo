import { convertToMongoOperators } from '../convert/mongo-operators'

interface Options {
  ignore?: string[]
  dateFields?: string[]
  objectIdFields?: string[]
  fullTextFields?: string[]
  qParameter?: string
}

type Criteria<T> = { [key in keyof T]: any }

// Checks for keys that are ordinal positions, such as {'0':'one','1':'two','2':'three'}
// This function is needed to exclude arrays like from objects
const hasOrdinalKeys = (obj: object): boolean => {
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
export function queryCriteriaToMongo<T extends { [key: string]: any }>(
  query: T,
  { dateFields, ignore, objectIdFields, fullTextFields, qParameter }: Options = {},
): Criteria<T> {
  const criteria = {} as Criteria<T>
  // check if dateFields is inside fullTExtFields and extend it
  for (const key of Object.keys(query)) {
    if (!ignore || ignore.indexOf(key) === -1 || key === qParameter) {
      // check here if key is q parameter
      if (key === qParameter) {
        if (!Array.isArray(fullTextFields) || fullTextFields.length === 0) {
          throw new Error(`Fulltext search is not enabled for this resource.`)
        }
        criteria.$or = fullTextFields
          .map(function(field) {
            const p = convertToMongoOperators(field, query[key], { dateFields, objectIdFields })
            if (p) {
              return { [field]: p.value }
            }
          })
          .filter(Boolean)
      } else {
        const deep = typeof query[key] === 'object' && !hasOrdinalKeys(query[key])
        const p = deep
          ? {
              key: key,
              value: queryCriteriaToMongo(query[key], { dateFields, objectIdFields }),
            }
          : convertToMongoOperators(key, query[key], { dateFields, objectIdFields })

        if (p) {
          if (!criteria[p.key]) {
            criteria[p.key] = p.value
          } else {
            criteria[p.key] = Object.assign(criteria[p.key], p.value)
          }
        }
      }
    }
  }
  return criteria
}
