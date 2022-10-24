<template>
  <v-container class="containerSetup" fluid>
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to School List</a>
      </v-col>
    </v-row>
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
        <v-row class="pl-3">
          <v-col cols="12" class="pb-3 pt-0">
            <v-row cols="2">
              <v-col class="pb-0" cols="12">
                <v-row>
                  <v-col cols="10" class="d-flex justify-start">
                    <v-row no-gutters>
                      <v-col cols="12">
                        <h2 class="subjectHeading">{{school.mincode}} - {{school.displayName}}</h2>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="2" class="d-flex justify-end">
                    <PrimaryButton width="6em" icon="mdi-pencil" icon-left text="Edit"></PrimaryButton>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row v-if="school.schoolCategoryCode !== 'INDEPEND'" class="pb-2">
              <v-col class="pt-0 mt-n2" cols="12">
                <div class="ministryOwnershipTeamName"  style="color: black">{{district.districtNumber}} - {{district.name}}</div>
              </v-col>
            </v-row>
            <v-row v-else class="pb-2">
              <v-col class="pt-0 mt-n2" cols="12">
                <div class="ministryOwnershipTeamName"  style="color: black">{{authority.authorityNumber}} - {{authority.displayName}}</div>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="d-flex pb-0 pt-0">
                <v-icon class="ml-n1 pr-3" :color="getStatusColorAuthorityOrSchool(school.status)" dark>
                  mdi-circle-medium
                </v-icon>
                <span class="ml-n1">{{ school.status }}</span>
              </v-col>
              <v-col class="d-flex pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-phone-outline
                </v-icon>
                <span class="ml-n1">{{ formatPhoneNumber(school.phoneNumber) }}</span>
              </v-col>
              <v-col class="d-flex pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-at
                </v-icon>
                <span class="ml-n1">{{ school.email }}</span>
              </v-col>
              <v-col class="d-flex pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-fax
                </v-icon>
                <span class="ml-n1">{{ formatPhoneNumber(school.faxNumber) }}</span>
              </v-col>
              <v-col class="d-flex pb-0 pt-0">
                <v-icon class="mr-1" aria-hidden="false">
                  mdi-web
                </v-icon>
                <a v-if="cleanWebsiteUrl" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <h2 class="subjectHeading pt-4">School Details</h2>
          </v-col>
        </v-row>
        <v-row class="pl-3">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">Open Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ formatDate(school.openedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class=" pt-2 pr-0">
                <span style="color: grey">Close Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ formatDate(school.closedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">Facility Type</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{school.facilityType}}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">School Category</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ school.schoolCategory }}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="pt-5 pl-3">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">Grades Offered</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ getGradesOffered(school.grades) }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">School Organization</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ getSchoolOrganization(school) }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">NLC Activity</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ getNLCActivity(school) }}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <h2 class="subjectHeading pt-4">Addresses</h2>
          </v-col>
        </v-row>
        <v-row class="pl-3">
          <v-col cols="3">
            <v-row>
              <v-col>
                <v-icon class="pb-1 mr-1" right >
                  mdi-email-outline
                </v-icon>
                <span>Mailing Address</span>
              </v-col>
            </v-row>
            <v-row class="ml-9" no-gutters>
              <v-col>
                <span>{{ getMailingAddressItem('addressLine1') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('addressLine2') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode')  + ', ' + getMailingAddressItem('countryCode') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('postal') }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col v-if="!isOffshoreSchool" cols="3">
            <v-row>
              <v-col>
                <v-icon class="pb-1 mr-1" right >
                  mdi-home-outline
                </v-icon>
                <span>Physical Address</span>
              </v-col>
            </v-row>
            <v-row v-if="!hasSamePhysicalAddress" no-gutters>
              <v-col>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('addressLine1') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('addressLine2') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode')  + ', ' + getPhysicalAddressItem('countryCode') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('postal') }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row v-else no-gutters>
              <v-col>
                <v-row class="ml-9" no-gutters>
                  <v-col class="fontItalic">
                    <span>Same as Mailing Address</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-row>
              <v-col class="d-flex justify-start">
                <h2>Ministry Notes</h2>
              </v-col>
              <v-col class="d-flex justify-end">
                <PrimaryButton id="addNewNoteButton" width="9em" icon="mdi-plus" icon-left text="New Note" :disabled="canCreateNewNote()" @click.native="newNoteSheet = !newNoteSheet"></PrimaryButton>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="d-flex justify-start">
                <v-timeline id="schoolNotesTimeline" dense v-if="school.notes.length > 0">
                  <div v-for="(activity) in school.notes"
                       :key="activity.noteId">
                    <v-timeline-item right icon="mdi-message-bulleted" icon-color="#003366" large color="white" >
                      <v-card width="40em">
                        <v-card-title>
                          <div class="activityTitle">{{ activity.createUser }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ formatDate(activity.createDate.substring(0,19),'uuuu-MM-dd\'T\'HH:mm:ss', to='uuuu/MM/dd') }}</div>
                        </v-card-title>
                        <v-card-text class="activityContent">{{ activity.content }}</v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </div>
                </v-timeline>
                <v-timeline id="schoolNotesTimeline" dense v-else>
                  <v-timeline-item right icon="mdi-message-bulleted" icon-color="#003366" large color="white" >
                    <v-card width="40em">
                      <v-card-text class="activityContent">No notes have been recorded for this school</v-card-text>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-bottom-sheet
      v-model="newNoteSheet"
      inset
      no-click-animation
      scrollable
      persistent
      width="30%"
    >
      <v-card
        v-if="newNoteSheet"
        id="newNoteSheet"
        class="information-window-v-card">
        <v-card-title class="sheetHeader pt-1 pb-1">New Note</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-row>
            <v-col>
              <v-textarea
                id="newNoteTextArea"
                v-model="newNoteText"
                rows="8"
                label="Note"
                autofocus
                no-resize
                maxlength="4000"
                class="pt-0"
                ref="newNoteTextArea"
                hide-details="auto">
              </v-textarea>
            </v-col>
          </v-row>
          <v-row class="py-4 pr-2 justify-end">
            <PrimaryButton id="cancelNote" secondary text="Cancel" class="mr-2" @click.native="newNoteSheet = !newNoteSheet"></PrimaryButton>
            <PrimaryButton id="saveNote" text="Save" width="7rem" :loading="loading" @click.native="saveNewSchoolNote" :disabled="newNoteText === ''"></PrimaryButton>
          </v-row>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import PrimaryButton from '../util/PrimaryButton';
import {mapGetters, mapState} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '@/utils/institute/status';
import router from '@/router';
import { sanitizeUrl } from '@braintree/sanitize-url';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';

export default {
  name: 'SchoolDetailsPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  props: {
    schoolID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      newNoteSheet: false,
      newNoteText: '',
      school: '',
      district: '',
      authority: '',
      cleanWebsiteUrl: '',
      schoolFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolOrganizationTypes: [],
      schoolNeighborhoodLearningTypes: [],
      schoolGradeTypes: [],
      loading: true
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo','SCHOOL_ADMIN_ROLE','SCHOOL_INDEPENDENT_OFFSHORE_ADMIN']),
    ...mapState('institute', ['facilityTypeCodes']),
    ...mapState('institute', ['schoolCategoryTypeCodes']),
    ...mapState('institute', ['schoolOrganizationTypeCodes']),
    ...mapState('institute', ['schoolNeighborhoodLearningCodes']),
    ...mapState('institute', ['gradeCodes']),
    dataReady: function () {
      return this.userInfo;
    },
    hasSamePhysicalAddress(){
      return !this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    isOffshoreSchool(){
      return this.school.schoolCategoryCode === 'OFFSHORE';
    }
  },
  created() {
    this.$store.dispatch('institute/getFacilityTypeCodes').then(() => {
      this.schoolFacilityTypes = this.facilityTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolCategoryTypeCodes').then(() => {
      this.schoolCategoryTypes = this.schoolCategoryTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolOrganizationTypeCodes').then(() => {
      this.schoolOrganizationTypes = this.schoolOrganizationTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolNeighborhoodLearningCodes').then(() => {
      this.schoolNeighborhoodLearningTypes = this.schoolNeighborhoodLearningCodes;
    });
    this.$store.dispatch('institute/getGradeCodes').then(() => {
      this.schoolGradeTypes = this.gradeCodes;
    });
    this.getThisSchoolsDetails();
  },
  methods: {
    canCreateNewNote(){
      if(this.school.schoolCategoryCode === 'OFFSHORE' || this.school.schoolCategoryCode === 'INDEPEND'){
        return !(this.SCHOOL_ADMIN_ROLE || this.SCHOOL_INDEPENDENT_OFFSHORE_ADMIN);
      }
      return !this.SCHOOL_ADMIN_ROLE;
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
          this.sortNotes();
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    sortNotes(){
      this.school.notes = this.school.notes.sort(function(a, b) {
        const aCreateDate = new LocalDateTime.parse(a.createDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        const bCreateDate = new LocalDateTime.parse(b.createDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        if ( aCreateDate < bCreateDate ){
          return 1;
        }
        if ( aCreateDate > bCreateDate ){
          return -1;
        }
        return 0;
      });
    },
    saveNewSchoolNote() {
      this.loading = true;
      const payload = {
        schoolID: this.schoolID,
        noteContent: this.newNoteText
      };
      ApiService.apiAxios.post(`${Routes.institute.SCHOOL_NOTE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the school.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the school note. Please try again later.');
        })
        .finally(() => {
          this.getThisSchoolsDetails();
          this.newNoteSheet = false;
          this.newNoteText = '';
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
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    populateExtraSchoolFields(school){
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
    },
    getMailingAddressItem(item){
      let mailingAddress = this.school.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    },
    getGradesOffered(rawGrades) {
      let gradeList = [];
      for (const grade of rawGrades) {
        let schoolGradeType = this.schoolGradeTypes.find((facility) => facility.schoolGradeCode === grade.schoolGradeCode);
        if (schoolGradeType) {
          gradeList.push(schoolGradeType.label.replaceAll('Grade ', ''));
        }
      }
      let onlyNumbers = gradeList.filter(Number);
      let onlyLetters = gradeList.filter(x => !onlyNumbers.includes(x));

      onlyNumbers = onlyNumbers.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      gradeList = onlyNumbers.concat(onlyLetters);
      return gradeList.toString().replace(/,/g, ', ');
    },
    getSchoolOrganization(school) {
      return this.schoolOrganizationTypes.find((facility) => facility.schoolOrganizationCode === school.schoolOrganizationCode)?.label;
    },
    getNLCActivity(school) {
      let nLCActivityList = [];
      for (const nl of school.neighborhoodLearning) {
        let schoolNeighborhoodLearningType = this.schoolNeighborhoodLearningTypes.find((facility) => facility.neighborhoodLearningTypeCode === nl.neighborhoodLearningTypeCode);
        if (schoolNeighborhoodLearningType) {
          nLCActivityList.push(schoolNeighborhoodLearningType.label);
        }
      }
      nLCActivityList.sort();
      return nLCActivityList.toString().replace(/,/g, ', ');
    },
    getFacilityType(school) {
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode)?.label;
    },
    getSchoolCategory(school) {
      return this.schoolCategoryTypeCodes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode)?.label;
    },
    getStatusColorAuthorityOrSchool,
    formatDate,
    formatPhoneNumber,
    backButtonClick() {
      router.push({name: 'instituteSchoolList'});
    }
  }
};
</script>

<style scoped>

.fontItalic{
  font-style: italic;
}

.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.activityDisplayDate{
  font-size: smaller;
}

.activityContent {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  font-size: medium;
}

.divider {
  border-color: #FCBA19;
  border-width: unset;
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
</style>
