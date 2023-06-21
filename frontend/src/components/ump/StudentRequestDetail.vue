<template>
  <RequestDetail
    title="UpdateMyPENInfo Request Details"
    :prep-put="prepPut"
    :request-completed="requestCompleted"
    :requestId="requestId"
    :requestType="requestType"
  >
    <template #demographics="{ request }">
      <StudentDemographicsCard
        :request="request"
      >
      </StudentDemographicsCard>
    </template>
    <template #request="{ request }">
      <StudentRequestCard
        :request="request"
      >
      </StudentRequestCard>
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
      >
      </StudentRequestActions>
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
  name: 'studentRequestDetail',
  props: {
    requestId: {
      type: String,
      required: true
    }
  },
  components: {
    RequestDetail,
    StudentDemographicsCard,
    StudentRequestCard,
    StudentRequestActions,
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
