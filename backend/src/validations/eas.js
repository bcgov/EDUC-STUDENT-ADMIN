const { object, string, boolean, number, array } = require('yup');
const { baseRequestSchema } = require('./base');

const putStudentAssessmentSchema = object({
  body: object({
    assessmentStudentID: string().nonNullable(),
    sessionID:string().nonNullable(),
    districtID: string().nonNullable(),
    schoolID: string().nonNullable(),
    assessmentCenterID: string().nullable().optional(),
    assessmentID:string().nonNullable(),
    assessmentTypeCode: string().nonNullable(),
    studentID: string().nonNullable(),
    pen: string().max(9).nonNullable(),
    localID: string().max(12).nonNullable(),
    givenName: string().max(25).nonNullable(),
    surName: string().max(25).nonNullable(),
    isElectronicExam: boolean().nonNullable(),
    proficiencyScore: number().nullable().optional(),
    provincialSpecialCaseCode: string().max(1).nullable().optional(),
    courseStatusCode: string().max(1).nullable().optional(),
    numberOfAttempts: number().nullable().optional(),
    courseMonth: number().optional(),
    courseYear: number().optional(),
    assessmentStudentValidationIssues: array().of(object({
      assessmentStudentValidationIssueID:string().nullable().optional(),
      assessmentStudentID:string().nullable().optional(),
      validationIssueSeverityCode:string().nullable().optional(),
      validationIssueCode:string().nullable().optional(),
      validationIssueFieldCode:string().nullable().optional()
    }).concat(baseRequestSchema)).nullable().optional()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    studentAssessmentID: string().nonNullable(),
  }),
  query: object().noUnknown(),
}).noUnknown();

module.exports = {
  putStudentAssessmentSchema,
};
