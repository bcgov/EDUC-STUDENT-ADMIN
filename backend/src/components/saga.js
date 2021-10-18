'use strict';
const config = require('../config/index');

const sagas = {
  GMP_UMP: {
    sagaApiUrl: config.get('server:profileSagaAPIURL'),
    sagaEventRedisKey: 'SAGA_EVENTS',
    sagaTopics: [
      'PEN_REQUEST_RETURN_SAGA_TOPIC',
      'PEN_REQUEST_UNLINK_SAGA_TOPIC',
      'PEN_REQUEST_REJECT_SAGA_TOPIC',
      'PEN_REQUEST_COMPLETE_SAGA_TOPIC',
      'STUDENT_PROFILE_REQUEST_REJECT_SAGA_TOPIC',
      'STUDENT_PROFILE_REQUEST_RETURN_SAGA_TOPIC',
      'STUDENT_PROFILE_COMPLETE_SAGA_TOPIC',
    ],
  },
  PEN_REQUEST_BATCH: {
    sagaApiUrl: `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga`,
    sagaEventRedisKey: 'PRB_SAGA_EVENTS',
    sagaTopics: [
      'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_TOPIC',
      'PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_TOPIC',
      'PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_TOPIC',
      'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_TOPIC',
      'PEN_REQUEST_BATCH_REPOST_REPORTS_TOPIC',
    ],
  },
  PEN_SERVICES: {
    sagaApiUrl: `${config.get('server:penServices:rootURL')}/saga`,
    sagaEventRedisKey: 'SERVICES_SAGA_EVENTS',
    sagaTopics: [
      'PEN_SERVICES_MERGE_STUDENTS_SAGA_TOPIC',
      'PEN_SERVICES_DEMERGE_STUDENTS_SAGA_TOPIC',
      'PEN_SERVICES_SPLIT_PEN_SAGA_TOPIC',
      'PEN_SERVICES_MOVE_SLD_SAGA_TOPIC',
    ],
  },
  MACRO: {
    sagaApiUrl: `${config.get('server:macro:rootURL')}/saga`,
    sagaEventRedisKey: 'MACRO_SAGA_EVENTS',
    sagaTopics: [
      'MACRO_CREATE_SAGA_TOPIC',
      'MACRO_UPDATE_SAGA_TOPIC',
    ],
  },
}

module.exports = sagas;
