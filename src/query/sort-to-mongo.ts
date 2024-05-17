interface Sort {
  [key: string]: -1 | 1
}
// Convert comma separated list to mongo sort options.
// for example f('field1,+field2,-field3') -> {field1:1,field2:1,field3:-1}
export function sortToMongo(sort: string | undefined): Sort | null {
  return sort
    ? sort.split(',').reduce((hash: Sort, field: string) => {
        let sign: 1 | -1 = 1
        let _field = field
        if (_field.startsWith('-')) {
          _field = _field.substr(1)
          sign = -1
        }
        hash[_field.trim()] = sign
        return hash
      }, {})
    : null
}
