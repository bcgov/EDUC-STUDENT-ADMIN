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
              <v-col cols="2" lg="2" class="pb-0 pt-0">
                <v-icon class="ml-n1 pr-3" :color="getStatusColorAuthorityOrSchool(school.status)" dark>
                  mdi-circle-medium
                </v-icon>
                <span class="ml-n1">{{ school.status }}</span>
              </v-col>
              <v-col cols="12" lg="2" class="pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-phone-outline
                </v-icon>
                <span class="ml-n1">{{ formatPhoneNumber(school.phoneNumber) }}</span>
              </v-col>
              <v-col cols="12" lg="3" class="pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-at
                </v-icon>
                <span class="ml-n1">{{ school.email }}</span>
              </v-col>
              <v-col cols="12" lg="2" class="pb-0 pt-0">
                <v-icon aria-hidden="false" class="pr-3">
                  mdi-fax
                </v-icon>
                <span class="ml-n1">{{ formatPhoneNumber(school.faxNumber) }}</span>
              </v-col>
              <v-col  lg="3" sm="4" class="pb-0 pt-0">
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
      </v-col>
    </v-row>
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
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
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
      ApiService.apiAxios.get(`${Routes.institute.AUTHORITY_BY_ID_URL}/${authorityId}`)
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
    getGradesOffered(rawGrades){
      let gradeList = [];
      for(const grade of rawGrades){
        gradeList.push(this.schoolGradeTypes.find((facility) => facility.schoolGradeCode === grade.schoolGradeCode).label.replaceAll('Grade ', ''));
      }
      let onlyNumbers = gradeList.filter(Number);
      let onlyLetters = gradeList.filter(x => !onlyNumbers.includes(x));

      onlyNumbers = onlyNumbers.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      gradeList = onlyNumbers.concat(onlyLetters);
      return gradeList.toString().replace(/,/g, ', ');
    },
    getSchoolOrganization(school){
      return this.schoolOrganizationTypes.find((facility) => facility.schoolOrganizationCode === school.schoolOrganizationCode).label;
    },
    getNLCActivity(school){
      let nLCActivityList = [];
      for(const nl of school.neighborhoodLearning){
        nLCActivityList.push(this.schoolNeighborhoodLearningTypes.find((facility) => facility.neighborhoodLearningTypeCode === nl.neighborhoodLearningTypeCode).label);
      }
      nLCActivityList.sort();
      return nLCActivityList.toString().replace(/,/g, ', ');
    },
    getFacilityType(school){
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode).label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypeCodes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode).label;
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
