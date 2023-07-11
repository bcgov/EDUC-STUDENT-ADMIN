<template>
  <v-row>
    <v-col cols="auto">
      <v-tabs
        v-model="activeTab"
        direction="vertical"
      >
        <v-tab
          value="complete-tab"
          class="student-details-tabs-style"
        >
          Send Update
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
          <StudentRequestComplete
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
import StudentRequestComplete from './StudentRequestComplete.vue';
import RequestReject from '../RequestReject.vue';
import RequestReturn from '../RequestReturn.vue';

export default {
  name: 'StudentRequestActions',
  data() {
    return {
      activeTab: null
    };
  },
  components: {
    RequestReject,
    RequestReturn,
    StudentRequestComplete
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
