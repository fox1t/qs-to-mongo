interface Projection {
  [key: string]: 0 | 1
}

// Convert comma separated list to a mongo projection.
// for example f('field1,field2,field3') -> {field1:1,field2:1,field3:1}
// if the field4 starts with '-' char it will be omitted instead -> {field4: 0}

export function fieldsToProjection<T extends string | undefined>(
  fields: T,
): T extends string ? Projection : null {
  return fields
    ? fields.split(',').reduce((hash: any, field: string) => {
        let project: 0 | 1 = 1
        if (field.startsWith('-')) {
          field = field.substr(1)
          project = 0
        }
        hash[field.trim()] = project
        return hash
      }, {})
    : null
}
