'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = process.env.NODE_ENV || 'local';

nconf.argv()
  .file({file: path.join(__dirname, `${env}.json`)});

nconf.defaults({
  environment: env,
  logoutEndpoint: process.env.KC_DOMAIN + '/protocol/openid-connect/logout',
  siteMinder_logout_endpoint: process.env.SITEMINDER_LOGOUT_ENDPOINT,
  server: {
    frontend: process.env.SERVER_FRONTEND,
    backend: process.env.SERVER_FRONTEND + '/api',
    logLevel: process.env.LOG_LEVEL,
    idirIDPHint: process.env.IDIR_IDP_HINT,
    morganFormat: 'dev',
    port: '8080',
    session: {
      maxAge: +process.env.SESSION_MAX_AGE
    },
    penRequest: {
      statusCodeURL: process.env.PEN_REQUEST_API_URL + '/statuses',
      documentTypeCodesURL: process.env.PEN_REQUEST_API_URL + '/document-types',
      rootURL: process.env.PEN_REQUEST_API_URL,
      emails: process.env.PEN_REQUEST_EMAIL_API_URL,
      paginated: process.env.PEN_REQUEST_API_URL + '/paginated',
      rolesAllowed: process.env.GMP_ROLES ? process.env.GMP_ROLES.split(',') : '', // please provide comma separated values.
      roleAdmin: process.env.GMP_ROLE_ADMIN
    },
    studentRequest: {
      statusCodeURL: process.env.STUDENT_PROFILE_API_URL + '/statuses',
      documentTypeCodesURL: process.env.STUDENT_PROFILE_API_URL + '/document-types',
      rootURL: process.env.STUDENT_PROFILE_API_URL,
      emails: process.env.STUDENT_PROFILE_EMAIL_API_URL,
      paginated: process.env.STUDENT_PROFILE_API_URL + '/paginated',
      rolesAllowed: process.env.UMP_ROLES ? process.env.UMP_ROLES.split(',') : '', // please provide comma separated values.
      roleAdmin: process.env.UMP_ROLE_ADMIN,
      roleAnalytics: process.env.STUDENT_ANALYTICS_STUDENT_PROFILE ? process.env.STUDENT_ANALYTICS_STUDENT_PROFILE.split(',') : ''
    },
    studentSearch: {
      roleAdmin: process.env.STUDENT_SEARCH_ADMIN,
      rolesAllowed: process.env.STUDENT_SEARCH_ROLES ? process.env.STUDENT_SEARCH_ROLES.split(',') : '', // please provide comma separated values.
    },
    administration: {
      roleAdmin: process.env.STUDENT_ADMIN_ADMINISTRATOR,
      rolesAllowed: process.env.STUDENT_ADMIN_ADMINISTRATOR ? process.env.STUDENT_ADMIN_ADMINISTRATOR.split(',') : '', // using STUDENT_ADMIN_ADMINISTRATOR because there is no read only role
    },
    penRequestBatch: {
      rootURL: process.env.PEN_REQUEST_BATCH_API_URL,
      paginated: process.env.PEN_REQUEST_BATCH_API_URL + '/pen-request-batch/paginated',
      sourceURL:  process.env.PEN_REQUEST_BATCH_API_URL + '/pen-request-batch/source',
      studentStatusCodesURL: process.env.PEN_REQUEST_BATCH_API_URL + '/pen-request-batch/student/pen-request-batch-student-status-codes',
      roleAdmin: process.env.PEN_REQUEST_BATCH_ADMIN,
      rolesAllowed: process.env.PEN_REQUEST_BATCH_ADMIN ? process.env.PEN_REQUEST_BATCH_ADMIN.split(',') : '', // using PEN_REQUEST_BATCH_ADMIN because there is no read only role
      maxPaginatedElements: 1000,
      roleAnalytics: process.env.STUDENT_ANALYTICS_BATCH ? process.env.STUDENT_ANALYTICS_BATCH.split(',') : ''
    },
    penMatch: {
      rootURL: process.env.PEN_MATCH_API_URL,
      matchReasonCodes: process.env.PEN_MATCH_API_URL + '/match-reason-codes',
      possibleMatch: process.env.PEN_MATCH_API_URL + '/possible-match',
      roleAdmin: process.env.STUDENT_SEARCH_ADMIN
    },
    demographicsURL: process.env.PEN_DEMOGRAPHICS_URL,
    enablePrrStudentDemographics: (process.env.ENABLE_PRR_STUDENT_DEMOGRAPHICS?.toLowerCase() === 'true'),
    digitalIdURL: process.env.DIGITAL_ID_URL,
    digitalIdIdentityTypeCodesURL: process.env.DIGITAL_ID_URL + '/identityTypeCodes',
    profileSagaAPIURL: process.env.PROFILE_REQUEST_SAGA_API_URL,
    schoolAPIURL: process.env.SCHOOL_API_URL,
    penTraxURL: process.env.PEN_TRAX_API_URL,
    instituteAPIURL: process.env.INSTITUTE_API_URL,
    sld: {
      rootURL: process.env.SLD_API_URL,
      studentHistoryURL: process.env.SLD_API_URL + '/student'
    },
    student: {
      rootURL: process.env.STUDENT_API_URL,
      genderCodesURL: process.env.STUDENT_API_URL + '/gender-codes',
      demogCodesURL: process.env.STUDENT_API_URL + '/demog-codes',
      statusCodesURL: process.env.STUDENT_API_URL + '/status-codes',
      gradeCodesURL: process.env.STUDENT_API_URL + '/grade-codes',
      twinReasonCodesURL: process.env.STUDENT_API_URL + '/twin-reason-codes',
      historyActivityCodesURL: process.env.STUDENT_API_URL + '/history-activity-codes',
      docTypeCodesURL: process.env.STUDENT_API_URL + '/document-type-codes',
    },
    penServices: {
      rootURL: process.env.PEN_SERVICES_API_URL,
      nextPenURL: process.env.PEN_SERVICES_API_URL + '/next-pen-number',
      validateDemographicsURL: process.env.PEN_SERVICES_API_URL + '/validation/student-request',
      prbValidationFieldCodesURL: process.env.PEN_SERVICES_API_URL + '/validation/issue-field-code',
      prbValidationSeverityCodesURL: process.env.PEN_SERVICES_API_URL + '/validation/issue-severity-code',
      prbValidationTypeCodesURL: process.env.PEN_SERVICES_API_URL + '/validation/issue-type-code',
      mergeStudentsURL: process.env.PEN_SERVICES_API_URL + '/student-merge-complete-saga',
      demergeStudentsURL: process.env.PEN_SERVICES_API_URL + '/student-demerge-complete-saga'
    },
    nominalRoll: {
      rootURL: process.env.NOMINAL_ROLL_API_URL,
      roleAdmin: process.env.NOMINAL_ROLL,
      rolesAllowed: process.env.NOMINAL_ROLL_ROLES ? process.env.NOMINAL_ROLL_ROLES.split(',') : '', // comma separated list
    },
    edx: {
      rootURL: process.env.EDX_API_URL,
      exchangeURL: process.env.EDX_API_URL + '/exchange',
      exchangeStatusesURL: process.env.EDX_API_URL + '/exchange/statuses',
      fileRequirementsURL: process.env.EDX_API_URL + '/exchange/file-requirements',
      ministryTeamURL : process.env.EDX_API_URL+ '/users/ministry-teams',
      edxUsersURL: process.env.EDX_API_URL+ '/users',
      claimExchangesURL: process.env.EDX_API_URL+ '/exchange/claim',
      activationCodeUrl: process.env.EDX_API_URL + '/users/activation-code',
      schoolUserActivationInviteURL:process.env.EDX_API_URL+ '/exchange'+ '/school-user-activation-invite-saga',
      districtUserActivationInviteURL:process.env.EDX_API_URL+ '/exchange'+ '/district-user-activation-invite-saga',
      newSecureExchangeSagaURL: process.env.EDX_API_URL + '/exchange/new-secure-exchange-saga',
      secureExchangeCommentSagaURL: process.env.EDX_API_URL + '/exchange/secure-exchange-comment-saga',
      moveSchoolSagaURL: process.env.EDX_API_URL + '/exchange/move-school-saga',
      roleAdmin: process.env.EDX_ADMIN,
      teamRoles: {
        pen: process.env.EDX_PEN_TEAM_ROLES ? process.env.EDX_PEN_TEAM_ROLES.split(',') : '', // comma separated list
      },
    },
    institute: {
      rootURL: process.env.INSTITUTE_API_URL,
      instituteDistrictURL: process.env.INSTITUTE_API_URL + '/district',
      instituteSchoolURL: process.env.INSTITUTE_API_URL + '/school',
      instituteAuthorityURL: process.env.INSTITUTE_API_URL + '/authority',
      districtContactTypesURL: process.env.INSTITUTE_API_URL + '/district-contact-type-codes',
      facilityTypeURL: process.env.INSTITUTE_API_URL + '/facility-codes',
      categoryCodesURL: process.env.INSTITUTE_API_URL + '/category-codes',
      organizationCodeURL: process.env.INSTITUTE_API_URL + '/organization-codes',
      neighbourhoodLearningURL: process.env.INSTITUTE_API_URL + '/neighborhood-learning-codes',
      authorityTypeCodesURL: process.env.INSTITUTE_API_URL + '/authority-type-codes',
      gradeCodeURL: process.env.INSTITUTE_API_URL + '/grade-codes',
      provinceCodesURL: process.env.INSTITUTE_API_URL + '/province-codes',
      countryCodesURL: process.env.INSTITUTE_API_URL + '/country-codes',
      reportingRequirementCodesURL: process.env.INSTITUTE_API_URL +
        '/reporting-requirement-codes',
      schoolContactTypeCodesURL: process.env.INSTITUTE_API_URL + '/school-contact-type-codes',
      authorityContactTypeCodesURL: process.env.INSTITUTE_API_URL + '/authority-contact-type-codes',
    },
    macro: {
      rootURL: process.env.MACRO_API_URL,
      penMacroURL: process.env.MACRO_API_URL + '/pen'
    },
  },
  oidc: {
    publicKey: process.env.SOAM_PUBLIC_KEY,
    clientId: process.env.ID,
    clientSecret: process.env.SECRET,
    discovery: process.env.DISCOVERY,
  },
  tokenGenerate: {
    privateKey: process.env.UI_PRIVATE_KEY,
    publicKey: process.env.UI_PUBLIC_KEY,
    audience: process.env.SERVER_FRONTEND,
    issuer: process.env.ISSUER,
    expiresIn: process.env.TOKEN_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  },
  messaging: {
    natsUrl: process.env.NATS_URL,
    queueGroupName: process.env.QUEUE_GROUP_NAME,
  },
  scheduler: {
    schedulerCronStaleSagaRecordRedis: process.env.SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS,
    minTimeBeforeSagaIsStaleInSeconds: process.env.MIN_TIME_BEFORE_SAGA_IS_STALE_IN_SECONDS,
    schedulerCronDocTypeMigration: process.env.SCHEDULER_CRON_DOC_TYPE_MIGRATION
  }
});
module.exports = nconf;
