import * as formRules from '../../utils/institute/formRules';
import {isValidPEN, checkEnrolledProgramLength} from '../../utils/validation';

// contains the mappings for validation field errors used in StepTwoValidateData.vue
// type: refers to the type of user input example input => <v-text-input>, select => <v-select>
// label: refers to label in input field.
// key: refers to the property in sdcSchoolCollectionStudent.
// options: various attributes to add into the input fields. further explanation below
// {
// rules: custom rules for input element
// items: only for type select and multiselect refers to the pinia store where the dropdown items reside
// itemValue: only for type select and multiselect refers to where we grab the value
// }

export const SDC_VALIDATION_FIELD_MAPPINGS = Object.freeze({
  LOCALID: {label: 'Local ID', key: 'localID', type: 'input', options: {maxlength: '12'}},
  STUDENT_PEN: {label: 'PEN', key: 'studentPen', type: 'input', options: {maxlength: '9', rules: [v => isValidPEN(v) || 'Must be a valid PEN']}},
  LEGAL_FIRST_NAME: {label: 'Legal Given', key: 'legalFirstName', type: 'input', options: {maxlength: '255'}},
  LEGAL_MIDDLE_NAMES: {label: 'Legal Middle', key: 'legalMiddleNames', type: 'input', options: {maxlength: '255'}},
  LEGAL_LAST_NAME: {label: 'Legal Surname', key: 'legalLastName', type: 'input', options: {maxlength: '255', rules: [formRules.required()]}},
  USUAL_FIRST_NAME: {label: 'Usual Given', key: 'usualFirstName', type: 'input', options: {maxlength: '255'}},
  USUAL_MIDDLE_NAMES: {label: 'Usual Middle', key: 'usualMiddleNames', type: 'input', options: {maxlength: '255'}},
  USUAL_LAST_NAME: {label: 'Usual Surname', key: 'usualLastName', type: 'input', options: {maxlength: '255'}},
  DOB: {label: 'Birthdate', key: 'dob', type: 'datePicker', options: {rules: [formRules.required()]}},
  GENDER_CODE: {label: 'Gender', key: 'gender', type: 'select', options: {rules: [formRules.required()], items: 'genderCodes', itemValue: 'genderCode'}},
  SPECIAL_EDUCATION_CATEGORY_CODE: {label: 'Inclusive Education Category', key: 'specialEducationCategoryCode', type: 'select', options: {items: 'specialEducationCodes', itemValue: 'specialEducationCategoryCode'}},
  SCHOOL_FUNDING_CODE: {label: 'Funding Code', key: 'schoolFundingCode', type: 'select', options: {items: 'schoolFundingCodes', itemValue: 'schoolFundingCode'}},
  NATIVE_ANCESTRY_IND: {label: 'Indigenous Ancestry', key: 'nativeAncestryInd', type: 'select', options: {rules: [formRules.required()], items: 'ancestryItems', itemValue:'code'}},
  HOME_LANGUAGE_SPOKEN_CODE: {label: 'Home Language Spoken Code', key: 'homeLanguageSpokenCode', type: 'select', options: {items: 'homeLanguageSpokenCodes', itemValue: 'homeLanguageSpokenCode'}},
  OTHER_COURSES: {label: 'Other Courses', key: 'otherCourses', type: 'select', options: {items: 'otherCoursesValidNumbers', itemValue: 'otherCourses'}},
  SUPPORT_BLOCKS: {label: 'Support Blocks', key: 'supportBlocks', type: 'select', options: {items: 'supportBlocksValidNumbers', itemValue: 'supportBlocks'}},
  ENROLLED_GRADE_CODE: {label: 'Enrolled Grade Codes', key: 'enrolledGradeCode', type: 'select', options: {items: 'enrolledGradeCodes', itemValue: 'enrolledGradeCode'}},
  ENROLLED_PROGRAM_CODE: {label: 'Program Codes', key: 'filteredEnrolledProgramCodes', type: 'multiselect', options: {rules:[v => checkEnrolledProgramLength(v) || 'Select a maximum of 8 Enrolled Programs'], items: 'enrolledProgramCodes', itemValue: 'enrolledProgramCode'}},
  CAREER_PROGRAM_CODE: {label: 'Career Code', key: 'careerProgramCode', type: 'select', options: {items: 'careerProgramCodes', itemValue: 'careerProgramCode'}},
  NUMBER_OF_COURSES: {label: 'Number of Courses', key: 'numberOfCourses', type: 'select', options: {maxlength: '4'}},
  BAND_CODE: {label: 'Band Codes', key: 'bandCode', type: 'select', options: {items: 'bandCodes', itemValue: 'bandCode'}},
  POSTAL_CODE: {label: 'Postal Code', key: 'postalCode', type: 'input', options: {maxlength: '6'}}
});
