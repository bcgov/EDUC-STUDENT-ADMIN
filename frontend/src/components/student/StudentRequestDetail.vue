<template>
  <RequestDetail
    request-type-label="UMPI Request"
    title="UpdateMyPENInfo Request Details"
    :prep-put="prepPut"
    :request-completed="requestCompleted"
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

export default {
  name: 'studentRequestDetail',
  components: {
    RequestDetail,
    StudentDemographicsCard,
    StudentRequestCard,
    StudentRequestActions,
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
