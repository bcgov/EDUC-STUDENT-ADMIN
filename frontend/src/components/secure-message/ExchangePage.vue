<template>
  <v-container class="containerSetup" fluid>
    <v-row class="pt-0">
      <v-col class="pt-0">
        <v-row no-gutters class='pt-2 d-flex justify-end'>
          <v-col class='d-flex justify-start'>
            <h1 id="ministryTeamInboxTitle">{{ ministryTeamName }} Inbox</h1>
          </v-col>
        </v-row>
        <v-row class="pt-0">
          <v-col class="mt-1 d-flex justify-start">
            <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
            <a class="pt-1 ml-1" @click="backButtonClick">Return to Dashboard</a>
          </v-col>
          <v-col class='d-flex justify-end'>
            <PrimaryButton
              :iconLeft=true
              :large-icon=true
              icon="mdi-account-check-outline"
              id="claimBTN"
              text="Claim"
              class="mr-2"
              :disabled="isClaimDisabled"
              @click.native="claimExchanges"
            ></PrimaryButton>
            <PrimaryButton
              :iconLeft=true
              :large-icon=true
              icon="mdi-plus"
              id="newMessageBtn"
              text="New Message"
              @click.native="newMessageSheet = !newMessageSheet"
            ></PrimaryButton>
          </v-col>
        </v-row>
        <v-expansion-panels flat style="border-radius: 6px">
          <v-expansion-panel @click="onExpansionPanelClick" style="background: #ebedef">
            <v-expansion-panel-header color="#ebedef" class="pt-0 pb-0" disable-icon-rotate>
              <v-radio-group
                @click.native.stop
                color="#003366"
                v-model="statusRadioGroup"
                :disabled="!statusRadioGroupEnabled"
                row
                class="pt-0 pb-0 mt-0 mb-0"
              >
                <v-radio class="mt-2 radio-blue-text"
                         label="My Active Messages"
                         color="#003366"
                         value="statusFilterActive"
                         @click.native="statusFilterActiveClicked"
                ><template v-slot:label>
                  <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">My Active Messages</span>
                </template></v-radio>
                <v-radio class="mt-2 radio-blue-text"
                         label="All Active Messages"
                         color="#003366"
                         value="statusFilterAllActive"
                         @click.native="statusFilterAllActiveClicked"
                ><template v-slot:label>
                  <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">All Active Messages</span>
                </template></v-radio>
                <v-radio class="mt-2 radio-blue-text"
                         label="All Active Messages"
                         color="#003366"
                         value="statusFilterAll"
                         @click.native="filterExchanges"
                ><template v-slot:label>
                  <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">All Messages</span>
                </template></v-radio>
              </v-radio-group>
              <template v-slot:actions>
                <v-btn id="filterid"
                       title="filter"
                       color="#003366"
                       outlined
                       class="mt-0 pt-0 filterButton"
                >
                  <v-icon color="#003366" class="ml-n1" :nudge-down="4" right dark>mdi-filter-outline</v-icon>
                  <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">{{ filterText }}</span>
                </v-btn>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <v-col cols="12" md="4" class="pt-0">
                  <v-autocomplete
                    id='schoolName'
                    class="pt-0 mt-0"
                    prepend-inner-icon="mdi-account-box-outline"
                    v-model="contactNameFilter"
                    :items="schools"
                    color="#003366"
                    label="Contact"
                    clearable
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" md="4" class="pt-0">
                  <v-text-field
                    class="pt-0 mt-0 pl-9"
                    id="subject-text-field"
                    v-model="subjectFilter"
                    label="Subject"
                    prepend-inner-icon="mdi-book-open-variant"
                    clearable
                    @keyup.enter="enterPushed()"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4" class="pt-0" :class="{'pl-12 pr-12': $vuetify.breakpoint.mdAndUp}">
                  <v-menu
                    id="messageDate"
                    ref="messageDateFilter"
                    v-model="messageDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        id="messageDateTextField"
                        class="pt-0 mt-0"
                        v-model="messageDate"
                        label="Message Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="messageDate"
                      :active-picker.sync="activeMessageDatePicker"
                      :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                      min="2022-01-01"
                      @change="saveMessageDate"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4" class="pt-0">
                  <v-select
                    v-model="statusSelectFilter"
                    :items="secureExchangeStatusCodes"
                    id="statusSelector"
                    item-text="label"
                    class="pt-0 mt-0"
                    item-value="secureExchangeStatusCode"
                    prepend-inner-icon="mdi-alert-circle-outline"
                    label="Status"
                    single-line
                    clearable
                  >
                    <template v-slot:item="{ item }">
                      <v-row>
                        <v-col cols="12" class="pr-0">
                          <v-icon :color="getStatusColor(item.label)">
                            mdi-circle-medium
                          </v-icon>
                          <span class="body-2">{{ item.label }}</span>
                        </v-col>
                      </v-row>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" md="4" class="pt-0">
                  <v-text-field
                    class="pt-0 mt-0 pl-9"
                    id="claimed-by-text-field"
                    v-model="claimedByFilter"
                    label="Claimed By"
                    prepend-inner-icon="mdi-account-check-outline"
                    clearable
                    @keyup.enter="enterPushed()"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4" class="pt-0">
                  <v-text-field
                    class="pt-0 mt-0 pl-9 pr-9"
                    v-model="messageIDFilter"
                    label="Message ID"
                    prepend-inner-icon="mdi-pound"
                    clearable
                    @keyup.enter="enterPushed()"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4" class="pt-0">
                  <v-text-field
                    class="pt-0 mt-0"
                    v-model="studentIDFilter"
                    label="Student PEN"
                    prepend-inner-icon="mdi-account"
                    maxlength="9"
                    counter="9"
                    clearable
                    @keyup.enter="enterPushed()"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="justify-end mt-n2">
                <v-col cols="12" class="d-flex justify-end">
                  <PrimaryButton class="mr-3" id="search-clear" :secondary="true" @click.native="clearSearch"
                                 text="Clear"></PrimaryButton>
                  <PrimaryButton @click.native="filterExchanges" id="searchButton" :loading="loadingTable" :disabled="!searchEnabled" text="Search"></PrimaryButton>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-row>
          <v-col>
            <v-data-table
              :items-per-page.sync="pageSize"
              :page.sync="pageNumber"
              :headers="headers"
              :footer-props="{
                      'items-per-page-options': itemsPerPageOptions
                    }"
              :items="exchanges"
              :loading="loadingTable"
              :server-items-length="totalRequests"
              class="elevation-1"
              show-select
              item-key="secureExchangeID"
              mobile-breakpoint="0"
              v-model="selectedExchanges"
            >
              <template #header.data-table-select></template>
              <template v-slot:item.secureExchangeStatusCode="{ item }">
                <v-row class="ml-n6" style="cursor: pointer;">
                  <v-col cols="6" lg="7" xl="7" class="pb-0 pt-0" @click="openExchange(item.secureExchangeID)">
                    <v-row class="mb-n4">
                      <v-col cols="12" class="pb-2 pt-2 pr-0">
                        <span class="subjectHeading" :style="{color: item.isReadByMinistry ? 'black': '#1f7cef'}">{{ getSubject(item.subject) }}</span><span style="color: gray"> - {{ getLatestComment(item) }}</span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pb-1 pr-0">
                        <span class="ministryLine" >{{ getContactLineItem(item) }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="6" lg="5" xl="5" style="text-align: end" class="pb-0 pt-0" @click="openExchange(item.secureExchangeID)">
                    <v-row class="d-flex justify-end">
                      <v-col cols="2">
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-icon  color="grey darken-3" right size="medium" dark>mdi-pound</v-icon>
                          </v-col>
                          <v-col cols="6">
                            <span class="statusCodeLabel">{{ item.sequenceNumber }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col cols="2">
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-icon class="pb-1" :color="getStatusColor(item.secureExchangeStatusCode)" right dark>mdi-circle-medium</v-icon>
                          </v-col>
                          <v-col cols="6">
                            <span class="statusCodeLabel">{{ item.secureExchangeStatusCode }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col cols="3" class="pr-0">
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-icon style="margin-bottom: 0.2em" color="grey darken-3" right dark>mdi-account-outline</v-icon>
                          </v-col>
                          <v-col cols="6">
                            <span class="statusCodeLabel">{{ getReviewer(item.reviewer) }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col cols="4" class="pl-0 pr-0">
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-icon class="pr-1" style="margin-bottom: 0.2em" color="grey darken-3" right dark>mdi-clock-outline</v-icon>
                          </v-col>
                          <v-col cols="4">
                            <span class="statusCodeLabel">{{ getNumberOfDays(item.createDate) }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>
              <template v-slot:no-data>There are no messages.</template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-bottom-sheet
      v-model="newMessageSheet"
      inset
      no-click-animation
      scrollable
      persistent
      width="30%"
    >
      <v-card
        v-if="newMessageSheet"
        class="information-window-v-card">
        <v-card-title class="sheetHeader pt-1 pb-1">New Message</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <NewMessagePage
            @secure-exchange:messageSent="messageSent"
            @secure-exchange:cancelMessage="newMessageSheet = false"
          >
          </NewMessagePage>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>


<script>

import ApiService from '../../common/apiService';
import {EDX_SAGA_REQUEST_DELAY_MILLISECONDS, Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import NewMessagePage from './NewMessagePage';
import {mapGetters, mapState} from 'vuex';
import router from '@/router';
import {isEmpty, omitBy} from 'lodash';
import {LocalDate, ChronoUnit, DateTimeFormatter} from '@js-joda/core';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'ExchangeInbox',
  mixins: [alertMixin],
  props: {
    ministryOwnershipGroupRoleID: {
      type: String,
      required: true
    },
  },
  components: {
    PrimaryButton,
    NewMessagePage
  },
  data() {
    return {
      newMessageSheet: false,
      statusSelectFilter: null,
      statusRadioGroup: 'statusFilterAllActive',
      statusRadioGroupEnabled: true,
      messageDateFilter: false,
      activeMessageDatePicker: null,
      messageDate: null,
      subjectFilter: '',
      messageIDFilter: '',
      studentIDFilter: '',
      claimedByFilter: '',
      contactNameFilter: '',
      filterText: 'More Filters',
      ministryTeamName: '',
      headers: [
        {
          text: '',
          align: 'end',
          value: 'data-table-select'
        },
        {
          text: '',
          align: 'start',
          sortable: false,
          value: 'secureExchangeStatusCode',
        },
      ],
      pageNumber: 1,
      pageSize: 15,
      totalRequests: 0,
      itemsPerPageOptions: [15],
      loadingTableCount: 0,
      dateMenu: false,
      headerSearchParams: {
        sequenceNumber: '',
        contact: '',
        subject: '',
        createDate: [],
        secureExchangeStatusCode: ''
      },
      headerSortParams: {
        currentSort: 'createDate',
        currentSortDir: true
      },
      exchanges: [],
      selectedExchanges: [],
      isActiveMessagesTabEnabled: true,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('app', ['schoolMap']),
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('edx', ['statuses']),
    ...mapState('edx', ['ministryTeams']),
    secureExchangeStatusCodes(){
      return this.statuses;
    },
    isClaimDisabled(){
      let closedExchanges = this.selectedExchanges.find(exchange => exchange.secureExchangeStatusCode.toUpperCase() === 'CLOSED');
      return this.selectedExchanges.length === 0 || closedExchanges !== undefined;
    },
    searchEnabled(){
      return (this.claimedByFilter !== '' && this.claimedByFilter !== null)
        || (this.messageIDFilter !== '' && this.messageIDFilter !== null)
        || (this.studentIDFilter !== '' && this.studentIDFilter !== null)
        || (this.subjectFilter !== '' && this.subjectFilter !== null)
        || (this.contactNameFilter !== '' && this.contactNameFilter !== null && this.contactNameFilter !== undefined)
        || this.messageDate !== null
        || this.secureExchangeStatusCodes.some(item => item.secureExchangeStatusCode === this.statusSelectFilter);
    },
    schools() {
      return _.sortBy(Array.from(this.schoolMap.entries()).map(school => ({ text: `${school[1]?.schoolName} (${school[1]?.mincode})`, value: school[1]?.schoolID, mincode: school[1].mincode})), ['mincode']);
    },
    myself() {
      return { name: this.userInfo.userName, id: this.userInfo.userGuid };
    },
    loadingTable() {
      return this.loadingTableCount !== 0;
    },
  },
  created() {
    this.$store.dispatch('app/getCodes');
    this.$store.dispatch('edx/getCodes');
    this.$store.dispatch('edx/getMinistryTeams').then(() => {
      this.getExchanges();
      this.getMinistryTeamNameByGroupRoleID();
    });
    this.setFilterStatusAllActive();
  },
  methods: {
    enterPushed() {
      if (this.searchEnabled) {
        this.filterExchanges();
      }
    },
    messageSent(){
      this.newMessageSheet = !this.newMessageSheet;
      setTimeout(this.getExchanges, EDX_SAGA_REQUEST_DELAY_MILLISECONDS);
    },
    getMinistryTeamNameByGroupRoleID(){
      this.ministryTeamName = this.ministryTeams.find(item => item.groupRoleIdentifier === this.ministryOwnershipGroupRoleID).teamName;
    },
    getNumberOfDays(start) {
      const start_date = new LocalDate.parse(start, DateTimeFormatter.ofPattern('yyyy/MM/dd'));
      const end_date = LocalDate.now();

      return ChronoUnit.DAYS.between(start_date, end_date) + ' days';
    },
    getSchoolName(schoolID) {
      return this.schoolMap.get(schoolID)?.schoolName;
    },
    getContactLineItem(item){
      switch (item.secureExchangeContactTypeCode) {
      case 'SCHOOL':
        return `${this.schoolMap.get(item.contactIdentifier).schoolName} (${this.schoolMap.get(item.contactIdentifier).mincode}) - ${item.createDate}`;
      }
    },
    getReviewer(reviewer){
      if(!reviewer) return 'Unclaimed';
      return reviewer;
    },
    getMinistryTeamIDByGroupRoleID(groupRoleID) {
      return this.ministryTeams.find(item => item.groupRoleIdentifier === groupRoleID).ministryOwnershipTeamId;
    },
    setFilterStatusAllActive(){
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
      this.headerSearchParams.reviewer = '';
    },
    setFilterStatusAll(){
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN', 'CLOSED'];
      this.headerSearchParams.reviewer = '';
    },
    setFilterStatusActive(){
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
      this.headerSearchParams.reviewer = this.myself.name;
    },
    statusFilterActiveClicked(){
      this.setFilterStatusActive();
      this.resetPageNumber();
      this.getExchanges();
    },
    statusFilterAllActiveClicked(){
      this.setFilterStatusAllActive();
      this.resetPageNumber();
      this.getExchanges();
    },
    resetPageNumber(){
      this.pageNumber = 1;
    },
    clearSearch(runSearch = true){
      this.subjectFilter = '';
      this.messageIDFilter = '';
      this.studentIDFilter = '';
      this.claimedByFilter = '';
      this.contactNameFilter = '';
      this.messageDate = null;
      this.messageDateFilter = null;
      this.statusSelectFilter = '';
      if(runSearch){
        this.resetPageNumber();
        this.setFilterStatusAll();
        this.getExchanges();
      }
    },
    onExpansionPanelClick(event) {
      if(event.currentTarget.classList.contains('v-expansion-panel-header--active')) {
        this.filterText = 'More Filters';
        this.statusRadioGroupEnabled = true;
        this.statusRadioGroup = 'statusFilterAllActive';
        this.setFilterStatusAllActive();
        this.clearSearch(false);
        this.resetPageNumber();
        this.getExchanges();
      } else {
        this.setFilterStatusAll();
        this.statusRadioGroup = 'statusFilterAll';
        this.filterText = 'Less Filters';
        this.statusRadioGroupEnabled = false;
        this.clearSearch();
      }

    },
    saveMessageDate(date) {
      this.$refs.messageDateFilter.save(date);
    },
    getStatusColor(status){
      if(status === 'Open') {
        return 'green';
      } else if(status === 'Closed') {
        return 'red';
      }
    },
    getSubject(subject){
      if(subject.length > 16){
        switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return this.getContentString(subject, 15);
        case 'md':
          return this.getContentString(subject, 15);
        case 'lg':
          return this.getContentString(subject, 20);
        default:
          return this.getContentString(subject, 25);
        }
      }
      return subject;
    },
    getContentString(content, length){
      if(content.length > length) {
        return content.substring(0, length) + '...';
      }
      return content;
    },
    getLatestComment(item){
      const content = item.commentsList.reduce((a, b) => (a.createDate > b.createDate ? a : b)).content;
      if(content.length > 25){
        switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return this.getContentString(content, 30);
        case 'md':
          return this.getContentString(content, 40);
        case 'lg':
        case 'xl':
          return this.getContentString(content, 45);
        default:
          return content;
        }
      }
      return content;
    },
    filterExchanges(){
      this.setFilterStatusAll();
      this.resetPageNumber();
      this.getExchanges();
    },
    claimExchanges() {
      this.loadingTableCount += 1;
      const selected = this.selectedExchanges.map(({ secureExchangeID }) => secureExchangeID);
      const payload = {
        secureExchangeIDs: selected,
      };
      ApiService.apiAxios.post(`${Routes['edx'].CLAIM_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Secure exchanges have been claimed successfully.');
          this.getExchanges();
          this.selectedExchanges = [];
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert('An error occurred while claiming exchanges. Please try again later.');
        })
        .finally(() => {
          this.loadingTableCount -= 1;
        });
    },
    getExchanges() {
      this.loadingTableCount += 1;
      this.exchanges = [];
      const sort = {
        createDate: 'DESC'
      };

      this.headerSearchParams.subject = this.subjectFilter;
      this.headerSearchParams.contactIdentifier = this.contactNameFilter;
      this.headerSearchParams.sequenceNumber = this.messageIDFilter;
      this.headerSearchParams.studentPEN = this.studentIDFilter;
      this.headerSearchParams.ministryOwnershipTeamID = this.getMinistryTeamIDByGroupRoleID(this.ministryOwnershipGroupRoleID);
      this.headerSearchParams.createDate = this.messageDate === null ? null : [this.messageDate];

      if(this.claimedByFilter !== '') {
        this.headerSearchParams.reviewer = this.claimedByFilter;
      }

      if(this.statusSelectFilter !== null && this.statusSelectFilter !== '' && this.statusSelectFilter !== undefined) {
        this.headerSearchParams.secureExchangeStatusCode = [this.statusSelectFilter];
      }

      ApiService.apiAxios.get(Routes.edx.EXCHANGE_URL, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort,
          searchParams: omitBy(this.headerSearchParams, isEmpty),
        }
      }).then(response => {
        this.exchanges = response.data.content;
        if(this.isActiveMessagesTabEnabled){
          this.totalRequests = response.data.totalElements;
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get a list of Secure Exchanges. Please try again later.');
      }).finally(() => {
        this.loadingTableCount -= 1;
      });
    },
    backButtonClick() {
      router.push({name: 'home'});
    },
    openExchange(exchangeID) {
      router.push({name: 'viewExchange', params: {secureExchangeID: exchangeID, ministryOwnershipGroupRoleID: this.ministryOwnershipGroupRoleID, ministryOwnershipTeamName: this.ministryTeamName}});
    }
  },
  watch: {
    pageSize() {
      this.getExchanges();
    },
    pageNumber() {
      this.getExchanges();
    }
  }
};
</script>

<style scoped>

.tableRow {
  cursor: pointer;
}

.v-expansion-panel-header:not(.v-expansion-panel-header--mousedown):focus::before {
  display: none;
}

.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.unread {
  font-weight: bold;
}

.v-data-table >>> .v-data-table__wrapper {
  overflow-x: hidden;
}

.v-btn {
  text-transform: none;
}

.filterButton.v-btn--outlined {
  border: thin solid #ebedef;
}

.v-radio >>> .v-icon {
  color: #003366;
}

.activeRadio {
  color: #003366;
}
.subjectHeading{
  font-size: large;
  cursor: pointer;
  font-weight: bold;
}

.statusCodeLabel{
  font-size: medium;
  white-space: nowrap;
}

>>>.v-data-table-header{
  height: 0 !important;
}

>>>.v-data-table-header > tr{
  height: 0 !important;
}

>>>.v-data-table-header > tr > th{
  height: 0 !important;
}

.ministryLine{
  color: black;
  font-size: medium;
}

@media screen and (max-width: 801px){
  .subjectHeading {
    font-size: larger;
  }

  .statusCodeLabel{
    font-size: medium;
  }

  .ministryLine{
    font-size: inherit;
  }
}

@media screen and (max-width: 1401px){
  .statusCodeLabel{
    font-size: medium;
  }
}


.containerSetup{
  padding-right: 32em !important;
  padding-left: 32em !important;
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
