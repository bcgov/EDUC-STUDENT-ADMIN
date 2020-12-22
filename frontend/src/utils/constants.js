let baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const penRequestBatchRoot = baseRoot + '/penRequestBatch';
const penRequestRoot = baseRoot + '/penRequest';
const sldRequestRoot = baseRoot + '/sld';
const studentRequestRoot = baseRoot + '/studentRequest';
const demographicRoot = baseRoot + '/studentDemographics';
const studentRoot = baseRoot + '/students';
const penServicesRoot = baseRoot + '/pen-services';
const schoolRequestRoot = baseRoot + '/schools';
const penTraxRoot = baseRoot + '/penTrax';
let object = {
  LOGIN: authRoot + '/login',
  LOGOUT: authRoot + '/logout',
  SESSION_EXPIRED: authRoot + '/logout?sessionExpired=true',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  USER: authRoot + '/user',

  penRequestBatch: {
    ROOT_ENDPOINT: penRequestBatchRoot,
    STATS_URL: penRequestBatchRoot + '/stats',
    FILES_URL: penRequestBatchRoot,
    STUDENTS_SEARCH_URL: penRequestBatchRoot + '/students',
    STUDENT_STATUS_CODE_URL: penRequestBatchRoot + '/studentStatusCodes',
    MATCH_OUTCOME_URL: penRequestBatchRoot + '/matchOutcome',
    STUDENT_INFO_MACROS_URL: penRequestBatchRoot + '/studentInfoMacros',
    PRB_VALIDATION_FIELD_CODE_URL: penRequestBatchRoot + '/prbValidationFieldCodes',
    PRB_VALIDATION_ISSUE_SEVERITY_CODE_URL: penRequestBatchRoot + '/prbValidationSeverityCodes',
    PRB_VALIDATION_ISSUE_TYPE_CODE_URL: penRequestBatchRoot + '/prbValidationTypeCodes',
  },

  penRequest: {
    ROOT_ENDPOINT: penRequestRoot,
    SEARCH_URL: penRequestRoot + '/',
    DUPLICATE_REQUESTS_URL: penRequestRoot + '/duplicatePenRequests',
    STATUSES_URL: penRequestRoot + '/codes/requeststatuses',
    DOCUMENT_TYPES_URL: penRequestRoot + '/codes/documentTypes',
    COMPLETE_URL: penRequestRoot + '/complete',
    REJECT_URL: penRequestRoot + '/reject',
    RETURN_URL: penRequestRoot + '/return',
    MACRO_URL: penRequestRoot + '/macros',
    UNLINK_URL: penRequestRoot + '/unlink',
    STATS_URL: penRequestRoot + '/stats'
  },

  sld: {
    ROOT_ENDPOINT: sldRequestRoot,
    STUDENT_HISTORY_URL: sldRequestRoot + '/studentHistory'
  },

  studentRequest: {
    ROOT_ENDPOINT: studentRequestRoot,
    SEARCH_URL: studentRequestRoot + '/',
    DUPLICATE_REQUESTS_URL: studentRequestRoot + '/duplicatePenRequests',
    STATUSES_URL: studentRequestRoot + '/codes/requeststatuses',
    DOCUMENT_TYPES_URL: studentRequestRoot + '/codes/documentTypes',
    COMPLETE_URL: studentRequestRoot + '/complete',
    REJECT_URL: studentRequestRoot + '/reject',
    RETURN_URL: studentRequestRoot + '/return',
    MACRO_URL: studentRequestRoot + '/macros',
    STATS_URL: studentRequestRoot + '/stats'
  },

  student: {
    ROOT_ENDPOINT: studentRoot,
    SEARCH_URL: studentRoot + '/search',
    GENDER_CODE_URL: studentRoot + '/genderCodes',
    DEMOG_CODE_URL: studentRoot + '/demogCodes',
    STATUS_CODE_URL: studentRoot + '/statusCodes',
    GRADE_CODE_URL: studentRoot + '/gradeCodes',
    TWIN_REASON_CODE_URL: studentRoot + '/twinReasonCodes',
    HISTORY_ACTIVITY_CODE_URL: studentRoot + '/historyActivityCodes',
    GET_ALL_STUDENTS_BY_IDS: studentRoot + '/allStudents',
  },
  SCHOOL_DATA_URL: schoolRequestRoot,
  penServices: {
    ROOT_ENDPOINT: penServicesRoot,
    VALIDATE_DEMOGRAPHICS: penServicesRoot + '/demog-validation'
  },
  STUDENT_DATA_URL: studentRoot,
  SEARCH_BY_PEN: demographicRoot,
  PEN_TRAX_URL: penTraxRoot,
};

//endpoints
export const Routes = Object.freeze(object);

export const Statuses = Object.freeze(
  {
    AUTO_MATCH_RESULT_CODES: {
      ONE_MATCH: 'ONEMATCH',
      MANY_MATCHES: 'MANYMATCHES',
      ZERO_MATCHES: 'ZEROMATCHES',
      RIGHT_PEN: 'RIGHTPEN',
      WRONG_PEN: 'WRONGPEN'
    },
    penRequest: {
      DRAFT: 'DRAFT',
      FIRST_REVIEW: 'INITREV',
      RETURNED: 'RETURNED',
      SECOND_REVIEW: 'SUBSREV',
      AUTO_MATCH: 'AUTO',
      MANUAL_MATCH: 'MANUAL',
      REJECTED: 'REJECTED',
      UNMATCHED: 'UNMATCHED',
      ABANDONED: 'ABANDONED'
    },
    studentRequest: {
      DRAFT: 'DRAFT',
      FIRST_REVIEW: 'INITREV',
      RETURNED: 'RETURNED',
      SECOND_REVIEW: 'SUBSREV',
      COMPLETED: 'COMPLETED',
      REJECTED: 'REJECTED',
      ABANDONED: 'ABANDONED'
    }
  }
);

export const REQUEST_TYPES = Object.freeze(
  {
    penRequest: {
      name: 'penRequest',
      label: 'PEN Request',
      searchLabel: 'Select PEN request statuses to view',
      path: '/gmp',
      detailName: 'GMP detail'
    },
    studentRequest: {
      name: 'studentRequest',
      label: 'UMP Request',
      searchLabel: 'Select UMP request statuses to view',
      path: '/ump',
      detailName: 'UMP detail',
      penName: 'recordedPen'
    },
    studentSearch: {
      name: 'studentSearch',
      label: 'Student Search',
      type: {
        basic: 'basic',
        advanced: 'advanced'
      },
      path: {
        basic: '/studentSearch/basic',
        advanced: '/studentSearch/advanced'
      }
    },
    student: {
      name: 'student',
      label: 'student detail',
      path: '/student/'
    },
    penRequestBatch: {
      name: 'penRequestBatch',
      label: 'PEN Request Files',
      path: '/penRequestBatch',
    }
  }
);
/**
 * Source of truth for field Names in  StudentDetails.vue and its child components.
 * @type {Readonly<{GRADE_CODE: string, TWINS: string, MINCODE: string, GRADE_YEAR: string, CREATED_DATE: string, LEGAL_FIRST_NAME: string, USUAL_LAST_NAME: string,
 * STATUS_CODE: string, GRAD_DATE: string, GENDER_CODE: string, MERGED_TO: string, LEGAL_LAST_NAME: string, POSTAL_CODE: string, DEMOG_CODE: string, TRAX_STATUS: string,
 * DOB: string, LEGAL_MIDDLE_NAMES: string, UPDATED_DATE: string, PEN: string, USUAL_MIDDLE_NAMES: string, MERGED_FROM: string, USUAL_FIRST_NAME: string, LOCAL_ID: string, MEMO: string}>}
 */
export const STUDENT_DETAILS_FIELDS = Object.freeze(
  {
    LEGAL_LAST_NAME: 'legalLastName',
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_MIDDLE_NAMES: 'legalMiddleNames',
    USUAL_LAST_NAME: 'usualLastName',
    USUAL_FIRST_NAME: 'usualFirstName',
    USUAL_MIDDLE_NAMES: 'usualMiddleNames',
    GRADE_CODE: 'gradeCode',
    GRADE_YEAR: 'gradeYear',
    POSTAL_CODE: 'postalCode',
    TWINS: 'twins',
    MERGED_TO: 'mergedTo',
    MERGED_FROM: 'mergedFrom',
    DOB: 'dob',
    GENDER_CODE: 'genderCode',
    DEMOG_CODE: 'demogCode',
    TRAX_STATUS: 'traxStatus',
    GRAD_DATE: 'gradDate',
    CREATED_DATE: 'createdDate',
    UPDATED_DATE: 'updatedDate',
    LOCAL_ID: 'localID',
    MINCODE: 'mincode',
    MEMO: 'memo',
    PEN: 'pen',
    STATUS_CODE: 'statusCode'
  }
);

export const PEN_REQUEST_STUDENT_VALIDATION_FIELD_CODES_TO_STUDENT_DETAILS_FIELDS_MAPPER = Object.freeze(
  {
    LOCALID: STUDENT_DETAILS_FIELDS.LOCAL_ID,
    LEGALFIRST: STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME,
    LEGALMID: STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES,
    LEGALLAST: STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME,
    USUALFIRST: STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME,
    USUALMID: STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES,
    USUALLAST: STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME,
    POSTALCODE: STUDENT_DETAILS_FIELDS.POSTAL_CODE,
    GRADECODE: STUDENT_DETAILS_FIELDS.GRADE_CODE,
    BIRTHDATE: STUDENT_DETAILS_FIELDS.DOB,
    GENDER: STUDENT_DETAILS_FIELDS.GENDER_CODE
  }
);

export const STUDENT_CODES = Object.freeze(
  {
    ACTIVE: 'A',
    DECEASED: 'D',
    DELETED: 'X',
    MERGED: 'M'
  }
);
export const PEN_REQ_BATCH_STUDENT_REQUEST_CODES = Object.freeze(
  {
    FIXABLE: 'FIXABLE',
    INFOREQ: 'INFOREQ',
    MATCHEDSYS: 'MATCHEDSYS',
    MATCHEDUSR: 'MATCHEDUSR',
    NEWPENSYS: 'NEWPENSYS',
    NEWPENUSR: 'NEWPENUSR',
    ERROR: 'ERROR',
    REPEAT: 'REPEAT',
    LOADED: 'LOADED'
  }
);
export const PAGE_TITLES = Object.freeze(
  {
    COMPARE_STUDENTS: 'Compare/View',
    DASHBOARD: 'Dashboard',
    GMP: 'Get My Pen',
    GMP_DETAILS: 'GetMyPen Request Details',
    UMP: 'Update My Pen',
    UMP_DETAILS: 'UMP Details',
    STUDENT_SEARCH: 'Student Search',
    STUDENT_DETAILS: 'Student Details',
    PEN_REQ_FILES: 'PEN Request Files',
    PEN_MATCH: 'PEN Match',
    PEN_REQ_BATCH_STUDENT_LIST: 'PEN Request List',
    PEN_REQ_BATCH_STUDENT_DETAILS: 'PEN Request Details',
    CREATE_NEW_PEN: 'Create New PEN'
  }
);

export const SEARCH_FILTER_OPERATION = Object.freeze(
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
     * Starts with ignore case filter operation.
     */
    STARTS_WITH_IGNORE_CASE: 'starts_with_ignore_case'
  }
);

export const SEARCH_CONDITION = Object.freeze(
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

export const SEARCH_VALUE_TYPE = Object.freeze(
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
    UUID: 'UUID'
  }
);

export const PRB_SAGA_NAMES = Object.freeze(
  {
    PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA: 'PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA',
    PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_SAGA: 'PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_SAGA',
    PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA: 'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA',
  }
);
