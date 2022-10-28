<template>
  <v-container class="containerSetup" fluid>
    <Spinner flat v-if="loadingAuthorities" />
    <div v-else>
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
          <a class="ml-1" @click="backButtonClick">Return to Dashboard</a>
        </v-col>
      </v-row>
      <v-row style="background: rgb(235, 237, 239);border-radius: 8px;" class="px-3 elevation-2">
        <v-col>
          <v-row>
            <v-col cols="5" class="d-flex justify-start">
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
            <v-col class="d-flex justify-start">
              <v-select id="status-select-field" clearable :items="authorityStatus" v-model="authorityStatusFilter" item-text="name"
                        item-value="code" label="Status"></v-select>
            </v-col>
            <v-col class="d-flex justify-start">
              <v-select
                id="authoritytype-select-field"
                clearable
                :items="authorityTypes"
                v-model="authorityTypeFilter"
                item-text="label"
                item-value="authorityTypeCode" label="Authority Type"></v-select>
            </v-col>
            <v-col class="d-flex justify-end mt-6">
              <PrimaryButton id="user-clear-button" text="Clear" secondary @click.native="clearButtonClick"/>
              <PrimaryButton class="ml-3"  id="user-search-button" text="Search" @click.native="searchButtonClick"
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
              :items="authorities"
              :loading="loadingTable"
              :server-items-length="totalAuthorities"
              class="elevation-2"
              hide-default-header
              mobile-breakpoint="0"
          >

            <template v-slot:item.secureExchangeStatusCode="{ item }">
                <v-row align="center" justify="center" id="authorityDetailsSelect" style="cursor: pointer;" @click="openAuthority(item.independentAuthorityId)">
                  <v-col cols="7" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col class="pb-2 pt-2 pr-0">
                        <span class="subjectHeading">{{ item.authorityNumber }} - {{ item.displayName }}</span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="pb-2 pt-2 pr-0">
                        <span class="ministryLine" style="color: black">{{ item.type }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col class="d-flex justify-start">
                    <v-icon class="ml-0" :color="getStatusColorAuthorityOrSchool(item.status)" right dark>
                      mdi-circle-medium
                    </v-icon>
                    <span class="ml-0 statusCodeLabel">{{ item.status }}</span>
                  </v-col>
                  <v-col cols="2" class="d-flex justify-start">
                    <v-icon aria-hidden="false">
                      mdi-phone-outline
                    </v-icon>
                    <span class="statusCodeLabel"> {{ formatPhoneNumber(item.phoneNumber) }}</span>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn id="authorityContacts"
                               color="#003366"
                               outlined
                               @click.native.stop="openAuthorityContacts(item.independentAuthorityId)"
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
            </template>

            <template v-slot:no-data>There are no authorities.</template>

          </v-data-table>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import Spinner from '@/components/common/Spinner';
import {mapGetters, mapState} from 'vuex';
import {isEmpty, omitBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber} from '@/utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '@/utils/institute/status';
import router from '@/router';

export default {
  name: 'AuthoritiesListPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton, Spinner
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
      totalAuthorities: 0,
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
      authorities: [],
      authoritySearchNames: [],
      authorityStatus: [],
      authorityCodeNameFilter: '',
      authorityStatusFilter: '',
      authorityTypeFilter: '',
      authorityTypes: [],
      loadingAuthorities: true
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapState('institute', ['authorityTypeCodes']),

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
    this.$store.dispatch('institute/getAuthorityTypeCodes').then(() => {
      this.authorityTypes = this.authorityTypeCodes;
    });

    this.setAuthorityStatuses();
    this.getAuthorityDropDownItems();
    this.getAuthorityList();
  },
  methods: {
    setAuthorityStatuses() {
      this.authorityStatus = [{name: 'Open', code: 'Open'}, {name: 'Closing', code: 'Closing'}, {name: 'Closed', code: 'Closed'}];
    },
    getAuthorityDropDownItems(){
      this.loadingAuthorities = true;
      ApiService.getAuthorities().then((response) => {
        let authorityList = response.data;
        for(const authority of authorityList){
          let authorityItem = {
            authorityCodeName: authority.authorityNumber + ' - ' + authority.name,
            authorityID: authority.authorityID,
          };
          this.authoritySearchNames.push(authorityItem);
        }
        this.authoritySearchNames = this.authoritySearchNames.sort(function(a, b) {
          if (a.authorityCodeName > b.authorityCodeName) {
            return 1;
          } else if (a.authorityCodeName < b.authorityCodeName) {
            return -1;
          }
          return 0;
        });
      }).catch(error => {
        this.setFailureAlert('An error occurred while getting authorities. Please try again later.');
        console.error(error);
      }).finally(() => {
        this.loadingAuthorities = false;
      });
    },
    getAuthorityList() {
      this.loadingTable = true;
      this.requests = [];
      this.authorities = [];

      if(this.authorityCodeNameFilter !== null && this.authorityCodeNameFilter!== '') {
        this.headerSearchParams.authorityID = this.authorityCodeNameFilter;
      }else{
        this.headerSearchParams.authorityID = '';
      }

      this.headerSearchParams.status = this.authorityStatusFilter;
      this.headerSearchParams.type = this.authorityTypeFilter;

      ApiService.apiAxios.get(Routes.institute.AUTHORITIES_PAGINATED_DATA_URL, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort: {
            authorityNumber: 'ASC'
          },
          searchParams: omitBy(this.headerSearchParams, isEmpty),
        }
      }).then(response => {
        let authorityList = response.data.content;
        this.authorities = [];
        for(const authority of authorityList){
          this.populateExtraAuthorityFields(authority);
          this.authorities.push(authority);
        }
        this.totalAuthorities = response.data.totalElements;
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });

    },
    populateExtraAuthorityFields(authority){
      authority.status = getStatusAuthorityOrSchool(authority);
      authority.type = this.getAuthorityType(authority);
    },
    getAuthorityType(authority){
      return this.authorityTypes.find((auth) => auth.authorityTypeCode === authority.authorityTypeCode).label;
    },
    formatPhoneNumber,
    getStatusColorAuthorityOrSchool,
    openAuthority(authorityId){
      this.$router.push({name: 'authorityDetails', params: {authorityID: authorityId}});
    },
    openAuthorityContacts(authorityId){
      this.$router.push({name: 'authorityContacts', params: {authorityID: authorityId}});
    },
    resetPageNumber(){
      this.pageNumber = 1;
    },
    searchEnabled(){
      return (this.authorityStatusFilter !== '' && this.authorityStatusFilter !== null)
          || (this.authorityTypeFilter !== '' && this.authorityTypeFilter !== null)
          || (this.authorityCodeNameFilter !== '' && this.authorityCodeNameFilter !== null);
    },
    backButtonClick() {
      router.push({name: 'home'});
    },
    clearButtonClick() {
      this.authorityCodeNameFilter = '';
      this.authorityStatusFilter = '';
      this.authorityTypeFilter = '';

      this.headerSearchParams.authorityID = '';
      this.headerSearchParams.status = '';
      this.headerSearchParams.type = '';

      this.getAuthorityList();
    },
    searchButtonClick() {
      this.resetPageNumber();
      this.getAuthorityList();
    },
  },
  watch: {
    pageSize() {
      this.getAuthorityList();
    },
    pageNumber() {
      this.getAuthorityList();
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
  padding-right: 30em !important;
  padding-left: 30em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 25em !important;
    padding-left: 25em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}

</style>
