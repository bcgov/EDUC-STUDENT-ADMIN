<template>
  <RequestDetail
    title="UpdateMyPENInfo Request Details"
    :prep-put="prepPut"
    :request-completed="requestCompleted"
    :request-id="requestId"
    :request-type="requestType"
  >
    <template #demographics="{ request }">
      <StudentDemographicsCard
        :request="request"
      />
    </template>
    <template #request="{ request }">
      <StudentRequestCard
        :request="request"
      />
    </template>
    <template #actions="{ activeTab, request, enableActions, beforeSubmit, submitted, switchLoading}">
      <StudentRequestActions
        :active-tab="activeTab"
        :request="request"
        :enable-actions="enableActions"
        :prep-put="prepPut"
        :before-submit="beforeSubmit"
        :submitted="submitted"
        :switch-loading="switchLoading"
      />
    </template>
  </RequestDetail>
</template>

<script>
import RequestDetail from '../RequestDetail.vue';
import StudentDemographicsCard from './StudentDemographicsCard.vue';
import StudentRequestCard from './StudentRequestCard.vue';
import StudentRequestActions from './StudentRequestActions.vue';
import { REQUEST_TYPES } from '../../utils/constants';

export default {
  name: 'StudentRequestDetail',
  components: {
    RequestDetail,
    StudentDemographicsCard,
    StudentRequestCard,
    StudentRequestActions,
  },
  props: {
    requestId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      requestType: REQUEST_TYPES.studentRequest.name
    };
  },
  methods: {
    prepPut(requestId, request) {
      return {
        'studentRequestID': requestId,
        'studentRequestStatusCode': request.studentRequestStatusCode,
        'reviewer': request.reviewer,
        'failureReason': request.failureReason,
        'completeComment': request.completeComment,
      };
    },
    requestCompleted(request, statusCodes) {
      return request.studentRequestStatusCode === statusCodes.REJECTED ||
        request.studentRequestStatusCode === statusCodes.COMPLETED;
    },
  }
};
</script>
