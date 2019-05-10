interface Sort {
  [key: string]: -1 | 1
}
// Convert comma separated list to mongo sort options.
// for example f('field1,+field2,-field3') -> {field1:1,field2:1,field3:-1}
export function sortToMongo<T extends string | undefined>(sort: T): T extends string ? Sort : null {
  return sort
    ? sort.split(',').reduce((hash: any, field: string) => {
        let sign = 1
        if (field.startsWith('-')) {
          field = field.substr(1)
          sign = -1
        }
        hash[field.trim()] = sign
        return hash
      }, {})
    : null
}
