<template>
  <v-container class="containerSetup" fluid>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to School List</a>
      </v-col>
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
            class="mt-16"
            :size="70"
            :width="7"
            color="primary"
            indeterminate
            :active="loading"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-row v-else no-gutters>
      <v-col>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex justify-start">
            <h2>{{ school.mincode }}</h2>
            <h2 class="pl-1 pr-1">-</h2>
            <div>
              <div>
                <h2 id="displayName">{{ school.displayName }}</h2>
              </div>
              <div class="safe-name" v-if="school.displayNameNoSpecialChars">{{ school.displayNameNoSpecialChars }}</div>
            </div>
              
          </v-col>
        </v-row>
        <v-row v-if="!['OFFSHORE', 'INDEPEND'].includes(school.schoolCategoryCode)" class="d-flex justify-start">
          <v-col class="d-flex">
            <div class="ministryOwnershipTeamName"  style="color: black">{{district.districtNumber}} - {{district.name}}</div>
          </v-col>
        </v-row>
        <v-row v-else class="d-flex justify-start">
          <v-col class="d-flex">
            <div class="ministryOwnershipTeamName"  style="color: black">{{authority.authorityNumber}} - {{authority.displayName}}</div>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex">
            <v-icon class="ml-n1 pr-3" :color="getStatusColorAuthorityOrSchool(school.status)" dark>
              mdi-circle-medium
            </v-icon>
            <span>{{ school.status }}</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row>
          <v-tabs selected-class="active-display" :model-value="tab">
            <v-tab class="tab-divider" v-for="item in items" :key="item">
              {{ item }}
            </v-tab>
          </v-tabs>
          <v-tabs-items :model-value="tab" style="width: 100%">
            <v-tab-item :value="0">
              <Details @updateSchool="updateSchoolDetails" :schoolID="schoolID"></Details>
            </v-tab-item>
            <v-tab-item :value="1">
              <SchoolContacts :schoolID="schoolID"></SchoolContacts>
            </v-tab-item>
            <v-tab-item :value="2">
              <MinistryNotes :schoolID="schoolID" :hasAccess="canEditSchoolDetails()"></MinistryNotes>
            </v-tab-item>
            <v-tab-item :value="3">
              <SchoolHistory :schoolID="schoolID"></SchoolHistory>
            </v-tab-item>
            <v-tab-item :value="4">
              <SchoolMove :schoolID="schoolID" :hasAccess="canEditSchoolDetails()"></SchoolMove>
            </v-tab-item>
            <v-tab-item :value="5">
              <p>Funding Tab</p>
            </v-tab-item>
          </v-tabs-items>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import { mapState } from 'pinia';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {getStatusAuthorityOrSchool, getStatusColorAuthorityOrSchool,} from '@/utils/institute/status';
import router from '@/router';
import { sanitizeUrl } from '@braintree/sanitize-url';
import {deepCloneObject} from '@/utils/common';
import Details from './common/Details.vue';
import MinistryNotes from './common/MinistryNotes.vue';
import SchoolHistory from './common/SchoolHistory.vue';
import SchoolContacts from './common/SchoolContacts.vue';
import SchoolMove from './common/SchoolMove.vue';
import {authStore} from '@/store/modules/auth';
import {notificationsStore} from '@/store/modules/notifications';

export default {
  name: 'SchoolDetailsPage',
  mixins: [alertMixin],
  components: {
    Details,
    MinistryNotes,
    SchoolHistory,
    SchoolContacts,
    SchoolMove
  },
  props: {
    schoolID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      school: '',
      district: '',
      authority: '',
      cleanWebsiteUrl: '',
      loading: true,
      independentArray: ['INDEPEND', 'INDP_FNS'],
      tab: null,
      items: [
        'Details', 'Contacts', 'Ministry Notes', 'History', 'Moves', 'Funding'
      ],
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo','SCHOOL_ADMIN_ROLE','SCHOOL_INDEPENDENT_ADMIN_ROLE']),
    ...mapState(notificationsStore, ['notification']),
    dataReady: function () {
      return this.userInfo;
    },
  },
  watch: {

  },
  created() {
    this.getThisSchoolsDetails();
  },
  methods: {
    shouldDisableTab(tabName) {
      return tabName === 'Moves' && this.school.schoolMove.length === 0;
    },
    getThisSchoolsDetails(){
      this.loading = true;
      this.school = '';

      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.school = response.data;
          this.cleanWebsiteUrl = this.school.website ? sanitizeUrl(this.school.website) : '';
          this.populateExtraSchoolFields(this.school);
          this.getDistrictDetails(this.school.districtId);
          if(this.school.independentAuthorityId){
            this.getAuthorityDetails(this.school.independentAuthorityId);
          }
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getDistrictDetails(districtId){
      this.district = '';
      ApiService.apiAxios.get(`${Routes.cache.DISTRICT_DATA_URL}/${districtId}`)
        .then(response => {
          this.district = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getAuthorityDetails(authorityId){
      this.authority = '';
      ApiService.apiAxios.get(`${Routes.institute.AUTHORITY_DATA_URL}/${authorityId}`)
        .then(response => {
          this.authority = response.data;
          this.populateExtraAuthorityFields(this.authority);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      if(authority.status === 'Closed' || authority.status === 'Closing') {
        this.isSchoolStatusUpdateAllowed = false;
      }
    },
    deepCloneObject,
    getStatusColorAuthorityOrSchool,
    backButtonClick() {
      router.push({name: 'instituteSchoolList'});
    },
    populateExtraSchoolFields(school){
      school.status = getStatusAuthorityOrSchool(school);
    },
    async updateSchoolDetails(schoolDetailsCopy) {
      this.loading = true;
      ApiService.apiAxios.put(`${Routes.institute.SCHOOL_DATA_URL}` + '/' + schoolDetailsCopy.schoolId, schoolDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The school details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the school information. Please try again later.');
        })
        .finally(() => {
          this.getThisSchoolsDetails();
        });
    },
    canEditSchoolDetails(){
      if(this.school.schoolCategoryCode && this.independentArray.includes(this.school.schoolCategoryCode)){
        return this.SCHOOL_INDEPENDENT_ADMIN_ROLE || this.SCHOOL_ADMIN_ROLE;
      }
      return this.SCHOOL_ADMIN_ROLE;
    },
  },
};
</script>

<style scoped>
.divider {
  border: 2px solid #FCBA19;
}

.containerSetup{
  padding-right: 24em !important;
  padding-left: 24em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}

.v-dialog__content /deep/ .v-bottom-sheet {
  width: 30% !important;
}
@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}

  .active-display {
    color: #38598a;
  }

  .v-tab {
    text-transform: none !important;
    font-size: 16px;
    font-weight: bold;
  }

  .tab-divider {
    border-right: 1px solid lightgray;
    border-radius: 0px;
  }

  .tab-divider:last-child  { 
    border-right: 0
   }

   .safe-name {
    color: grey;
    font-style: italic;
   }

</style>
