interface NegativeProjection {
  [key: string]: 0
}

// Convert comma separated list to a mongo projection which specifies fields to omit.
// for example f('field2') -> {field2: 0}
export function omitFieldsToProjection<T extends string | undefined>(
  omitFields: T,
): T extends string ? NegativeProjection : null {
  return omitFields
    ? omitFields.split(',').reduce((hash: any, omitField: string) => {
        hash[omitField.trim()] = 0
        return hash
      }, {})
    : null
}
