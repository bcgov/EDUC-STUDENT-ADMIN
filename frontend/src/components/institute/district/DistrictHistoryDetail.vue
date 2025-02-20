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
        <span :class="{ 'diff-value': isValueEmpty(districtHistory.status, districtHistory.status_diff) }">Status</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': districtHistory.status_diff }">{{
          districtHistory.districtStatusCode
        }}</span>
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span :class="{ 'diff-value': isValueEmpty(districtHistory.districtNumber, districtHistory.districtNumber_diff) }">District Number</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': districtHistory.districtNumber_diff }">{{
          districtHistory.districtNumber
        }}</span>
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span :class="{ 'diff-value': isValueEmpty(districtHistory.displayName, districtHistory.displayName_diff) }">Name</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': districtHistory.displayName_diff }">{{
          districtHistory.displayName
        }}</span>
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span :class="{ 'diff-value': isValueEmpty(districtHistory.phoneNumber, districtHistory.phoneNumber_diff) }">Phone</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': districtHistory.phoneNumber_diff }">{{
          formatPhoneNumber(districtHistory.phoneNumber)
        }}</span>
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span :class="{ 'diff-value': isValueEmpty(districtHistory.email, districtHistory.email_diff) }">Email</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': districtHistory.email_diff }">{{
          districtHistory.email
        }}</span>
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span :class="{ 'diff-value': isValueEmpty(districtHistory.faxNumber, districtHistory.faxNumber_diff) }">Fax</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': districtHistory.faxNumber_diff }">{{
          formatPhoneNumber(districtHistory.faxNumber)
        }}</span>
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span :class="{ 'diff-value': isValueEmpty(districtHistory.website, districtHistory.website_diff) }">Website</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <span :class="{ 'diff-value': districtHistory.website_diff }">{{
          districtHistory.website
        }}</span>
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"
        class="pb-0 pt-0 key"
      >
        <span :class="{ 'diff-value': isValueEmpty(districtHistory.mailingAddress, districtHistory.mailingAddress_diff) }">Mailing Address</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <FormattedAddress
          v-if="districtHistory.mailingAddress"
          :address="districtHistory.mailingAddress"
          :class="{ 'diff-value': districtHistory.mailingAddress_diff }"
        />
      </v-col>
    </v-row>

    <v-row class="py-1">
      <v-col
        cols="4"

        class="pb-0 pt-0 key"
      >
        <span
          :class="{ 'diff-value': isValueEmpty(districtHistory.physicalAddress, districtHistory.physicalAddress_diff) }"
        >Physical Address</span>
      </v-col>
      <v-col
        cols="6"
        class="pb-0 pt-0"
      >
        <FormattedAddress
          v-if="districtHistory.physicalAddress"
          :address="districtHistory.physicalAddress"
          :class="{ 'diff-value': districtHistory.physicalAddress_diff }"
        />
      </v-col>
    </v-row>
    <slot />
  </v-card>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import FormattedAddress from '../../common/FormattedAddress.vue';
import {isEmpty} from 'lodash';

export default {
  name: 'DistrictHistoryDetail',
  components: {
    FormattedAddress
  },
  mixins: [alertMixin],
  props: {
    districtHistory: {
      type: Object,
      required: true
    }
  },
  methods: {
    isValueEmpty(fieldValue, fieldValueDiff) {
      return fieldValueDiff && isEmpty(fieldValue);
    },
    formatDate,
    formatPhoneNumber,
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

