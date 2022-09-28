<template>
  <v-container class="containerSetup" fluid>
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to Dashboard</a>
      </v-col>
    </v-row>
    <v-row style="background: rgb(235, 237, 239);border-radius: 8px;" class="px-3 elevation-2">
      <v-col>
        <v-row>
          <v-col cols="12" md="4" class="d-flex justify-start">
            <v-autocomplete
              id="name-text-field"
              label="School Code & Name"
              item-value="schoolID"
              item-text="schoolCodeName"
              :items="schoolSearchNames"
              v-model="schoolCodeNameFilter"
              clearable>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="2" class="d-flex justify-start">
            <v-select id="status-select-field" clearable :items="schoolStatus" v-model="schoolStatusFilter" item-text="name"
                      item-value="code" label="Status"></v-select>
          </v-col>
          <v-col cols="12" md="3" class="d-flex justify-start">
            <v-select
              id="status-select-field"
              clearable
              :items="schoolCategoryTypes"
              v-model="schoolCategoryTypeFilter"
              item-text="label"
              item-value="schoolCategoryCode" label="School Category"></v-select>
          </v-col>
          <v-col cols="12" md="3" class="d-flex justify-start">
            <v-select
              id="status-select-field"
              clearable
              :items="schoolFacilityTypes"
              v-model="schoolFacilityTypeFilter"
              item-text="label"
              item-value="facilityTypeCode" label="Facility Type"></v-select>
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12" md="4" class="d-flex justify-start">
            <v-autocomplete
              id="district-text-field"
              label="District Number & Name"
              item-value="districtId"
              item-text="districtNumberName"
              :items="districtSearchNames"
              v-model="districtCodeNameFilter"
              clearable>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-start">
            <v-autocomplete
              id="authority-text-field"
              label="Authority Code & Name"
              item-value="authorityID"
              item-text="authorityCodeName"
              :items="authoritySearchNames"
              v-model="authorityCodeNameFilter"
              clearable>
            </v-autocomplete>
          </v-col>
          <v-col class="mt-6 d-flex justify-end">
            <PrimaryButton id="user-search-button" text="Clear" secondary @click.native="clearButtonClick"/>
            <PrimaryButton class="ml-3" width="8em" id="user-clear-button" text="Search" @click.native="searchButtonClick"
                           :disabled="!searchEnabled()"/>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="px-0">
        <v-data-table
            :items-per-page.sync="pageSize"
            :page.sync="pageNumber"
            :headers="headers"
            :footer-props="{
                  'items-per-page-options': itemsPerPageOptions
                }"
            :items="schools"
            :loading="loadingTable"
            :server-items-length="totalSchools"
            class="elevation-2"
            hide-default-header
            mobile-breakpoint="0"
        >

          <template v-slot:item.secureExchangeStatusCode="{ item }">
              <v-row style="cursor: pointer;">
                <v-col cols="12" lg="4" xl="5" class="pb-0 pt-0">
                  <v-row class="mb-n4">
                    <v-col cols="12" class="pb-2 pt-2 pr-0">
                      <span class="subjectHeading">{{ item.mincode }} - {{ item.displayName }}</span>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="pb-1 pr-0">
                      <span class="ministryLine" style="color: black">{{
                          item.schoolCategory
                        }} | {{ item.facilityType }}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="6" lg="5" xl="2" class="pb-0 pt-0 mt-2">
                  <v-row>
                    <v-col cols="12" class="pb-1 pr-0">
                      <v-icon class="ml-0 pb-1" :color="getStatusColor(item.status)" right dark>
                        mdi-circle-medium
                      </v-icon>
                      <span class="ml-1 statusCodeLabel">{{ item.status }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" class="pb-1 pr-0">
                      <v-icon class="mb-1" aria-hidden="false">
                        mdi-phone-outline
                      </v-icon>
                      <span class="statusCodeLabel"> {{ formatPhoneNumber(item.phoneNumber) }}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="6" lg="5" xl="3" style="text-align: start" class="pb-0 pt-0 mt-2">
                  <v-row>
                    <v-col cols="12" class="pb-1 pr-0">
                      <v-icon class="mr-1" aria-hidden="false">
                        mdi-at
                      </v-icon>
                      <span class="statusCodeLabel">{{ item.email }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" class="pb-1 pr-0">
                      <v-icon class="mb-1 mr-1" aria-hidden="false">
                        mdi-account-outline
                      </v-icon>
                      <span class="statusCodeLabel" style="color: black">{{item.principalsName}}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col lg="2" md="3" sm="4">
                  <v-row class="mb-2" no-gutters>
                    <v-col>
                      <v-btn id="schoolDetails"
                             color="#003366"
                             width="100%"
                             outlined
                             @click="openSchool(item.schoolId)"
                             class="mt-0 pt-0 filterButton"
                             style="text-transform: initial"
                      >
                        <v-icon color="#003366" style="margin-top: 0.07em" class="ml-n5 mr-1" dark>mdi-newspaper-variant-outline</v-icon>
                        <span class="ml-1">Details</span>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col>
                      <v-btn id="schoolContacts"
                             color="#003366"
                             width="100%"
                             outlined
                             @click="openSchoolContacts(item.schoolId)"
                             class="mt-0 pt-0 filterButton"
                             style="text-transform: initial"
                      >
                        <v-icon color="#003366" style="margin-top: 0.07em" class="ml-n1 mr-1" dark>mdi-account-multiple-outline</v-icon>
                        <span class="ml-1">Contacts</span>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
          </template>

          <template v-slot:no-data>There are no schools.</template>

        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters, mapState} from 'vuex';
import {isEmpty, omitBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber} from '@/utils/format';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import router from '@/router';

export default {
  name: 'SchoolListPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  data() {
    return {
      statusSelectFilter: null,
      statusRadioGroup: 'statusFilterActive',
      statusRadioGroupEnabled: true,
      headers: [
        {
          text: 'Status',
          align: 'start',
          sortable: false,
          value: 'secureExchangeStatusCode',
        }
      ],
      selectedItem: 0,
      pageNumber: 1,
      pageSize: 15,
      totalSchools: 0,
      itemsPerPageOptions: [15],
      loadingTable: false,
      dateMenu: false,
      headerSearchParams: {
        schoolNumber: '',
        status: '',
        category: '',
        type: ''
      },
      requests: [],
      isActiveMessagesTabEnabled: true,
      schools: [],
      schoolSearchNames: [],
      districtSearchNames: [],
      authoritySearchNames: [],
      schoolStatus: [],
      schoolCodeNameFilter: '',
      districtCodeNameFilter: '',
      authorityCodeNameFilter: '',
      schoolStatusFilter: '',
      schoolFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolCategoryTypeFilter: '',
      schoolFacilityTypeFilter: '',
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapState('app', ['schoolsMap']),
    ...mapState('institute', ['facilityTypeCodes']),
    ...mapState('institute', ['schoolCategoryTypeCodes']),

    getSheetWidth(){
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
      case 'sm':
        return 60;
      default:
        return 30;
      }
    },
  },
  created() {
    this.$store.dispatch('edx/getMinistryTeams');
    this.$store.dispatch('institute/getFacilityTypeCodes').then(() => {
      this.schoolFacilityTypes = this.facilityTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolCategoryTypeCodes').then(() => {
      this.schoolCategoryTypes = this.schoolCategoryTypeCodes;
    });

    this.setSchoolStatuses();
    this.getSchoolDropDownItems();
    this.getDistrictDropDownItems();
    this.getAuthorityDropDownItems();
    this.getSchoolList();
  },
  methods: {
    setSchoolStatuses() {
      this.schoolStatus = [{name: 'Open', code: 'Open'}, {name: 'Opening', code: 'Opening'}, {name: 'Closing', code: 'Closing'}, {name: 'Closed', code: 'Closed'}, {name: 'Never Opened', code: 'NeverOpened'}];
    },
    getDistrictDropDownItems() {
      this.loadingDistricts = true;
      ApiService.getDistricts().then((response) => {
        this.districtList = response.data;
        for(const district of this.districtList){
          let districtItem = {
            districtNumberName: district.districtNumber + ' - ' + district.name,
            districtId: district.districtId,
          };
          this.districtSearchNames.push(districtItem);
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting districts. Please try again later.');
      }).finally(() => {
        this.loadingDistricts = false;
      });
    },
    getSchoolDropDownItems(){
      ApiService.getSchools().then((response) => {
        let schoolList = response.data;
        for(const school of schoolList){
          let schoolItem = {
            schoolCodeName: school.mincode + ' - ' +school.schoolName,
            schoolID: school.schoolID,
          };
          this.schoolSearchNames.push(schoolItem);
        }
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      });
    },
    getAuthorityDropDownItems(){
      ApiService.getAuthorities().then((response) => {
        let authorityList = response.data;
        for(const authority of authorityList){
          let authorityItem = {
            authorityCodeName: authority.authorityNumber + ' - ' + authority.name,
            authorityID: authority.authorityID,
          };
          this.authoritySearchNames.push(authorityItem);
        }
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      });
    },
    getSchoolList() {
      this.loadingTable = true;
      this.requests = [];
      this.schools = [];

      if(this.schoolCodeNameFilter !== null && this.schoolCodeNameFilter!== '') {
        this.headerSearchParams.schoolID = this.schoolCodeNameFilter;
      }else{
        this.headerSearchParams.schoolID = '';
      }

      if(this.districtCodeNameFilter !== null && this.districtCodeNameFilter!== '') {
        this.headerSearchParams.districtID = this.districtCodeNameFilter;
      }else{
        this.headerSearchParams.districtID = '';
      }

      if(this.authorityCodeNameFilter !== null && this.authorityCodeNameFilter!== '') {
        this.headerSearchParams.authorityID = this.authorityCodeNameFilter;
      }else{
        this.headerSearchParams.authorityID = '';
      }

      this.headerSearchParams.status = this.schoolStatusFilter;
      this.headerSearchParams.category = this.schoolCategoryTypeFilter;
      this.headerSearchParams.type = this.schoolFacilityTypeFilter;

      ApiService.apiAxios.get(Routes.institute.SCHOOL_PAGINATED_DATA_URL, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort: {
            schoolNumber: 'ASC'
          },
          searchParams: omitBy(this.headerSearchParams, isEmpty),
        }
      }).then(response => {
        let schoolList = response.data.content;
        for(const school of schoolList){
          this.populateExtraSchoolFields(school);
          this.schools.push(school);
        }
        this.totalSchools = response.data.totalElements;

      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });

    },
    populateExtraSchoolFields(school){
      school.status = this.getSchoolStatus(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
      //Populate school principal from contacts list
      school.principalsName = this.getPrincipalsName(school.contacts);

    },
    getFacilityType(school){
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode).label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypeCodes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode).label;
    },
    formatPhoneNumber,
    getPrincipalsName(contacts) {
      let principalsName = null;
      for (const contact of contacts){
        if(contact.schoolContactTypeCode === 'PRINCIPAL'){
          principalsName = contact.firstName + ' ' + contact.lastName;
        }
      }
      return principalsName;
    },
    getSchoolStatus: function (school) {
      const currentDate = LocalDate.now();
      let openedDate = school.openedDate;
      let closedDate = school.closedDate;

      if (!openedDate) {
        return 'Never Opened';
      }
      const parsedOpenDate = new LocalDate.parse(openedDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));

      let parsedCloseDate = null;
      if(closedDate){
        parsedCloseDate = new LocalDate.parse(closedDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
      }

      if (parsedOpenDate <= currentDate && parsedCloseDate === null) {
        return 'Open';
      } else if (parsedOpenDate > currentDate) {
        return 'Opening';
      } else if (parsedOpenDate <= currentDate && parsedCloseDate > currentDate) {
        return 'Closing';
      } else if (parsedCloseDate <= currentDate) {
        return 'Closed';
      }

      return 'Closed';
    },
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      } else if (status === 'Opening'){
        return 'blue';
      } else if (status === 'Closing'){
        return 'orange';
      } else if (status === 'Closed') {
        return 'red';
      }
    },
    openSchool(schoolId){
      this.$router.push({name: 'schoolDetails', params: {schoolID: schoolId}});
    },
    openSchoolContacts(schoolId){
      this.$router.push({name: 'schoolContacts', params: {schoolID: schoolId}});
    },
    resetPageNumber(){
      this.pageNumber = 1;
    },
    searchEnabled(){
      return (this.schoolCodeNameFilter !== '' && this.schoolCodeNameFilter !== null) || (this.schoolStatusFilter !== '' && this.schoolStatusFilter !== null)
          || (this.schoolFacilityTypeFilter !== '' && this.schoolFacilityTypeFilter !== null) || (this.districtCodeNameFilter !== '' && this.districtCodeNameFilter !== null)
          || (this.schoolCategoryTypeFilter !== '' && this.schoolCategoryTypeFilter !== null) || (this.authorityCodeNameFilter !== '' && this.authorityCodeNameFilter !== null);
    },
    backButtonClick() {
      router.push({name: 'home'});
    },
    clearButtonClick() {
      this.schoolCodeNameFilter = '';
      this.districtCodeNameFilter = '';
      this.authorityCodeNameFilter = '';

      this.schoolStatusFilter = '';
      this.schoolFacilityTypeFilter = '';
      this.schoolCategoryTypeFilter = '';

      this.headerSearchParams.schoolNumber = '';
      this.headerSearchParams.status = '';
      this.headerSearchParams.type = '';

      this.getSchoolList();
    },
    searchButtonClick() {
      this.resetPageNumber();
      this.getSchoolList();
    },
  },
  watch: {
    pageSize() {
      this.getSchoolList();
    },
    pageNumber() {
      this.getSchoolList();
    }
  }
};
</script>

<style scoped>

.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.tableRow {
  cursor: pointer;
}

.unread {
  font-weight: bold;
}

.v-data-table >>> .v-data-table__wrapper {
  overflow-x: hidden;
}

.filterButton.v-btn--outlined {
  border: thin solid #003366 !important;
}

.v-radio >>> .v-icon {
  color: #003366;
}

.activeRadio {
  color: #003366;
}

.subjectHeading {
  font-size: large;
  cursor: pointer;
  font-weight: bold;
}

.ministryLine {
  color: black;
  font-size: medium;
}

.statusCodeLabel {
  font-size: large;
}

.v-dialog__content >>> .v-bottom-sheet {
  width: 30% !important;
}

.v-expansion-panel-header:not(.v-expansion-panel-header--mousedown):focus::before {
  display: none;
}

@media screen and (max-width: 801px){
  .subjectHeading {
    font-size: medium;
  }

  .statusCodeLabel{
    font-size: inherit;
  }

  .ministryLine{
    font-size: inherit;
  }
}
@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
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
