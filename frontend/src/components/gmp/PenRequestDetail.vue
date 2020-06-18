<template>
  <RequestDetail
    request-type-label="PEN Request"
    title="GetMyPen Request Details"
    :prep-put="prepPut"
    :request-completed="requestCompleted"
  >
    <template v-slot:demographics="{ request }">
      <PenDemographicsCard
        :request="request"
      >
      </PenDemographicsCard>
    </template>
    <template v-slot:request="{ request }">
      <PenRequestCard
        :request="request"
      >
      </PenRequestCard>
    </template>
    <template v-slot:actions="{ activeTab, request, enableActions, beforeSubmit, submitted, switchLoading}">
      <PenRequestActions
        :active-tab="activeTab"
        :request="request"
        :enable-actions="enableActions"
        :prep-put="prepPut"
        :before-submit="beforeSubmit"
        :submitted="submitted"
        :switch-loading="switchLoading"
      >
      </PenRequestActions>
    </template>
  </RequestDetail>
</template>

<script>
import RequestDetail from '../RequestDetail';
import PenDemographicsCard from './PenDemographicsCard';
import PenRequestCard from './PenRequestCard';
import PenRequestActions from './PenRequestActions';

export default {
  name: 'penRequestDetail',
  components: {
    RequestDetail,
    PenDemographicsCard,
    PenRequestCard,
    PenRequestActions,
  },
  methods: {
    prepPut(requestId, request) {
      return {
        'penRequestID': requestId,
        'pen': request.pen,
        'penRequestStatusCode': request.penRequestStatusCode,
        'reviewer': request.reviewer,
        'failureReason': request.failureReason,
        'completeComment': request.completeComment,
        'demogChanged': request.demogChanged,
        'bcscAutoMatchOutcome': request.bcscAutoMatchOutcome,
        'bcscAutoMatchDetails': request.bcscAutoMatchDetails
      };
    },
    requestCompleted(request, statusCodes) {
      return request.penRequestStatusCode === statusCodes.REJECTED ||
        request.penRequestStatusCode === statusCodes.MANUAL_MATCH ||
        request.penRequestStatusCode === statusCodes.AUTO_MATCH;
    },
  }
};
</script>
