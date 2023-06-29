<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-col class="mt-1 d-flex justify-start">
      <v-icon
        small
        color="#1976d2"
      >
        mdi-arrow-left
      </v-icon>
      <a
        class="ml-1"
        @click="backButtonClick"
      >Return to School List</a>
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
        />
      </v-col>
    </v-row>
    <v-row
      v-else
      no-gutters
    >
      <v-col>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex justify-start">
            <h2>
              {{
                school.mincode
              }}
            </h2>
            <h2 class="pl-1 pr-1">
              -
            </h2>
            <div>
              <div>
                <h2 id="displayName">
                  {{
                    school.displayName
                  }}
                </h2>
              </div>
              <div
                v-if="school.displayNameNoSpecialChars"
                class="safe-name"
              >
                {{
                  school.displayNameNoSpecialChars
                }}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row
          v-if="!['OFFSHORE', 'INDEPEND'].includes(school.schoolCategoryCode)"
          no-gutters
          class="d-flex justify-start"
        >
          <v-col class="d-flex">
            <div
              class="ministryOwnershipTeamName"
              style="color: black"
            >
              {{
                district.districtNumber
              }} -
              {{
                district.name
              }}
            </div>
          </v-col>
        </v-row>
        <v-row
          v-else
          no-gutters
          class="d-flex justify-start"
        >
          <v-col class="d-flex">
            <div
              class="ministryOwnershipTeamName"
              style="color: black"
            >
              {{
                authority.authorityNumber
              }} -
              {{
                authority.displayName
              }}
            </div>
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="mt-1 d-flex justify-start"
        >
          <v-col class="d-flex">
            <v-icon
              :color="getStatusColorAuthorityOrSchool(school.status)"
              dark
            >
              mdi-circle-medium
            </v-icon>
            <span>{{
              school.status
            }}</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider" />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-tabs v-model="tab">
              <v-tab value="details">
                Details
              </v-tab>
              <v-tab value="contacts">
                Contacts
              </v-tab>
              <v-tab value="notes">
                Ministry Notes
              </v-tab>
              <v-tab value="history">
                History
              </v-tab>
              <v-tab value="moves">
                Moves
              </v-tab>
              <v-tab value="funding">
                Funding
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card-text>
              <v-window v-model="tab">
                <v-window-item value="details">
                  <Details
                    :school-i-d="schoolID"
                    @updateSchool="updateSchoolDetails"
                  />
                </v-window-item>
                <v-window-item value="contacts">
                  <SchoolContacts :school-i-d="schoolID" />
                </v-window-item>
                <v-window-item value="notes">
                  <MinistryNotes
                    :school-i-d="schoolID"
                    :has-access="canEditSchoolDetails()"
                  />
                </v-window-item>
                <v-window-item value="history">
                  <SchoolHistory :school-i-d="schoolID" />
                </v-window-item>
                <v-window-item value="moves">
                  <SchoolMove
                    :school-i-d="schoolID"
                    :has-access="canEditSchoolDetails()"
                  />
                </v-window-item>
                <v-window-item value="funding">
                  <p>Funding Tab</p>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import {mapState} from 'pinia';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {getStatusAuthorityOrSchool, getStatusColorAuthorityOrSchool,} from '@/utils/institute/status';
import router from '@/router';
import {sanitizeUrl} from '@braintree/sanitize-url';
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
  components: {
    Details,
    MinistryNotes,
    SchoolHistory,
    SchoolContacts,
    SchoolMove
  },
  mixins: [alertMixin],
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
    ...mapState(authStore, ['isAuthenticated', 'userInfo', 'SCHOOL_ADMIN_ROLE', 'SCHOOL_INDEPENDENT_ADMIN_ROLE']),
    ...mapState(notificationsStore, ['notification']),
    dataReady: function () {
      return this.userInfo;
    },
  },
  watch: {},
  created() {
    this.getThisSchoolsDetails();
  },
  methods: {
    shouldDisableTab(tabName) {
      return tabName === 'Moves' && this.school.schoolMove.length === 0;
    },
    getThisSchoolsDetails() {
      this.loading = true;
      this.school = '';

      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.school = response.data;
          this.cleanWebsiteUrl = this.school.website ? sanitizeUrl(this.school.website) : '';
          this.populateExtraSchoolFields(this.school);
          this.getDistrictDetails(this.school.districtId);
          if (this.school.independentAuthorityId) {
            this.getAuthorityDetails(this.school.independentAuthorityId);
          }
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getDistrictDetails(districtId) {
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
    getAuthorityDetails(authorityId) {
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
      if (authority.status === 'Closed' || authority.status === 'Closing') {
        this.isSchoolStatusUpdateAllowed = false;
      }
    },
    deepCloneObject,
    getStatusColorAuthorityOrSchool,
    backButtonClick() {
      router.push({name: 'instituteSchoolList'});
    },
    populateExtraSchoolFields(school) {
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
    canEditSchoolDetails() {
      if (this.school.schoolCategoryCode && this.independentArray.includes(this.school.schoolCategoryCode)) {
        return this.SCHOOL_INDEPENDENT_ADMIN_ROLE || this.SCHOOL_ADMIN_ROLE;
      }
      return this.SCHOOL_ADMIN_ROLE;
    },
  },
};
</script>

<style scoped>
.divider {
    border-color: #FCBA19;
    border-width: 3px;
    opacity: unset;
}

.containerSetup {
    padding-right: 20em !important;
    padding-left: 20em !important;
}

.v-dialog__content /deep/ .v-bottom-sheet {
    width: 30% !important;
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

.tab-divider:last-child {
    border-right: 0
}

.safe-name {
    color: grey;
    font-style: italic;
}

:deep(.v-btn--variant-text) {
    color: #003366
}

</style>
