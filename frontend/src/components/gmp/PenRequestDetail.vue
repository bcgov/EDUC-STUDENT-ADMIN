<template>
  <RequestDetail
    title="GetMyPen Request Details"
    :prep-put="prepPut"
    :request-completed="requestCompleted"
    :request-id="requestId"
    :request-type="requestType"
  >
    <template #demographics="{ request }">
      <PenDemographicsCard
        :request="request"
      />
    </template>
    <template #request="{ request }">
      <PenRequestCard
        :request="request"
      />
    </template>
    <template #actions="{ request, enableActions, beforeSubmit, submitted, switchLoading}">
      <PenRequestActions
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
import PenDemographicsCard from './PenDemographicsCard.vue';
import PenRequestCard from './PenRequestCard.vue';
import PenRequestActions from './PenRequestActions.vue';
import { REQUEST_TYPES } from '../../utils/constants';

export default {
  name: 'PenRequestDetail',
  components: {
    RequestDetail,
    PenDemographicsCard,
    PenRequestCard,
    PenRequestActions,
  },
  props: {
    requestId: {
      type: String,
      required: true
    }
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
