<template>
  <v-row>
    <v-col cols="auto">
      <v-tabs direction="vertical"
              v-model="activeTab"
      >
        <v-tab
          value="complete-tab"
          class="student-details-tabs-style"
        >
          Provide PEN
        </v-tab>
        <v-tab
          value="return-tab"
          class="student-details-tabs-style"
        >
          Request Info
        </v-tab>
        <v-tab
          value="reject-tab"
          class="student-details-tabs-style"
        >
          Reject
        </v-tab>
      </v-tabs>
    </v-col>
    <v-col>
      <v-window v-model="activeTab">
        <v-window-item
          value="complete-tab"
        >
          <PenRequestComplete
            :request="request"
            :enable-actions="enableActions"
            :prep-put="prepPut"
            :before-submit="beforeSubmit"
            :submitted="submitted"
            :switch-loading="switchLoading"
          />
        </v-window-item>
        <v-window-item value="return-tab">
          <RequestReturn
            :request="request"
            :enable-actions="enableActions"
            :prep-put="prepPut"
            :before-submit="beforeSubmit"
            :submitted="submitted"
          />
        </v-window-item>
        <v-window-item value="reject-tab">
          <RequestReject
            :request="request"
            :enable-actions="enableActions"
            :prep-put="prepPut"
            :before-submit="beforeSubmit"
            :submitted="submitted"
          />
        </v-window-item>
      </v-window>
    </v-col>
  </v-row>
</template>

<script>
import PenRequestComplete from './PenRequestComplete.vue';
import RequestReject from '../RequestReject.vue';
import RequestReturn from '../RequestReturn.vue';

export default {
  name: 'PenRequestActions',
  components: {
    RequestReject,
    RequestReturn,
    PenRequestComplete
  },
  data() {
    return {
      activeTab: null
    };
  },
  props: {
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
