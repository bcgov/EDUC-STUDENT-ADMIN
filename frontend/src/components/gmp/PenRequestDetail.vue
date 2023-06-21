<template>
  <RequestDetail
    title="GetMyPen Request Details"
    :prep-put="prepPut"
    :request-completed="requestCompleted"
    :requestId="requestId"
    :requestType="requestType"
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
import RequestDetail from '../RequestDetail.vue';
import PenDemographicsCard from './PenDemographicsCard.vue';
import PenRequestCard from './PenRequestCard.vue';
import PenRequestActions from './PenRequestActions.vue';
import { REQUEST_TYPES } from '../../utils/constants';

export default {
  name: 'penRequestDetail',
  props: {
    requestId: {
      type: String,
      required: true
    }
  },
  components: {
    RequestDetail,
    PenDemographicsCard,
    PenRequestCard,
    PenRequestActions,
  },
  data () {
    return {
      requestType: REQUEST_TYPES.penRequest.name
    };
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
