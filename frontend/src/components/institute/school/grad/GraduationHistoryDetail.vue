<template>
  <v-card
    class="pl-4 auditHistoryDetail"
    height="auto"
    width="100%"
    elevation="0"
  >
  <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span
          :class="{
            'diff-value': isValueEmpty(schoolHistory.canIssueTranscripts === 'Y' ? 'Yes' : 'No',
                                       schoolHistory.canIssueTranscripts_diff)
          }"
        >
          Can Issue Transcripts?
        </span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': schoolHistory.canIssueTranscripts_diff }">
          {{
            schoolHistory.canIssueTranscripts === 'Y' ? 'Yes' : 'No'
          }}
        </span>
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span
          :class="{
            'diff-value': isValueEmpty(schoolHistory.canIssueCertificates === 'Y' ? 'Yes' : 'No',
                                       schoolHistory.canIssueCertificates_diff)
          }"
        >
          Can Issue Certificates?
        </span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': schoolHistory.canIssueCertificates_diff }">
          {{
            schoolHistory.canIssueCertificates === 'Y' ? 'Yes' : 'No'
          }}
        </span>
      </v-col>
    </v-row>
    <slot />
  </v-card>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import {formatDate} from '@/utils/format';
import {isEmpty} from 'lodash';

export default {
  name: 'GraduationHistoryDetail',
  components: {
  },
  mixins: [alertMixin],
  props: {
    schoolHistory: {
      type: Object,
      required: true
    }
  },
  methods: {
    isValueEmpty(fieldValue, fieldValueDiff) {
      return fieldValueDiff && isEmpty(fieldValue);
    },
    formatDate
  }
};
</script>

<style scoped>
div.auditHistoryDetail {
    background-color: rgba(0, 0, 0, 0.06);
    padding: 25px 0 25px 0;
}

.key {
    font-weight: bold;
    color: rgba(0, 0, 0, 0.50) !important;
}

.diff-value {
    font-weight: bold;
    color: #008000 !important;
}
</style>

