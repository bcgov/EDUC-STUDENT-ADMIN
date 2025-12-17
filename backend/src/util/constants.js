let cacheKeys;

cacheKeys = {
  AUTHORITY_CONTACT_TYPES: 'authority-contact-types',
  AUTHORITY_TYPES: 'authority-types',
  COUNTRY_CODES: 'country-codes',
  DISTRICT_CONTACT_TYPE_CODES: 'district-contact-types',
  EDX_MINISTRY_TEAMS: 'ministry-teams',
  EDX_ROLE_PERMISSIONS: 'role-permissions',
  EDX_SECURE_EXCHANGE_DOCUMENT_TYPES: 'exchange-document-types',
  EDX_SECURE_EXCHANGE_STATUS: 'exchange-statuses',
  EDX_SECURE_EXCHANGE_FILE_REQUIREMENTS: 'exchange-file-requirements',
  FACILITY_TYPES: 'facility-types',
  GRADE_CODES: 'grade-codes',
  PROVINCE_CODES: 'province-codes',
  SCHOOL_CATEGORY_TYPES: 'school-category-types',
  SCHOOL_CONTACT_TYPES: 'school-contact-types',
  SCHOOL_FACILITY_TYPES: 'school_facilityTypes',
  SCHOOL_NEIGHBOURHOOD_LEARNING_TYPES: 'school-neighborhood-learning-types',
  SCHOOL_ORGANIZATION_TYPES: 'school-organization-types',
  SCHOOL_REPORTING_REQUIREMENT_CODES: 'school-reporting-requirement-codes',
  FUNDING_GROUPS: 'funding_groups',
  COLLECTION_TYPE_CODES: 'collection-type-codes',
  SDC_DISTRICT_COLLECTION_STATUS_CODES: 'sdc_district_collection_status_codes',
  SDC_SCHOOL_COLLECTION_STATUS_CODES: 'sdc_school_collection_status_codes',
  SDC_BAND_CODES: 'sdc_band_codes',
  SDC_CAREER_PROGRAM_CODES: 'sdc_career_program_codes',
  SDC_ENROLLED_GRADE_CODES: 'sdc_enrolled_grade_codes',
  SDC_ENROLLED_PROGRAM_CODES: 'sdc_enrolled_program_codes',
  SDC_GENDER_CODES: 'sdc_gender_codes',
  SDC_HOME_LANGUAGE_SPOKEN_CODES: 'sdc_home_language_spoken_codes',
  SDC_SCHOOL_FUNDING_CODES: 'sdc_school_funding_code',
  SDC_SPECIAL_ED_CODES: 'sdc_special_ed_codes',
  SDC_VALIDATION_ISSUE_TYPE_CODES: 'sdc_validation_issue_type_codes',
  SDC_PROGRAM_ELIGIBILITY_TYPE_CODES: 'sdc_program_eligibility_type_codes',
  SDC_ZERO_FTE_REASON_CODES: 'sdc_zero_fte_reason_codes',
  SDC_PROGRAM_DUPLICATE_TYPE_CODES: 'sdc_program_duplicate_type_codes',
  GRAD_SCHOOLS: 'grad_schools',
};

const CACHE_KEYS = Object.freeze(cacheKeys);

const FILTER_OPERATION = Object.freeze(
  {
    /**
     * Equal filter operation.
     */
    EQUAL: 'eq',
    /**
     * Not equal filter operation.
     */
    NOT_EQUAL: 'neq',
    /**
     * Greater than filter operation.
     */
    GREATER_THAN: 'gt',
    /**
     * Greater than or equal to filter operation.
     */
    GREATER_THAN_OR_EQUAL_TO: 'gte',
    /**
     * Less than filter operation.
     */
    LESS_THAN: 'lt',
    /**
     * Less than or equal to filter operation.
     */
    LESS_THAN_OR_EQUAL_TO: 'lte',
    /**
     * In filter operation.
     */
    IN: 'in',
    /**
       * Filter to return when none of the child records includes the values
       */
    NONE_IN: 'none_in',
    /**
     * Not in filter operation.
     */
    NOT_IN: 'nin',
    /**
     * Between filter operation.
     */
    BETWEEN: 'btn',
    /**
     * Contains filter operation.
     */
    CONTAINS: 'like',
    /**
     * Contains ignore case filter operation.
     */
    CONTAINS_IGNORE_CASE: 'like_ignore_case',
    /**
     * Starts with filter operation.
     */
    STARTS_WITH: 'starts_with',
    /**
     * Not starts with filter operation.
     */
    NOT_STARTS_WITH: 'not_starts_with',
    /**
     * Starts with ignore case filter operation.
     */
    STARTS_WITH_IGNORE_CASE: 'starts_with_ignore_case',
    /**
     * Ends with filter operation.
     */
    ENDS_WITH: 'ends_with',
    /**
     * In operation that does not include the DISTINCT condition
     */
    IN_NOT_DISTINCT: 'in_not_distinct'
  }
);
const CONDITION = Object.freeze(
  {
    /**
     * And condition.
     */
    AND: 'AND',
    /**
     * Or condition.
     */
    OR: 'OR'
  }
);

const VALUE_TYPE = Object.freeze(
  {
    /**
     * String value type.
     */
    STRING: 'STRING',
    /**
     * Integer value type.
     */
    INTEGER: 'INTEGER',
    /**
     * Long value type.
     */
    LONG: 'LONG',
    /**
     * Date value type.
     */
    DATE: 'DATE',
    /**
     * Date time value type.
     */
    DATE_TIME: 'DATE_TIME',
    /**
     * Uuid value type.
     */
    UUID: 'UUID',
    /**
     * Boolean value type.
     */
    BOOLEAN: 'BOOLEAN'
  }
);

const PEN_REQ_BATCH_STATUS_CODES = Object.freeze(
  {
    ARCHIVED: 'ARCHIVED',
    UNARCHIVED: 'UNARCHIVED',
    LOAD_FAIL: 'LOADFAIL',
    DELETED: 'DELETED',
    LOADED: 'LOADED'
  }
);
const EVENT_TYPE = Object.freeze({
  UPDATE_STUDENT: 'UPDATE_STUDENT',
  CREATE_STUDENT: 'CREATE_STUDENT',
  UPDATE_SCHOOL: 'UPDATE_SCHOOL',
  CREATE_SCHOOL: 'CREATE_SCHOOL',
  UPDATE_DISTRICT: 'UPDATE_DISTRICT',
  CREATE_DISTRICT: 'CREATE_DISTRICT',
  UPDATE_AUTHORITY: 'UPDATE_AUTHORITY',
  CREATE_AUTHORITY: 'CREATE_AUTHORITY',
  UPDATE_GRAD_SCHOOL: 'UPDATE_GRAD_SCHOOL',
  COPY_USERS_TO_NEW_SCHOOL: 'COPY_USERS_TO_NEW_SCHOOL',
  SEND_EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE: 'SEND_EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE',
  CLOSE_CURRENT_COLLECTION_AND_OPEN_NEW_COLLECTION: 'CLOSE_CURRENT_COLLECTION_AND_OPEN_NEW_COLLECTION'
});
const EVENT_OUTCOME = Object.freeze({
  STUDENT_UPDATED: 'STUDENT_UPDATED',
  STUDENT_CREATED: 'STUDENT_CREATED',
  SCHOOL_UPDATED: 'SCHOOL_UPDATED',
  SCHOOL_CREATED: 'SCHOOL_CREATED',
  SCHOOL_MOVED: 'SCHOOL_MOVED',
  USERS_TO_NEW_SCHOOL_COPIED: 'USERS_TO_NEW_SCHOOL_COPIED',
  EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE_SENT: 'EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE_SENT',
  NEW_COLLECTION_CREATED: 'NEW_COLLECTION_CREATED'
});
const EVENT_WS_TOPIC = 'EVENT_WS_TOPIC';
const INSTITUTE_CACHE_REFRESH_TOPIC = 'INSTITUTE_CACHE_REFRESH_TOPIC';
const GRAD_SCHOOL_CACHE_REFRESH_TOPIC = 'GRAD_SCHOOL_CACHE_REFRESH_TOPIC';
const WS_MOVE_SCHOOL_TOPIC = 'WS_MOVE_SCHOOL_TOPIC';
const WS_CREATE_SCHOOL_TOPIC = 'WS_CREATE_SCHOOL_TOPIC';
const WS_NEW_SECURE_MESSAGE_TOPIC = 'WS_NEW_SECURE_MESSAGE_TOPIC';
const WS_CLOSE_COLLECTION_TOPIC = 'WS_CLOSE_COLLECTION_TOPIC';

const ENROLLED_PROGRAM_TYPE_CODE_MAP = Object.freeze({
  FRENCH_ENROLLED_PROGRAM_CODES: ['11', '08', '14', '05'],
  CAREER_ENROLLED_PROGRAM_CODES: ['40', '41', '42', '43'],
  INDIGENOUS_ENROLLED_PROGRAM_CODES: ['29', '33', '36'],
  ENGLISH_ENROLLED_PROGRAM_CODES: ['17'],
});

const DUPLICATE_TYPE_CODES = Object.freeze({
  ENROLLMENT: 'ENROLLMENT',
  PROGRAM: 'PROGRAM'
});

const STUDENT_TYPE_CODES = Object.freeze({
  SCHOOL_AGED: 'isSchoolAged',
  ADULT: 'isAdult',
  PRESCHOOL_AGED: 'isUnderSchoolAged'
});

const assessmentsReportTypeValues = [
  ['registration-detail-csv', 'REGISTRATION_DETAIL_CSV'],
  ['ALL_SESSION_REGISTRATIONS', 'ALL_SESSION_REGISTRATIONS'],
  ['ATTEMPTS', 'ATTEMPTS'],
  ['PEN_MERGES', 'PEN_MERGES'],
  ['pen-issues-csv', 'PEN_ISSUES_CSV'],
  ['registration-summary-by-school', 'REGISTRATION_SUMMARY_BY_SCHOOL'],
  ['SESSION_RESULTS', 'SESSION_RESULTS'],
  ['SCHOOL_STUDENTS_IN_SESSION', 'SCHOOL_STUDENTS_IN_SESSION'],
  ['SCHOOL_STUDENTS_BY_ASSESSMENT', 'SCHOOL_STUDENTS_BY_ASSESSMENT'],
  ['summary-by-form-for-session', 'summary-by-form-for-session'],
  ['summary-by-grade-for-session', 'summary-by-grade-for-session'],
  ['all-detailed-students-in-session-csv', 'all-detailed-students-in-session-csv'],
  ['NME10', 'nme10-item-analysis'],
  ['NMF10', 'nmf10-item-analysis'],
  ['LTE10', 'lte10-item-analysis'],
  ['LTE12', 'lte12-item-analysis'],
  ['LTP10', 'ltp10-item-analysis'],
  ['LTP12', 'ltp12-item-analysis'],
  ['LTF12', 'ltf12-item-analysis'],
  ['lte10-key-summary', 'lte10-key-summary'],
  ['lte12-key-summary', 'lte12-key-summary'],
  ['ltf12-key-summary', 'ltf12-key-summary'],
  ['ltp10-key-summary', 'ltp10-key-summary'],
  ['ltp12-key-summary', 'ltp12-key-summary'],
  ['nme-key-summary', 'nme-key-summary'],
  ['nmf-key-summary', 'nmf-key-summary'],
  ['all-detailed-students-in-session-csv', 'all-detailed-students-in-session-csv'],
  ['doar-prov-summary', 'doar-prov-summary'],
  ['random-sample', 'random-sample']
];
const ASSESSMENTS_REPORT_TYPE_CODE_MAP = Object.freeze(new Map(assessmentsReportTypeValues));

const assessmentsStudentReportTypeValues = [
  ['ISR', 'ISR']
];
const ASSESSMENTS_STUDENT_REPORT_TYPE_CODE_MAP = Object.freeze(new Map(assessmentsStudentReportTypeValues));

const GRAD_TO_PEN_STUDENT_STATUS = Object.freeze({
  DEC: 'D',
  CUR: 'A',
  ARC: 'A',
  MER: 'M',
  TER: 'T'
});

module.exports = {
  FILTER_OPERATION,
  CONDITION,
  VALUE_TYPE,
  PEN_REQ_BATCH_STATUS_CODES,
  GRAD_SCHOOL_CACHE_REFRESH_TOPIC,
  EVENT_TYPE,
  EVENT_OUTCOME,
  EVENT_WS_TOPIC,
  INSTITUTE_CACHE_REFRESH_TOPIC,
  CACHE_KEYS,
  WS_MOVE_SCHOOL_TOPIC,
  WS_CREATE_SCHOOL_TOPIC,
  WS_NEW_SECURE_MESSAGE_TOPIC,
  ENROLLED_PROGRAM_TYPE_CODE_MAP,
  DUPLICATE_TYPE_CODES,
  STUDENT_TYPE_CODES,
  WS_CLOSE_COLLECTION_TOPIC,
  ASSESSMENTS_REPORT_TYPE_CODE_MAP, 
  ASSESSMENTS_STUDENT_REPORT_TYPE_CODE_MAP,
  GRAD_TO_PEN_STUDENT_STATUS
};
