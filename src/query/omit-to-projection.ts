interface NegativeProjection {
  [key: string]: 0
}

// Convert comma separated list to a mongo projection which specifies fields to omit.
// for example f('field2') -> {field2: 0}
export function omitFieldsToProjection(omitFields: string | undefined) {
  return omitFields
    ? omitFields.split(',').reduce((hash: NegativeProjection, omitField: string) => {
        hash[omitField.trim()] = 0
        return hash
      }, {})
    : null
}
