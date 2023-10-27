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
  SDC_FUNDING_GROUPS: 'sdc_funding_groups'
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
  COPY_USERS_TO_NEW_SCHOOL: 'COPY_USERS_TO_NEW_SCHOOL',
  SEND_EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE: 'SEND_EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE'
});
const EVENT_OUTCOME = Object.freeze({
  STUDENT_UPDATED: 'STUDENT_UPDATED',
  STUDENT_CREATED: 'STUDENT_CREATED',
  SCHOOL_UPDATED: 'SCHOOL_UPDATED',
  SCHOOL_CREATED: 'SCHOOL_CREATED',
  SCHOOL_MOVED: 'SCHOOL_MOVED',
  USERS_TO_NEW_SCHOOL_COPIED: 'USERS_TO_NEW_SCHOOL_COPIED',
  EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE_SENT: 'EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE_SENT'
});
const EVENT_WS_TOPIC = 'EVENT_WS_TOPIC';
const INSTITUTE_CACHE_REFRESH_TOPIC = 'INSTITUTE_CACHE_REFRESH_TOPIC';
const WS_MOVE_SCHOOL_TOPIC = 'WS_MOVE_SCHOOL_TOPIC';
const WS_CREATE_SCHOOL_TOPIC = 'WS_CREATE_SCHOOL_TOPIC';
const WS_NEW_SECURE_MESSAGE_TOPIC = 'WS_NEW_SECURE_MESSAGE_TOPIC';
module.exports = {
  FILTER_OPERATION,
  CONDITION,
  VALUE_TYPE,
  PEN_REQ_BATCH_STATUS_CODES,
  EVENT_TYPE,
  EVENT_OUTCOME,
  EVENT_WS_TOPIC,
  INSTITUTE_CACHE_REFRESH_TOPIC,
  CACHE_KEYS,
  WS_MOVE_SCHOOL_TOPIC,
  WS_CREATE_SCHOOL_TOPIC,
  WS_NEW_SECURE_MESSAGE_TOPIC
};
