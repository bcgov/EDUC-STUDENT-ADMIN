let baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const penRequestBatchRoot = baseRoot + '/penRequestBatch';
const penRequestRoot = baseRoot + '/penRequest';
const digitalIDRoot = baseRoot + '/digitalID';
const sldRequestRoot = baseRoot + '/sld';
const studentRequestRoot = baseRoot + '/studentRequest';
const demographicRoot = baseRoot + '/studentDemographics';
const studentRoot = baseRoot + '/students';
const penServicesRoot = baseRoot + '/pen-services';
const schoolRequestRoot = baseRoot + '/schools';
const penTraxRoot = baseRoot + '/penTrax';
const penMatchRoot = baseRoot + '/penMatches';
const macroRoot = baseRoot + '/macros';
const nominalRollRoot= baseRoot+'/nominal-roll';
const edxRoot= baseRoot+'/edx';
const instituteRoot = baseRoot + '/institute';
const cacheRoot = baseRoot + '/cache';
const sdcRoot = baseRoot + '/sdc';
const gdcRoot = baseRoot + '/gdc';
const ministrySDCReportsRoot = baseRoot + '/ministrySDCReports';
const easRoot = baseRoot + '/eas';

let object = {
  LOGIN: authRoot + '/login',
  LOGOUT: authRoot + '/logout',
  SESSION_EXPIRED: authRoot + '/logout?sessionExpired=true',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  USER: authRoot + '/user',
  SESSION_REMAINING_TIME: authRoot + '/user-session-remaining-time',
  CONFIG: baseRoot + '/config',
  SDC_MINISTRY_REPORTS: ministrySDCReportsRoot,
  POSTED_DUPES_REPORT: ministrySDCReportsRoot + '/download/headcount/posted-duplicates/',

  digitalIdentity: {
    ROOT_ENDPOINT: digitalIDRoot,
    DIGITAL_ID_LIST_URL: digitalIDRoot + '/list'
  },

  penRequestBatch: {
    ROOT_ENDPOINT: penRequestBatchRoot,
    STATS_URL: penRequestBatchRoot + '/stats',
    FILES_URL: penRequestBatchRoot,
    SOURCE_URL: penRequestBatchRoot + '/source',
    SOURCE_METADATA_URL: penRequestBatchRoot + '/sourceMetadata',
    STUDENTS_SEARCH_URL: penRequestBatchRoot + '/students',
    SAME_PEN_SEARCH_URL: penRequestBatchRoot + '/same-pen',
    STUDENT_STATUS_CODE_URL: penRequestBatchRoot + '/studentStatusCodes',
    MATCH_OUTCOME_URL: penRequestBatchRoot + '/matchOutcome',
    STUDENT_INFO_MACROS_URL: macroRoot + '/?businessUseTypeCode=PENREG&macroTypeCode=INFOREQ',
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
    MACRO_URL: macroRoot + '/?businessUseTypeCode=GMP',
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
    MACRO_URL: macroRoot + '/?businessUseTypeCode=UMP',
    STATS_URL: studentRequestRoot + '/stats'
  },

  student: {
    ROOT_ENDPOINT: studentRoot,
    SEARCH_URL: studentRoot + '/search',
    SEARCH_BY_PEN_URL: studentRoot + '/',
    GENDER_CODE_URL: studentRoot + '/activeGenderCodes',
    DEMOG_CODE_URL: studentRoot + '/demogCodes',
    STATUS_CODE_URL: studentRoot + '/statusCodes',
    GRADE_CODE_URL: studentRoot + '/gradeCodes',
    HISTORY_ACTIVITY_CODE_URL: studentRoot + '/historyActivityCodes',
    GET_ALL_STUDENTS_BY_IDS: studentRoot + '/allStudents',
    DOC_TYPE_CODES_URL: studentRoot + '/document-type-codes'
  },
  SCHOOL_DATA_URL: schoolRequestRoot,
  institute: {
    ROOT_ENDPOINT: instituteRoot,
    SCHOOL_DATA_URL: instituteRoot + '/school',
    STUDENT_REGISTRATION_CONTACTS: instituteRoot + '/studentRegistrationContacts',
    STUDENT_REGISTRATION_CONTACT: instituteRoot + '/studentRegistrationContact',
    SCHOOL_NOTE_URL: instituteRoot + '/school/note',
    SCHOOL_CONTACT_URL: instituteRoot + '/school/contact',
    SCHOOL_PAGINATED_DATA_URL: instituteRoot + '/schoolsPaginated',
    FUNDING_DATA_URL: instituteRoot + '/funding-groups',
    SCHOOL_HISTORY_PAGINATED_DATA_URL: instituteRoot + '/schoolHistoryPaginated',
    DISTRICT_HISTORY_PAGINATED_DATA_URL: instituteRoot + '/districtHistoryPaginated',
    SCHOOL_MOVE_URL: instituteRoot + '/school/moveSchool',
    DISTRICT_DATA_URL: instituteRoot + '/district',
    DISTRICT_CONTACT_URL: instituteRoot + '/district/contact',
    DISTRICT_NOTE_URL: instituteRoot + '/district/note',
    AUTHORITY_DATA_URL: instituteRoot + '/authority',
    AUTHORITY_CONTACT_URL: instituteRoot + '/authority/contact',
    AUTHORITY_NOTE_URL: instituteRoot + '/authority/note',
    AUTHORITIES_PAGINATED_DATA_URL: instituteRoot + '/authoritiesPaginated',
  },
  cache:{
    ROOT_ENDPOINT: cacheRoot,
    SCHOOL_DATA_URL: cacheRoot + '/school',
    DISTRICT_DATA_URL: cacheRoot + '/district',
    AUTHORITY_DATA_URL: cacheRoot + '/authority',
    FACILITY_TYPES_URL: cacheRoot + '/facility-types',
    DISTRICT_CONTACT_TYPE_CODES: cacheRoot + '/district-contact-types',
    SCHOOL_CATEGORY_TYPES_URL: cacheRoot + '/school-category-types',
    SCHOOL_ORGANIZATION_TYPES_URL: cacheRoot + '/school-organization-types',
    SCHOOL_NEIGHBORHOOD_LEARNING_TYPES_URL: cacheRoot + '/school-neighborhood-learning-types',
    SCHOOL_REPORTING_REQUIREMENT_TYPES_URL: instituteRoot +
      '/reporting-requirement-codes',
    AUTHORITY_TYPES_URL: cacheRoot + '/authority-types',
    AUTHORITY_CONTACT_TYPES_URL: cacheRoot + '/authority-contact-types',
    GRADE_TYPES_URL: cacheRoot + '/grade-codes',
    PROVINCES_URL: cacheRoot + '/province-codes',
    COUNTRIES_URL: cacheRoot + '/country-codes',
    SCHOOL_CONTACT_TYPES_URL: cacheRoot + '/school-contact-types',
    SCHOOL_CATEGORY_FACILITY_TYPE_URL: cacheRoot + '/school-category-facility-type',
  },
  penServices: {
    ROOT_ENDPOINT: penServicesRoot,
    VALIDATE_DEMOGRAPHICS: penServicesRoot + '/demog-validation',
    MACRO_URL: macroRoot + '/?businessUseTypeCode=PENREG&macroTypeCode=MERGE',
  },
  STUDENT_DATA_URL: studentRoot,
  SEARCH_BY_PEN: demographicRoot,
  PEN_TRAX_URL: penTraxRoot,
  penMatch: {
    ROOT_ENDPOINT: penMatchRoot,
    POSSIBLE_MATCHES: penMatchRoot + '/possible-match',
    POSSIBLE_MATCH_REASON_CODES: penMatchRoot + '/possible-match-reason-codes'
  },
  MACRO_URL: macroRoot,
  nominalRoll:{
    ROOT_ENDPOINT: nominalRollRoot,
    PAGINATED_ENDPOINT: nominalRollRoot + '/search'
  },
  edx: {
    ROOT_ENDPOINT: edxRoot,
    STATS_URL: edxRoot + '/exchange/stats',
    EXCHANGE_URL: edxRoot + '/exchange',
    EXCHANGE_FILE_REQUIREMENTS_URL: edxRoot + '/exchange/file-requirements',
    STATUSES_URL: edxRoot + '/exchange/statuses',
    CLAIM_URL: edxRoot + '/exchange/claim',
    CLAIM_ONE_URL: edxRoot + '/exchange/claimOne',
    USERS_URL: edxRoot + '/users',
    VALID_USERS_FOR_MESSAGING: edxRoot + '/valid-schools-for-messaging',
    VALID_DISTRICT_USERS_FOR_MESSAGING: edxRoot + '/valid-districts-for-messaging',
    EDX_SCHOOL_USERS_URL: edxRoot + '/users/school',
    EDX_DISTRICT_USERS_URL: edxRoot + '/users/district',
    EXCHANGE_ACCESS_ROLES_URL: edxRoot + '/users/roles',
    EDX_REMOVE_SCHOOL_USER: edxRoot + '/users/remove/school',
    EDX_REMOVE_DISTRICT_USER: edxRoot + '/users/remove/district',
    EDX_RELINK_SCHOOL_USER: edxRoot + '/users/relink/school',
    EDX_RELINK_DISTRICT_USER: edxRoot + '/users/relink/district',
    CREATE_SCHOOL: edxRoot + '/create-school',
    PRIMARY_ACTIVATION_CODE_URL: edxRoot + '/users/activation-code/primary',
    NEW_SCHOOL_USER_ACTIVATION_INVITE: edxRoot + '/school-user-activation-invite',
    NEW_DISTRICT_USER_ACTIVATION_INVITE: edxRoot + '/district-user-activation-invite',
    FIND_DISTRICT_INVITATIONS: edxRoot + '/findAll-district-invites',
    FIND_SCHOOL_INVITATIONS: edxRoot + '/findAll-school-invites',
    UPLOAD_ONBOARDING_FILE: edxRoot + '/exchange/onboarding-file'
  },
  sdc: {
    BASE_URL: sdcRoot,
    SDC_SCHOOL_COLLECTION: sdcRoot + '/sdcSchoolCollection',
    COLLECTION: sdcRoot + '/collection',
    ACTIVE_COLLECTION: sdcRoot + '/collection/active',
    COLLECTION_PAGINATED: sdcRoot + '/collection/paginated',
    FUNDING_DATA_SNAPSHOT_URL: sdcRoot + '/funding-groups-snapshot',
    COLLECTION_TYPE_CODES_URL: sdcRoot + '/collection-type-codes',
    SDC_DISTRICT_COLLECTION: sdcRoot + '/sdcDistrictCollection',
    SDC_DISTRICT_COLLECTION_STATUS_CODES: sdcRoot + '/district-collection-status-codes',
    SDC_SCHOOL_COLLECTION_STATUS_CODES: sdcRoot + '/school-collection-status-codes',
    SDC_BAND_CODES: sdcRoot + '/band-codes',
    SDC_CAREER_PROGRAM_CODES: sdcRoot + '/career-program-codes',
    SDC_ENROLLED_GRADE_CODES: sdcRoot + '/enrolled-grade-codes',
    SDC_ENROLLED_PROGRAM_CODES: sdcRoot + '/enrolled-program-codes',
    SDC_GENDER_CODES: sdcRoot + '/gender-codes',
    SDC_HOME_LANGUAGE_SPOKEN_CODES: sdcRoot + '/home-language-spoken-codes',
    SDC_SCHOOL_FUNDING_CODES: sdcRoot + '/school-funding-codes',
    SDC_SPECIAL_ED_CODES: sdcRoot + '/specialEducation-codes',
    SDC_SCHOOL_COLLECTION_STUDENT: sdcRoot + '/sdcSchoolCollectionStudent',
    SDC_VALIDATION_ISSUE_TYPE_CODES: sdcRoot + '/validation-issue-type-codes',
    SDC_PROGRAM_ELIGIBILITY_TYPE_CODES: sdcRoot + '/program-eligibility-issue-codes',
    SDC_ZERO_FTE_REASON_CODES: sdcRoot + '/zero-fte-reason-codes',
  },
  gdc: {
    BASE_URL: gdcRoot,
    ACTIVE_COLLECTIONS: gdcRoot + 'collections',
  },
  eas: {
    BASE_URL: easRoot,
    EAS_ASSESSMENT_SESSIONS: easRoot + '/assessment-sessions',
    GET_ASSESSMENT_TYPES: easRoot + '/assessment-types',
    GET_ASSESSMENT_SPECIALCASE_TYPES: easRoot + '/assessment-specialcase-types',
    ASSESSMENT_STUDENTS: easRoot + '/assessment-registrations/student',
    GET_ASSESSMENT_STUDENTS_PAGINATED: easRoot + '/assessment-registrations/paginated',
    EAS_ASSESSMENT_KEYS: easRoot + '/assessment-keys',

  }
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
    },
    exchange: {
      NEW: 'NEW',
      INPROG: 'INPROG',
      CLOSED: 'CLOSED'
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
    mergeStudents: {
      name: 'mergeStudents',
      label: 'Merge PENs',
      path: '/mergeStudents/'
    },
    penRequestBatch: {
      name: 'penRequestBatch',
      label: 'PEN Request Files',
      path: '/penRequestBatch',
    },
    archivedPENRequestBatch: {
      name: 'archivedRequestBatch',
      label: 'Archived PEN Request Files',
      path: '/archivedRequestBatch',
    },
    failedRequestBatch: {
      name: 'failedRequestBatch',
      label: 'Failed PEN Request Files',
      path: '/failedRequestBatch',
    },
    exchange: {
      name: 'exchange',
      label: 'View Secure Messages',
      path: '/edx/exchange',
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
    STATUS_CODE: 'statusCode',
    TRUE_STUDENT_ID: 'trueStudentID',
    DOC_TYPE_CODE: 'documentTypeCode',
    DATE_OF_CONFIRMATION: 'dateOfConfirmation'
  }
);


/*  can be made into an object, if more options are needed in the future for example
 *  export const STUDENT_MERGE_FIELDS = {
       FROM_PREFIX: 'mergeFrom_'
    };
 **/
export const STUDENT_MERGE_FIELD_PREFIX = 'mergeFrom_';
export const STUDENT_MERGE_DETAILS_FIELDS = Object.freeze(
  {
    LEGAL_LAST_NAME: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME}`,
    LEGAL_FIRST_NAME: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME}`,
    LEGAL_MIDDLE_NAMES: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES}`,
    USUAL_LAST_NAME: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME}`,
    USUAL_FIRST_NAME: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME}`,
    USUAL_MIDDLE_NAMES: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES}`,
    GENDER_CODE: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.GENDER_CODE}`,
    DOB: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.DOB}`,
    MINCODE: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.MINCODE}`,
    LOCAL_ID: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.LOCAL_ID}`,
    POSTAL_CODE: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.POSTAL_CODE}`,
    MEMO: `${STUDENT_MERGE_FIELD_PREFIX}${STUDENT_DETAILS_FIELDS.MEMO}`,
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

export const SDC_REPORTS = Object.freeze(
  {
    publicReports: [
      {
        label: 'All Students by District',
        reportID: 'FUNDING_POLICY_REPORT_DISTRICT',
        description:'This report provides all student level data for each student within a particular school district. It lists each student’s school, PEN, local ID, name, birthdate, and gender. Additionally, it shows student information in the following categories: adult, graduated, grade, funding code, courses for grad, support blocks, language program, years in ELL, career program, career code, Indigenous ancestry, Band code, Indigenous support program, and inclusive education.'
      },
      {
        label: 'FSA Registration Report',
        url: object.SDC_MINISTRY_REPORTS + '/headcount/fsa-registration-report/',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/fsa-registration-report/',
        onlyForCollection: ['FEBRUARY', 'SEPTEMBER'],
        description: 'The September version of this report lists all students enrolled in grades 4 and 7. The February version lists students enrolled in grades 3 and 6. This report details each student’s legal first and last name, PEN, and school mincode. This report is only run for the September and February collections. The September report does not include Yukon schools, and the February report contains neither Yukon nor offshore schools.'
      },
      { 
        label: 'School Physical Address Report',
        url: object.SDC_MINISTRY_REPORTS + '/headcount/school-address-report/',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/school-address-report/',
        description: 'This report offers the physical addresses of all schools in the province, regardless of school type. This report does not include offshore schools or schools in the Yukon and will only show information for schools that have submitted data in the given collection.'
      }
    ],
    independentReports: [
      {
        label: 'All Students by Independent School',
        reportID: 'FUNDING_POLICY_REPORT_INDY',
        description: 'This report provides all student level data for each student within a particular independent school. It lists each student’s school, PEN, local ID, name, birthdate, and gender. Additionally, it shows student information in the following categories: adult, graduated, grade, funding code, courses for grad, support blocks, language program, years in ELL, career program, career code, Indigenous ancestry, Band code, Indigenous support program, and inclusive education.'
      }
    ],
    headcountReports: [
      {
        label: 'Independent School Enrolment Headcounts',
        url: object.SDC_MINISTRY_REPORTS + '/headcount/indy-school-enrollment-headcounts/',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/indy-school-enrollment-headcounts/',
        description: 'This report calculates the total enrolment headcounts for each independent school, including independent First Nations schools, broken down by grade.'
      },
      {
        label: 'Independent School Inclusive Education Headcounts',
        url: object.SDC_MINISTRY_REPORTS + '/headcount/indy-inclusive-ed-enrollment-headcounts/',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/indy-inclusive-ed-enrollment-headcounts/',
        description: 'This report calculates the total headcounts of students with Inclusive Education designations in each independent school, including indendent First Nations schools. The headcounts are broken down by Inclusive Education level (1, 2, 3), and further broken down by sub-category (A – Physically  Dependent, B – Deafblind, etc.).'
      },
      {
        label: 'Independent School Inclusive Education Funding Headcounts',
        url: object.SDC_MINISTRY_REPORTS + '/headcount/indy-inclusive-ed-funding-headcounts/',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/indy-inclusive-ed-funding-headcounts/',
        onlyForCollection: ['FEBRUARY'],
        description: 'This report calculates the change in headcounts, from September to February, of students with Inclusive Education designations in each independent school, including indendent First Nations schools. The headcounts are broken down by Inclusive Education level (1, 2, 3) and detail the September total, the February total, the resulting net change between the two, and the positive change of designated students who joined the school since the previous September collection. This report is only run for the February collection.'
      },
      {
        label: 'Offshore School Enrolment Headcounts',
        url: object.SDC_MINISTRY_REPORTS + '/headcount/offshore-enrollment-headcounts/',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/offshore-enrollment-headcounts/',
        description: 'This report calculates the total enrolment headcounts for each offshore school, broken down by grade.'
      },
      {
        label: 'Offshore Spoken Language Headcounts',
        url: object.SDC_MINISTRY_REPORTS + '/headcount/offshore-languages-headcounts/',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/offshore-languages-headcounts/',
        description: 'This report calculates the student headcounts for each offshore school, broken down by the language that students speak at home.'
      },
      {
        label: 'School Enrolment Headcounts',
        url: object.SDC_MINISTRY_REPORTS + '/headcount/school-enrollment-headcounts/',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/school-enrollment-headcounts/',
        description: 'This report calculates the total enrolment headcounts for every school the Ministry serves (including public, independent, offshore, and independent First Nation schools). The headcounts are broken down by grade. The report includes additional information, such as each school’s district number, school number, facility type (standard, continuing education, etc.), and grade range that the school offers.'
      },
      {
        label: 'Eligible Inclusive Education Variance Headcounts',
        reportID: 'INCLUSIVE_EDUCATION_VARIANCE',
        description: 'This report calculates the change in headcounts, from September to February, of students with Inclusive Education designations within a particular school district.  The headcounts are broken down by Inclusive Education level (1, 2, 3, ‘other’) and sub-category (A – Physically  Dependent, B – Deafblind, etc.), as well as by grade level. The report shows the headcounts (both totals and various breakdown categories) for the district in the September collection and the February collection to detail how the student population with Inclusive Education designations has changed between the two collections. This report is only run for the February collection and cannot be downloaded.'
      },
      {
        label: 'Enroled Headcounts and FTEs By School',
        reportID: 'ENROLED_FUNDING_REPORT',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/enrolled-fte-headcounts/',
        description: 'This report calculates the overall headcounts and funded FTEs for all public schools (including standard, continuing education, POLs, and alternate program schools), broken down by grade. Additional information includes a grade-by-grade breakdown of the headcounts for inclusive education levels, ELL, Indigenous ancestry, and French programs for every grade level in each school. The report can only be viewed by downloading it.'
      },
      {
        label: 'Refugee Enroled Headcounts and FTEs',
        reportID: 'ENROLED_FUNDING_REPORT',
        onlyForCollection: ['FEBRUARY'],
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/refugee-enrolment-fte-headcounts/',
        description: 'This report calculates the overall refugee headcounts and funded FTEs for each public school, broken down by grade. It includes public schools with the facility type of standard school or alternate programs. The funded FTEs section has refugee enrollment for each grade, and the headcount section has both the refugee and ELL enrollment for each grade. This report is only run for the February collection and can only be viewed by downloading it.'
      },
      {
        label: 'Inclusive Education Variances - All Districts',
        onlyForCollection: ['FEBRUARY'],
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/inclusive-education-variances-all/',
        description: 'This report calculates the change in headcounts, from September to February, of students with Inclusive Education designations across all school districts. The headcounts are broken down by Inclusive Education level (1, 2, 3, ‘other’) and sub-category (A – Physically  Dependent, B – Deafblind, etc.) in September and February, before providing the resulting variance between the two collections with the same breakdown structure. This data is shown district by district. This report is only run for the February collection (comparing against the previous September collection) and can only viewed by downloading it. '
      },
      {
        label: 'Independent School Funding System - Aggregate Enrollment',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/isfs-prelim-report/',
        description: 'This report is generated for the Independent Schools Funding System (ISFS). '
      },
      {
        label: 'Independent School Funding Report - Standard Student - All',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/indy-funding-report-all/',
        description: 'This report showcases the funding groups (1, 2, 3, or 4), headcounts, and FTEs for each independent school, broken down by grade. The report includes school totals for headcounts and FTEs. Each school has a funding group identified per grade offered at the school. This report can only be viewed by downloading it.'
      },
      {
        label: 'Independent School Funding Report - Standard Student - Funded Only',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/indy-funding-report-funded/',
        description: 'This report calculates the funding groups (1, 2, 3, or 4), headcounts, and funded FTEs for each independent school, broken down by grade. In this report, grades with funding groups 3 or 4 are not included in the FTE totals. The report includes school totals for headcounts and funded FTEs. Each school has a single funding group that applies to every grade that the school offers. This report can only be viewed by downloading it.'
      },
      {
        label: 'Independent School Funding Report - Online Learning',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/online-indy-funding-report/',
        description: 'This report calculates the funding groups (1, 2, 3, or 4), headcounts, and FTEs for each online learning independent school, broken down by grade. The report includes school totals for headcounts and FTEs. Each school has a funding group identified per grade offered at the school. This report can only be viewed by downloading it.'
      },
      {
        label: 'Independent School Funding Report - Non Graduated Adult',
        csvDownloadURL: object.SDC_MINISTRY_REPORTS + '/download/headcount/non-graduated-adult-indy-funding-report/',
        description: 'This report calculates the non-graduated adult headcounts and FTEs for each independent school, broken down by grade. The report includes school totals for non-graduated adult headcounts and FTEs, as well as the funding groups (1, 2, 3, or 4) for each grade. Each school had a funding group identified per grade offered. This report can only be viewed by downloading it.'
      },
    ]
  }
);

export const NOMINAL_ROLL_STUDENT_FIELDS_TO_STUDENT_DETAILS_FIELDS_MAPPER = Object.freeze(
  {
    givenNames: { name: STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME, label: 'Legal Given'},
    surname: { name: STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME, label: 'Legal Surname'},
    grade: { name: STUDENT_DETAILS_FIELDS.GRADE_CODE, label: 'Grade'},
    birthDate: { name: STUDENT_DETAILS_FIELDS.DOB, label: 'Birth Date'},
    gender: { name: STUDENT_DETAILS_FIELDS.GENDER_CODE, label: 'Gen'},
    schoolNumber: { name: STUDENT_DETAILS_FIELDS.MINCODE, label: 'Mincode'},
  }
);

export const STUDENT_DETAILS_FIELDS_TO_NOMINAL_ROLL_STUDENT_FIELDS_MAPPER = Object.freeze(
  Object.fromEntries(Object.entries(NOMINAL_ROLL_STUDENT_FIELDS_TO_STUDENT_DETAILS_FIELDS_MAPPER).map(([key, value]) => [value.name, key]))
);

export const STUDENT_CODES = Object.freeze(
  {
    ACTIVE: 'A',
    DECEASED: 'D',
    DELETED: 'X',
    MERGED: 'M'
  }
);
export const STUDENT_DEMOG_CODES = Object.freeze(
  {
    ACTIVE: 'A',
    CONFIRMED: 'C'
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
    LOADED: 'LOADED',
    DUPLICATE: 'DUPLICATE',
  }
);
export const PEN_REQ_BATCH_STATUS_CODES = Object.freeze(
  {
    HOLD_SIZE: 'HOLD_SIZE',
    DUPLICATE: 'DUPLICATE',
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
    REARCHIVED: 'REARCHIVED',
    UNARCHIVED: 'UNARCHIVED',
    UNARCH_CHG: 'UNARCH_CHG',
    LOAD_FAIL: 'LOADFAIL',
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
    MERGE_STUDENTS: 'Merge PENs',
    PEN_REQ_FILES: 'PEN Request Files',
    PEN_MATCH: 'PEN Match',
    PEN_REQ_BATCH_STUDENT_LIST: 'PEN Request List',
    PEN_REQ_BATCH_STUDENT_DETAILS: 'PEN Request Details',
    CREATE_NEW_PEN: 'Create New PEN',
    ARCHIVED_REQ_FILES: 'Archived PEN Request Files',
    PEN_COORDINATORS: 'Student Registration Contacts',
    NEW_PENS: 'New PENs',
    MACRO_MANAGEMENT: 'Macros',
    BAND_CODE_MANAGEMENT: 'Band Codes',
    NOMINAL_ROLL: 'Nominal Roll',
    NOMINAL_ROLL_STUDENT_LIST: 'Nominal Roll PEN Request List',
    NOMINAL_ROLL_STUDENT_DETAILS: 'Nominal Roll PEN Request Details',
    COMPARE_PENS: 'Compare Students',
    ADMINISTRATION: 'Administration',
    STUDENT_REQUESTS: 'Student Requests',
    ARCHIVED_REQ_BATCH_STUDENT_LIST: 'Archived PEN Request List',
    FAILED_REQ_FILES: 'Failed PEN Request Files',
    HELD_REQ_FILES: 'Held PEN Request Files',
    VIEW_DOC: 'View Document',
    GMP_STATS: 'GMP Stats',
    UMP_STATS: 'UMP Stats',
    STATS_DASHBOARD: 'Student and System Analytics',
    VIEW_MERGES: 'View Merges',
    ANALYTICS: 'Analytics',
    EXCHANGE: 'Secure Messaging Inbox',
    NEW_EXCHANGE: 'New Message',
    VIEW_EXCHANGE: 'Secure Message',
    EXCHANGE_ACCESS: 'EDX School Access',
    EDX_DISTRICT_ACCESS: 'EDX District Access',
    EXCHANGE_USERS: 'EDX School Access',
    NEW_USER_INVITE:'New User',
    DISTRICT_LIST: 'District List',
    DISTRICT_CONTACTS: 'District Contacts',
    SCHOOL_LIST: 'School List',
    GRAD_SCHOOL_LIST: 'Graduation School List',
    SCHOOL_DETAILS: 'School Details',
    AUTHORITIES_LIST: 'Authority List',
    AUTHORITY_DETAILS: 'Authority Details',
    DISTRICT_DETAILS:'District Details',
    AUTHORITY_CONTACTS: 'Authority Contacts',
    SCHOOL_CONTACTS: 'School Contacts',
    SCHOOL_HISTORY: 'School History',
    SCHOOL_MOVE: 'School Move',
    DATA_COLLECTION: 'Data Collection',
    INVITATIONS: 'EDX Invitations',
    CLOSE_COLLECTION: 'Close Collection',
    ASSESSMENTS: 'Assessments',
    GRADUATION: 'Graduation',
    ASSESSMENT_SESSIONS_MANAGEMENT: 'Assessment Sessions',
    ASSESSMENT_DATA_EXCHANGE: 'Assessment Data Exchange',
  }
);

export const MINISTRY_NAME = 'Ministry of Education and Child Care';

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

export const NOMINAL_ROLL_STUDENT_STATUSES = Object.freeze(
  [
    {
      value: 'MATCHEDSYS',
      text: 'Matched by system'
    },
    {
      value: 'MATCHEDUSR',
      text: 'Matched by user'
    },
    {
      value: 'FIXABLE',
      text: 'Fixable Request'
    },
    {
      value: 'ERROR',
      text: 'Error'
    },
    {
      value: 'LOADED',
      text: 'Loaded'
    },
    {
      value: 'IGNORED',
      text: 'Ignored'
    }
  ]
);

export const NOMINAL_ROLL_STUDENT_STATUS_CODES = Object.freeze(
  Object.fromEntries(NOMINAL_ROLL_STUDENT_STATUSES.map(status => [status.value, status.value]))
);

export const EDX_SAGA_REQUEST_DELAY_MILLISECONDS = 2000;

export const FILE_UPLOAD_STATUS = Object.freeze({
  PENDING: 'Pending',
  UPLOADED: 'Upload Successful',
  ERROR: 'Error'
});
