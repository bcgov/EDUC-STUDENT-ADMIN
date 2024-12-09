const { object, string, date } = require('yup');

const baseRequestSchema = object({
  createDate: date().nullable().optional(),
  createUser: string().nullable().max(100).optional(),
  updateDate: date().nullable().optional(),
  updateUser: string().nullable().max(100).optional(),
}).noUnknown();

module.exports = {
  baseRequestSchema,
};
