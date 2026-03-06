const { object, string, array } = require('yup');

const moveSldSchema = object({
  body: object({
    toStudentPen: string().nonNullable(),
    sdcSchoolCollectionIdsToUpdate: array().of(string().nonNullable())
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown(),
}).noUnknown();

module.exports = {
  moveSldSchema
};
