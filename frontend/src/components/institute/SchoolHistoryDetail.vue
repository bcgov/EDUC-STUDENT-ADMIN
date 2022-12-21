<template>
    <v-card class="pl-4 auditHistoryDetail" height="auto" width="100%" elevation=0>
        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Status</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.status_diff }">{{ schoolHistory?.status }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>District Number</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.districtNumber_diff }">{{ schoolHistory?.districtNumber }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Authority Number</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.authorityNumber_diff }">{{ schoolHistory?.authorityNumber }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>School Number</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.schoolNumber_diff }">{{ schoolHistory?.schoolNumber }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Name</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.displayName_diff }">{{ schoolHistory?.displayName }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Phone</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.phoneNumber_diff }">{{ formatPhoneNumber(schoolHistory?.phoneNumber) }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Email</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.email_diff }">{{ schoolHistory?.email }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Fax</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.faxNumber_diff }">{{ formatPhoneNumber(schoolHistory?.faxNumber) }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Website</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.website_diff }">{{ schoolHistory?.website }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Open Date</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.openedDate_diff }">{{ formatDate(schoolHistory?.openedDate) }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Close Date</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.closedDate_diff }">{{ formatDate(schoolHistory?.closedDate) }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Facility Type</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.facilityTypeValue_diff }">{{ schoolHistory?.facilityTypeValue }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>School Category</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.schoolCategoryValue_diff }">{{ schoolHistory?.schoolCategoryValue }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Grades Offered</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.gradeValue_diff }">{{ schoolHistory?.gradeValue }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>School Organization</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.schoolOrganizationValue_diff }">{{ schoolHistory?.schoolOrganizationValue }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>NLC Activity</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <span :class="{ 'diff-value': schoolHistory?.nlcList_diff }">{{ schoolHistory?.nlcList }}</span>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Mailing Address</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <FormattedAddress v-if="schoolHistory?.mailingAddress"
                 :address="schoolHistory?.mailingAddress"
                 :class="{ 'diff-value': schoolHistory?.mailingAddress_diff }">
                </FormattedAddress>
            </v-col>
        </v-row>

        <v-row class="py-1">
            <v-col cols="4" lg="3" class="pb-0 pt-0 key">
                <span>Physical Address</span>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
                <FormattedAddress v-if="schoolHistory?.physicalAddress"
                 :address="schoolHistory?.physicalAddress"
                 :class="{ 'diff-value': schoolHistory?.physicalAddress_diff }">
                </FormattedAddress>
            </v-col>
        </v-row>
        <slot></slot>
    </v-card>
</template>
    
<script>
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import FormattedAddress from '../common/FormattedAddress.vue';
export default {
  name: 'SchoolHistoryDetail',
  mixins: [alertMixin],
  props: {
    schoolHistory: {
      type: Object,
      required: true
    }
  },
  components: {
    FormattedAddress
  },
  methods: {
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
  
