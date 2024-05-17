interface Projection {
  [key: string]: 0 | 1
}

// Convert comma separated list to a mongo projection.
// for example f('field1,field2,field3') -> {field1:1,field2:1,field3:1}
// if the field4 starts with '-' char it will be omitted instead -> {field4: 0}
export function fieldsToProjection<T>(fields: T): Projection | null {
  let fieldsArray: string[]

  if (Array.isArray(fields)) {
    fieldsArray = fields
  } else if (typeof fields === 'string') {
    fieldsArray = fields.split(',')
  } else {
    return null
  }

  return fieldsArray.reduce((hash: Projection, field: string) => {
    let project: 0 | 1 = 1
    let _field = field
    if (_field.startsWith('-')) {
      _field = _field.substr(1)
      project = 0
    }
    hash[_field.trim()] = project
    return hash
  }, {})
}
