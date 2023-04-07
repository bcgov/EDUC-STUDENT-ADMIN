<template>
  <v-container class="containerSetup" fluid>
    <Spinner flat v-if="loadingSchools"/>
    <div v-else>
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1 mt-1" @click="backButtonClick">Return to Dashboard</a>
      </v-col>
      <v-col class="d-flex justify-end">
        <PrimaryButton v-if="canAddSchool()" id="addSchoolBtn" icon-left width="11em" icon="mdi-plus-thick" text="New School" @click.native="newSchoolSheet = !newSchoolSheet"></PrimaryButton>
      </v-col>
    </v-row>
    <v-row style="background: rgb(235, 237, 239);border-radius: 8px;" class="pt-0 px-3 elevation-2">
      <v-col class="pt-0">
        <v-row>
          <v-col cols="12" md="4" class="d-flex justify-start">
            <v-autocomplete
              id="name-text-field"
              label="School Code & Name"
              item-value="schoolID"
              item-text="schoolCodeName"
              :items="schoolSearchNames"
              v-model="schoolCodeNameFilter"
              @change="searchButtonClick"
              clearable>
              <template v-slot:item="data">
                <v-icon :color="getStatusColorAuthorityOrSchool(data.item.status)">
                  mdi-circle-medium
                </v-icon>
                <span>{{ data.item.schoolCodeName }}</span>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="2" class="d-flex justify-start">
            <v-select
              id="status-select-field"
              clearable
              :items="schoolStatus"
              v-model="schoolStatusFilter"
              item-text="name"
              item-value="code"
              label="Status">
              <template v-slot:item="{ item }">
                <v-row>
                  <v-col cols="12" class="pr-0">
                    <v-icon :color="getStatusColorAuthorityOrSchool(item.name)">
                      mdi-circle-medium
                    </v-icon>
                    <span class="body-2">{{ item.name }}</span>
                  </v-col>
                </v-row>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="3" class="d-flex justify-start">
            <v-select
              id="status-select-field"
              clearable
              :items="activeSchoolCategoryTypes"
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
              @change="searchButtonClick"
              clearable>
              <template v-slot:item="data">
                <v-icon :color="getDistrictStatusColor(data.item.status)">
                  mdi-circle-medium
                </v-icon>
                <span>{{ data.item.districtNumberName }}</span>
              </template>
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
              @change="searchButtonClick"
              clearable>
              <template v-slot:item="data">
                <v-icon :color="getStatusColorAuthorityOrSchool(data.item.status)">
                  mdi-circle-medium
                </v-icon>
                <span>{{ data.item.authorityCodeName }}</span>
              </template>
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
            <v-row style="cursor: pointer;" @click="openSchool(item.schoolId)">
              <v-col class="pb-0 pt-0">
                <v-row no-gutters>
                  <v-col class="pr-3" cols="6">
                    <v-row class="mt-2" no-gutters>
                      <v-col>
                        <span class="subjectHeading">{{ item.mincode }} - {{ item.displayName }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="ministryLine mt-n5" style="color: black">{{
                            item.schoolCategory
                          }} | {{ item.facilityType }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col>
                    <v-row>
                      <v-col cols="4">
                        <v-row no-gutters>
                          <v-col>
                            <v-icon class="mb-1" :color="getStatusColorAuthorityOrSchool(item.status)" dark>
                              mdi-circle-medium
                            </v-icon>
                            <span class="statusCodeLabel">{{ item.status }}</span>
                          </v-col>
                        </v-row>
                        <v-row class="mt-3" no-gutters>
                          <v-col>
                            <v-icon class="mb-1">
                              mdi-phone-outline
                            </v-icon>
                            <span class="statusCodeLabel">{{ formatPhoneNumber(item.phoneNumber) }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col cols="7">
                        <v-row no-gutters>
                          <v-col>
                            <v-icon class="mb-1">
                              mdi-account-outline
                            </v-icon>
                            <span class="statusCodeLabel" style="color: black">{{item.principalsName}}</span>
                          </v-col>
                          <v-col class="d-flex justify-end">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn id="schoolContacts"
                                       color="#003366"
                                       outlined
                                       @click.native.stop="openSchoolContacts(item.schoolId)"
                                       class="mt-0 pt-0 filterButton ml-2"
                                       style="text-transform: initial"
                                       v-on="on"
                                >
                                  <v-icon color="#003366" style="margin-top: 0.07em" dark>mdi-account-multiple-outline</v-icon>
                                </v-btn>
                              </template>
                              <span>View Contacts</span>
                            </v-tooltip>
                          </v-col>
                        </v-row>
                        <v-row class="mt-1" no-gutters>
                          <v-col>
                            <v-icon class="mb-1">
                              mdi-at
                            </v-icon>
                            <span class="statusCodeLabel">{{ item.email }}</span>
                          </v-col>
                        </v-row>
                      </v-col>

                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>

          <template v-slot:no-data>-</template>

        </v-data-table>
      </v-col>
    </v-row>
    </div>
    <!--    new school sheet -->
    <v-bottom-sheet
        v-model="newSchoolSheet"
        inset
        no-click-animation
        scrollable
        persistent
        width="50% !important"
    >
      <NewSchoolPage
          v-if="newSchoolSheet"
          :districtNames="this.activeDistricts"
          :authorityNames="this.activeAuthorities"
          @newSchool:closeNewSchoolPage="newSchoolSheet = !newSchoolSheet"
      />
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters, mapMutations, mapState} from 'vuex';
import {isEmpty, omitBy, sortBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, sortByNameValue, formatContactName} from '@/utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool, isContactCurrent} from '@/utils/institute/status';
import router from '@/router';
import Spinner from '@/components/common/Spinner';
import NewSchoolPage from './NewSchoolPage';

export default {
  name: 'SchoolListPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    Spinner,
    NewSchoolPage
  },
  data() {
    return {
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
      activeDistricts: [],
      authoritySearchNames: [],
      activeAuthorities: [],
      schoolStatus: [],
      schoolCodeNameFilter: '',
      districtCodeNameFilter: '',
      authorityCodeNameFilter: '',
      schoolStatusFilter: '',
      schoolFacilityTypes: [],
      allSchoolFacilityTypes: [],
      schoolCategoryTypes: [],
      activeSchoolCategoryTypes: [],
      schoolCategoryTypeFilter: '',
      schoolFacilityTypeFilter: '',
      loadingSchools: true,
      newSchoolSheet: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo', 'SCHOOL_ADMIN_ROLE', 'SCHOOL_INDEPENDENT_ADMIN_ROLE']),
    ...mapState('app', ['schoolsMap']),
    ...mapState('edx', ['schoolSearchParams']),
    ...mapState('institute', ['facilityTypeCodes']),
    ...mapState('institute', ['activeFacilityTypeCodes']),
    ...mapState('institute', ['activeSchoolCategoryTypeCodes']),
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
    this.$store.dispatch('institute/getAllActiveFacilityTypeCodes').then(() => {
      this.schoolFacilityTypes = sortBy(this.activeFacilityTypeCodes,['displayOrder']);
    });
    this.$store.dispatch('institute/getAllFacilityTypeCodes').then(() => {
      this.allSchoolFacilityTypes = sortBy(this.facilityTypeCodes,['displayOrder']);
    });
    this.$store.dispatch('institute/getAllSchoolCategoryTypeCodes').then(() => {
      this.schoolCategoryTypes = sortBy(this.schoolCategoryTypeCodes,['displayOrder']);
    });
    this.$store.dispatch('institute/getAllActiveSchoolCategoryTypeCodes').then(() => {
      this.activeSchoolCategoryTypes = sortBy(this.activeSchoolCategoryTypeCodes,['displayOrder']);
    });

    this.setSchoolStatuses();
    this.getSchoolDropDownItems();
    this.getDistrictDropDownItems();
    this.getActiveDistrictDropDownItems();
    this.getAuthorityDropDownItems();
    this.getActiveAuthorityDropDownItems();
    this.setSearchValues();
    if(this.hasSearchValue()){
      this.getSchoolList();
    }
  },
  methods: {
    ...mapMutations('edx', ['setSchoolSearchParams']),
    setSearchValues() {
      this.schoolCodeNameFilter = this.schoolSearchParams.schoolID;
      this.districtCodeNameFilter = this.schoolSearchParams.districtID;
      this.authorityCodeNameFilter = this.schoolSearchParams.authorityID;
      this.schoolStatusFilter = this.schoolSearchParams.status;
      this.schoolFacilityTypeFilter = this.schoolSearchParams.facilityType;
      this.schoolCategoryTypeFilter = this.schoolSearchParams.schoolCategory;
      this.pageNumber = this.schoolSearchParams.pageNumber;
    },
    canAddSchool() {
      return this.SCHOOL_ADMIN_ROLE || this.SCHOOL_INDEPENDENT_ADMIN_ROLE;
    },
    setSchoolStatuses() {
      this.schoolStatus = [{name: 'Open', code: 'Open'}, {name: 'Opening', code: 'Opening'}, {name: 'Closing', code: 'Closing'}, {name: 'Closed', code: 'Closed'}, {name: 'Never Opened', code: 'NeverOpened'}];
    },
    getDistrictDropDownItems() {
      ApiService.getDistricts().then((response) => {
        for(const district of response.data){
          let districtItem = {
            districtNumberName: `${district.districtNumber} - ${district.name}`,
            districtId: district.districtId,
            status: district.districtStatusCode
          };
          this.districtSearchNames.push(districtItem);
        }
        this.districtSearchNames = this.sortByNameValue(this.districtSearchNames, 'districtNumberName');
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting districts. Please try again later.');
      });
    },
    getActiveDistrictDropDownItems() {
      ApiService.getActiveDistricts().then((response) => {
        for(const district of response.data){
          let districtItem = {
            districtNumberName: `${district.districtNumber} - ${district.name}`,
            districtId: district.districtId,
            districtNumber: district.districtNumber
          };
          this.activeDistricts.push(districtItem);
        }
        this.activeDistricts = this.sortByNameValue(this.activeDistricts, 'districtNumberName');
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting active districts. Please try again later.');
      });
    },
    getSchoolDropDownItems(){
      this.loadingSchools = true;
      ApiService.getSchools().then((response) => {
        let schoolList = response.data;
        for(const school of schoolList){
          let schoolItem = {
            schoolCodeName: school.mincode + ' - ' +school.schoolName,
            schoolID: school.schoolID,
            status: getStatusAuthorityOrSchool(school)
          };
          this.schoolSearchNames.push(schoolItem);
        }
        this.schoolSearchNames = this.sortByNameValue(this.schoolSearchNames, 'schoolCodeName');
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingSchools = false;
      });
    },
    getAuthorityDropDownItems(){
      ApiService.getAuthorities().then((response) => {
        for(const authority of response.data){
          let authorityItem = {
            authorityNumber: +authority.authorityNumber,
            authorityCodeName: `${authority.authorityNumber} - ${authority.name}`,
            authorityID: authority.authorityID,
            status: getStatusAuthorityOrSchool(authority)
          };
          this.authoritySearchNames.push(authorityItem);
        }
        this.authoritySearchNames = this.authoritySearchNames.sort(function(a, b){return a.authorityNumber-b.authorityNumber;});
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting authorities. Please try again later.');
      });
    },
    getActiveAuthorityDropDownItems(){
      ApiService.getActiveAuthorities().then((response) => {
        for(const authority of response.data){
          let authorityItem = {
            authorityNumber: +authority.authorityNumber,
            authorityCodeName: `${authority.authorityNumber} - ${authority.name}`,
            authorityID: authority.authorityID,
          };
          this.activeAuthorities.push(authorityItem);
        }
        this.activeAuthorities = this.activeAuthorities.sort(function(a, b){return a.authorityNumber-b.authorityNumber;});
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting active authorities. Please try again later.');
      });
    },
    clearSchoolList() {
      this.schools = [];
      this.totalSchools = 0;
      this.schoolSearchParams.schoolID = null;
      this.schoolSearchParams.districtID = null;
      this.schoolSearchParams.authorityID = null;
      this.schoolSearchParams.status = null;
      this.schoolSearchParams.facilityType = null;
      this.schoolSearchParams.schoolCategory = null;
      this.schoolSearchParams.pageNumber = 1;
      this.setSchoolSearchParams(this.schoolSearchParams);
    },
    hasSearchValue(){
      return this.schoolSearchParams.schoolID
        || this.schoolSearchParams.districtID
        || this.schoolSearchParams.authorityID
        || this.schoolSearchParams.status
        || this.schoolSearchParams.facilityType
        || this.schoolSearchParams.schoolCategory;
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
        this.schools = [];
        let schoolList = response.data.content;
        for(const school of schoolList){
          this.populateExtraSchoolFields(school);
          this.schools.push(school);
        }
        this.totalSchools = response.data.totalElements;
        this.setSavedSearchParams();
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });

    },
    setSavedSearchParams() {
      this.schoolSearchParams.schoolID = this.schoolCodeNameFilter;
      this.schoolSearchParams.districtID = this.districtCodeNameFilter;
      this.schoolSearchParams.authorityID = this.authorityCodeNameFilter;
      this.schoolSearchParams.status = this.schoolStatusFilter;
      this.schoolSearchParams.facilityType = this.schoolFacilityTypeFilter;
      this.schoolSearchParams.schoolCategory = this.schoolCategoryTypeFilter;
      this.schoolSearchParams.pageNumber = this.pageNumber;
      this.setSchoolSearchParams(this.schoolSearchParams);
    },
    populateExtraSchoolFields(school){
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
      //Populate school principal from contacts list
      school.principalsName = this.getPrincipalsName(school.contacts);

    },
    getFacilityType(school){
      return this.allSchoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode).label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode).label;
    },
    formatPhoneNumber,
    sortByNameValue,
    getPrincipalsName(contacts) {
      let oldestPrincipal = null;
      for (const contact of contacts) {
        if (contact.schoolContactTypeCode !== 'PRINCIPAL') {
          continue;
        }
        if (!isContactCurrent(contact)) {
          continue;
        }
        if ((oldestPrincipal !== null) && (new Date(oldestPrincipal.effectiveDate) < new Date(contact.effectiveDate))) {
          continue;
        }
        oldestPrincipal = contact;
      }
      if (oldestPrincipal == null) {
        return '';
      }
      return formatContactName(oldestPrincipal);
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
    getDistrictStatusColor(districtStatusCode){
      if(districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if(districtStatusCode === 'INACTIVE') {
        return 'red';
      }
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

      this.clearSchoolList();
    },
    searchButtonClick() {
      this.resetPageNumber();
      this.getSchoolList();
    },
    getStatusColorAuthorityOrSchool
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
  font-size: medium;
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
