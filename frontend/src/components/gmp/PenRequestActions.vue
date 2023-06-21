<template>
  <v-tabs vertical :value="activeTab">
    <v-tab id="complete-tab">Provide PEN</v-tab>
    <v-tab id="return-tab">Request Info</v-tab>
    <v-tab id="reject-tab">Reject</v-tab>
    <v-tab-item>
      <PenRequestComplete
        :request="request"
        :enable-actions="enableActions"
        :prep-put="prepPut"
        :before-submit="beforeSubmit"
        :submitted="submitted"
        :switch-loading="switchLoading"
      ></PenRequestComplete>
    </v-tab-item>
    <v-tab-item>
      <RequestReturn
        :request="request"
        :enable-actions="enableActions"
        :prep-put="prepPut"
        :before-submit="beforeSubmit"
        :submitted="submitted"
      ></RequestReturn>
    </v-tab-item>
    <v-tab-item>
      <RequestReject
        :request="request"
        :enable-actions="enableActions"
        :prep-put="prepPut"
        :before-submit="beforeSubmit"
        :submitted="submitted"
      ></RequestReject>
    </v-tab-item>
  </v-tabs>
</template>

<script>
import PenRequestComplete from './PenRequestComplete.vue';
import RequestReject from '../RequestReject.vue';
import RequestReturn  from '../RequestReturn.vue';

export default {
  name: 'penRequestActions',
  components: {
    RequestReject,
    RequestReturn,
    PenRequestComplete  
  },
  props: {
    activeTab: {
      type: Number,
      required: true
    },
    request: {
      type: Object,
      required: true
    },
    enableActions: {
      type: Boolean,
      required: true
    },
    prepPut: {
      type: Function,
      required: true
    },
    beforeSubmit: {
      type: Function,
      required: true
    },
    submitted: {
      type: Function,
      required: true
    },
    switchLoading: {
      type: Function,
      required: true
    }
  },
};
</script>
