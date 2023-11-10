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
              <v-tab
                v-if="canViewFundingTab()"
                value="funding"
              >
                Funding
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-card-text class="pt-0">
              <v-window v-model="tab">
                <v-window-item value="details">
                  <Details
                    :school-i-d="schoolID"
                    :has-access="canEditSchools"
                    @updateSchool="updateSchoolDetails"
                  />
                </v-window-item>
                <v-window-item value="contacts">
                  <SchoolContacts 
                    :school-i-d="schoolID" 
                    :has-access="canEditSchools"
                  />
                </v-window-item>
                <v-window-item value="notes">
                  <InstituteNotes
                    :notes="notes"
                    :has-access="canEditSchools"
                    :loading="notesLoading"
                    @add-institute-note="saveNewSchoolNote"
                    @edit-institute-note="saveChangesToSchoolNote"
                    @remove-institute-note="removeSchoolNote"
                  />
                </v-window-item>
                <v-window-item value="history">
                  <SchoolHistory :school-i-d="schoolID" />
                </v-window-item>
                <v-window-item value="moves">
                  <SchoolMove
                    :school-i-d="schoolID"
                  />
                </v-window-item>
                <v-window-item value="funding">
                  <SchoolFunding
                    :school-i-d="schoolID"
                  />
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
import SchoolHistory from './common/SchoolHistory.vue';
import SchoolContacts from './common/SchoolContacts.vue';
import SchoolMove from './common/SchoolMove.vue';
import SchoolFunding from './common/SchoolFunding.vue';
import {authStore} from '@/store/modules/auth';
import {notificationsStore} from '@/store/modules/notifications';
import InstituteNotes from '@/components/institute/common/InstituteNotes.vue';
import {appStore} from '@/store/modules/app';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'SchoolDetailsPage',
  components: {
    InstituteNotes,
    Details,
    SchoolHistory,
    SchoolContacts,
    SchoolMove,
    SchoolFunding
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      school: '',
      district: '',
      authority: '',
      cleanWebsiteUrl: '',
      loading: true,
      notes: [],
      noteRequestCount: 0,
      independentArray: ['INDEPEND', 'INDP_FNS'],
      offshoreArray: ['OFFSHORE'],
      tab: null,
      items: [
        'Details', 'Contacts', 'Ministry Notes', 'History', 'Moves', 'Funding'
      ],
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
    ...mapState(notificationsStore, ['notification']),
    ...mapState(appStore, ['config']),
    notesLoading() {
      return this.noteRequestCount > 0;
    },
    dataReady: function () {
      return this.userInfo;
    },
    canEditSchools() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_SCHOOL_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_OFFSHORE_SCHOOL_PERMISSION);
    }
  },
  watch: {},
  created() {
    this.getThisSchoolsDetails();
    this.getSchoolNotes();
    this.setTab();
  },
  methods: {
    hasRequiredPermission,
    setTab(){
      if(this.$route.query?.contact){
        this.tab = 'contacts';
      }
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
    getSchoolNotes() {
      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}/notes`)
        .then(response => {
          this.notes = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
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
      ApiService.apiAxios.put(`${Routes.institute.SCHOOL_DATA_URL}/${schoolDetailsCopy.schoolId}`, schoolDetailsCopy)
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
    canViewFundingTab() {
      return this.canOnlyEditIndependentSchools && !this.config.DISABLE_SDC_FUNCTIONALITY;
    },
    saveNewSchoolNote(schoolNote) {
      this.noteRequestCount += 1;
      const payload = {
        schoolId: this.schoolID,
        content: schoolNote.content
      };
      ApiService.apiAxios.post(Routes.institute.SCHOOL_NOTE_URL, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the school.');
          this.getThisSchoolsDetails();
          this.getSchoolNotes();
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the school note. Please try again later.');
        })
        .finally(() => {
          this.noteRequestCount -= 1;
        });
    },
    saveChangesToSchoolNote(schoolNote) {
      this.noteRequestCount += 1;
      let payload = {
        noteId: schoolNote.noteId,
        schoolId: this.schoolID,
        content: schoolNote.content
      };
      ApiService.apiAxios.put(`${Routes.institute.SCHOOL_NOTE_URL}/${schoolNote.noteId}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been saved.');
          this.getThisSchoolsDetails();
          this.getSchoolNotes();
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the changes to the school note. Please try again later.');
        })
        .finally(() => {
          this.noteRequestCount -= 1;
        });
    },
    removeSchoolNote(schoolNote) {
      this.noteRequestCount += 1;
      ApiService.apiAxios.delete(`${Routes.institute.SCHOOL_NOTE_URL}/${this.schoolID}/${schoolNote.noteId}`).then(() => {
        this.setSuccessAlert('The school note has been removed successfully!');
        this.getThisSchoolsDetails();
        this.getSchoolNotes();
      }).catch(error => {
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while removing the school note. Please try again later.');
      }).finally(() => {
        this.noteRequestCount -= 1;
      });
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
    padding-right: 12em !important;
    padding-left: 12em !important;
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
    border-radius: 0;
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
