<template>
  <v-tabs vertical :value="activeTab">
    <v-tab id="complete-tab">Send Update</v-tab>
    <v-tab id="return-tab">Request Info</v-tab>
    <v-tab id="reject-tab">Reject</v-tab>
    <v-tab-item>
      <StudentRequestComplete
        :request="request"
        :enable-actions="enableActions"
        :prep-put="prepPut"
        :before-submit="beforeSubmit"
        :submitted="submitted"
        :switch-loading="switchLoading"
      ></StudentRequestComplete>
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
import StudentRequestComplete from './StudentRequestComplete.vue';
import RequestReject from '../RequestReject.vue';
import RequestReturn  from '../RequestReturn.vue';

export default {
  name: 'studentRequestActions',
  components: {
    RequestReject,
    RequestReturn,
    StudentRequestComplete  
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
