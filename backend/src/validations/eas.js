const { object, string, boolean, number, array } = require('yup');
const { baseRequestSchema } = require('./base');

const putStudentAssessmentSchema = object({
  body: object({
    assessmentStudentID: string().nonNullable(),
    sessionID:string().nonNullable(),
    districtID: string().nullable().optional(),
    schoolID: string().nonNullable(),
    assessmentCenterID: string().nonNullable(),
    assessmentID:string().nonNullable(),
    assessmentTypeCode: string().nonNullable(),
    studentID: string().nonNullable(),
    pen: string().max(9).nonNullable(),
    localID: string().max(12).nonNullable(),
    givenName: string().max(25).nonNullable(),
    surName: string().max(25).nonNullable(),
    isElectronicExam: boolean().nullable().optional(),
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
      validationIssueFieldCode:string().nullable().optional(),
      validationLabel:string().nullable().optional(),
      validationMessage:string().nullable().optional(),
    }).concat(baseRequestSchema)).nullable().optional()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    studentAssessmentID: string().nonNullable(),
  }),
  query: object().noUnknown(),
}).noUnknown();

const fileUploadSchema =  object({
  body:object({
    fileName: string().nonNullable(),
    fileContents: string().nonNullable(),
    fileType: string().nonNullable()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    sessionID: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown(),

const postStudentAssessmentSchema = object({
  body: object({
    sessionID:string().nonNullable(),
    districtID: string().nonNullable(),
    schoolID: string().nonNullable(),
    assessmentCenterID: string().nonNullable(),
    assessmentID:string().nonNullable(),
    assessmentTypeCode: string().nonNullable(),
    studentID: string().nullable().optional(),
    assessmentStudentID: string().nullable().optional(),
    courseStatusCode: string().nullable().optional(),
    numberOfAttempts: string().nullable().optional(),
    pen: string().max(9).nonNullable(),
    localID: string().max(12).nonNullable(),
    givenName: string().max(25).nonNullable(),
    surName: string().max(25).nonNullable(),
    isElectronicExam: boolean().nullable().optional(),
    proficiencyScore: number().nullable().optional(),
    provincialSpecialCaseCode: string().max(1).nullable().optional(),
    assessmentStudentValidationIssues: array().of(object({
      assessmentStudentID:string().nullable().optional(),
      validationIssueSeverityCode:string().nullable().optional(),
      validationIssueCode:string().nullable().optional(),
      validationIssueFieldCode: string().nullable().optional(),
      validationLabel:string().nullable().optional(),
      validationMessage:string().nullable().optional(),
    }).concat(baseRequestSchema)).nullable().optional()
  }).concat(baseRequestSchema).noUnknown(),
  query: object().noUnknown(),
  params: object({
    instituteType: string().nonNullable(),
  }).noUnknown(),
}).noUnknown();

module.exports = {
  putStudentAssessmentSchema,
  fileUploadSchema
  postStudentAssessmentSchema
};
