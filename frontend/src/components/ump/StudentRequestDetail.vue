<template>
  <RequestDetail
    title="UpdateMyPENInfo Request Details"
    :prep-put="prepPut"
    :request-completed="requestCompleted"
    :requestId="requestId"
    :requestType="requestType"
  >
    <template v-slot:demographics="{ request }">
      <StudentDemographicsCard
        :request="request"
      >
      </StudentDemographicsCard>
    </template>
    <template v-slot:request="{ request }">
      <StudentRequestCard
        :request="request"
      >
      </StudentRequestCard>
    </template>
    <template v-slot:actions="{ activeTab, request, enableActions, beforeSubmit, submitted, switchLoading}">
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
import RequestDetail from '../RequestDetail';
import StudentDemographicsCard from './StudentDemographicsCard';
import StudentRequestCard from './StudentRequestCard';
import StudentRequestActions from './StudentRequestActions';
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
