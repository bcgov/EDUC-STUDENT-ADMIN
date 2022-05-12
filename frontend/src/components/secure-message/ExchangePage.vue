<template>
  <v-container fluid>
    <v-row class="pt-0" :class="{'mr-0 ml-0': $vuetify.breakpoint.smAndDown, 'mr-3 ml-3': $vuetify.breakpoint.mdAndUp}">
      <v-col class="pt-0">
        <v-row class='d-flex justify-end pb-2'>
          <v-col class='d-flex justify-end'>
            <PrimaryButton
              :large-icon=true
              icon="mdi-plus"
              id="newMessageBtn"
              text="New Message"
              to="newExchange"
            ></PrimaryButton>
          </v-col>
        </v-row>
        <v-expansion-panels flat style="border-radius: 6px">
          <v-expansion-panel @click="onExpansionPanelClick" style="background: #ebedef">
            <v-expansion-panel-header class="pt-0 pb-0" disable-icon-rotate>
              <v-radio-group
                @click.native.stop
                color="#003366"
                v-model="statusRadioGroup"
                :disabled="!statusRadioGroupEnabled"
                row
                class="pt-0 pb-0 mt-0 mb-0"
              >
                <v-radio class="mt-2 radio-blue-text"
                         label="Active Only"
                         color="#003366"
                         value="statusFilterActive"
                         @click.native="statusFilterActiveClicked"
                ><template v-slot:label>
                  <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">Active Only</span>
                </template></v-radio>
                <v-radio class="mt-2 radio-blue-text"
                         label="All"
                         color="#003366"
                         value="statusFilterAll"
                         @click.native="statusFilterAllClicked"
                ><template v-slot:label>
                  <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">All</span>
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
                <v-col cols="12" md="4">
                  <v-text-field
                    class="pt-0 mt-0"
                    v-model="subjectFilter"
                    label="Subject"
                    prepend-inner-icon="mdi-book-open-variant"
                    clearable
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4" :class="{'pl-12 pr-12': $vuetify.breakpoint.mdAndUp}">
                  <v-menu
                    ref="messageDateFilter"
                    v-model="messageDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
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
                <v-col cols="12" md="4">
                  <v-select
                    v-model="statusSelectFilter"
                    :items="secureExchangeStatusCodes"
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
              </v-row>
              <v-row no-gutters class="justify-end mt-n2">
                <v-col cols="12" class="d-flex justify-end">
                  <PrimaryButton class="mr-3" id="search-clear" :secondary="true" @click.native="clearSearch"
                                 text="Clear"></PrimaryButton>
                  <PrimaryButton @click.native="getRequests" :loading="loadingTable" :disabled="!searchEnabled" text="Search"></PrimaryButton>
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
              :items="requests"
              :loading="loadingTable"
              :server-items-length="totalRequests"
              class="elevation-1"
              hide-default-header
              mobile-breakpoint="0"
            >

              <template v-slot:item.secureExchangeStatusCode="{ item }">
                <v-row>
                  <v-col cols="7" md="10" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="12" class="pb-2 pt-2 pr-0">
                        <h3 class="subjectHeading">{{ getSubject(item.subject) }}</h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pb-1 pr-0">
                        <span class="ministryLine">{{ getMinistryTeamName(item.ministryOwnershipTeamID) }} - {{ item.createDate }}</span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pt-0 pb-1 pr-0">
                        <span style="color: gray">{{ getLatestComment(item) }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="5" md="2" style="text-align: end" class="pb-0 pt-0">
                    <v-row class="mb-n4">
                      <v-col cols="12" class="pb-1">
                        <v-icon class="pb-1" :color="getStatusColor(item.secureExchangeStatusCode)" right dark>mdi-circle-medium</v-icon>
                        <span class="statusCodeLabel">{{ item.secureExchangeStatusCode }}</span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pb-2">
                        <v-icon style="margin-bottom: 0.15em" color="grey darken-3" right size="medium" dark>mdi-pound</v-icon>
                        <span class="statusCodeLabel">{{ item.sequenceNumber }}</span>
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
  </v-container>
</template>


<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import {mapState} from 'vuex';
import {isEmpty, omitBy} from 'lodash';

export default {
  name: 'ExchangeInbox',
  props: {
    ministryOwnershipGroupRoleID: {
      type: String,
      required: false,
      default: 'PEN_TEAM_ROLE'
    },
  },
  components: {
    PrimaryButton,
  },
  data() {
    return {
      statusSelectFilter: null,
      statusRadioGroup: 'statusFilterActive',
      statusRadioGroupEnabled: true,
      messageDateFilter: false,
      activeMessageDatePicker: null,
      messageDate: null,
      subjectFilter: '',
      filterText: 'More Filters',
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
      pageSize: 25,
      totalRequests: 0,
      itemsPerPageOptions: [10],
      loadingTable: false,
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
      requests: [],
      isActiveMessagesTabEnabled: true,
    };
  },
  computed: {
    ...mapState('edx', ['statuses']),
    ...mapState('edx', ['ministryTeams']),
    secureExchangeStatusCodes(){
      return this.statuses;
    },
    searchEnabled(){
      return (this.subjectFilter !== '' && this.subjectFilter !== null) || this.messageDate !== null || this.secureExchangeStatusCodes.some(item => item.secureExchangeStatusCode === this.statusSelectFilter);
    },
  },
  created() {
    this.$store.dispatch('edx/getCodes');
    this.$store.dispatch('edx/getMinistryTeams').then(() => {
      this.getRequests();
    });
    this.headerSearchParams.secureExchangeStatusCode = ['NEW', 'INPROG'];
  },
  methods: {
    getMinistryTeamName(ministryOwnershipTeamId){
      return this.ministryTeams.find(item => item.ministryOwnershipTeamId === ministryOwnershipTeamId).teamName;
    },
    getMinistryTeamIDByGroupRoleID(groupRoleID) {
      return this.ministryTeams.find(item => item.groupRoleIdentifier === groupRoleID).ministryOwnershipTeamId;
    },
    setFilterStatusAll(){
      this.headerSearchParams.secureExchangeStatusCode = ['NEW', 'INPROG','COMPLETE'];
    },
    setFilterStatusActive(){
      this.headerSearchParams.secureExchangeStatusCode = ['NEW', 'INPROG'];
    },
    statusFilterActiveClicked(){
      this.setFilterStatusActive();
      this.getRequests();
    },
    statusFilterAllClicked(){
      this.setFilterStatusAll();
      this.getRequests();
    },
    clearSearch(runSearch = true){
      this.subjectFilter = '';
      this.messageDate = null;
      this.messageDateFilter = null;
      this.statusSelectFilter = '';
      if(runSearch){
        this.setFilterStatusAll();
        this.getRequests();
      }
    },
    onExpansionPanelClick(event) {
      if(event.currentTarget.classList.contains('v-expansion-panel-header--active')) {
        this.filterText = 'More Filters';
        this.statusRadioGroupEnabled = true;
        this.statusRadioGroup = 'statusFilterActive';
        this.setFilterStatusActive();
        this.clearSearch(false);
        this.getRequests();
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
      if(status === 'New') {
        return 'blue';
      } else if(status === 'In Progress') {
        return 'yellow darken-2';
      } else if(status === 'Complete') {
        return 'green';
      }
    },
    getSubject(subject){
      if(subject.length > 16){
        switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return this.getContentString(subject, 16);
        case 'md':
          return this.getContentString(subject, 40);
        case 'lg':
          return this.getContentString(subject, 75);
        default:
          return this.getContentString(subject, 120);
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
      var content = item.commentsList.reduce((a, b) => (a.createDate > b.createDate ? a : b)).content;
      if(content.length > 25){
        switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return this.getContentString(content, 25);
        case 'md':
          return this.getContentString(content, 100);
        case 'lg':
          return this.getContentString(content, 130);
        case 'xl':
          return this.getContentString(content, 220);
        default:
          return content;
        }
      }
      return content;
    },
    getCompletedMessages() {
      this.headerSearchParams.secureExchangeStatusCode = ['COMPLETE'];
      this.isActiveMessagesTabEnabled = false;
      this.getRequests();
    },
    getRequests() {
      this.loadingTable = true;
      this.requests = [];
      const sort = {
        isReadByExchangeContact: 'ASC',
        createDate: 'ASC'
      };

      this.headerSearchParams.subject = this.subjectFilter;
      this.headerSearchParams.ministryOwnershipTeamID = this.getMinistryTeamIDByGroupRoleID(this.ministryOwnershipGroupRoleID);
      this.headerSearchParams.createDate = this.messageDate === null ? null : [this.messageDate];

      if(this.statusSelectFilter !== null && this.statusSelectFilter !== '') {
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
        this.requests = response.data.content;
        if(this.isActiveMessagesTabEnabled){
          this.totalRequests = response.data.totalElements;
        }
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });
    },
    getActiveMessages() {
      this.headerSearchParams.secureExchangeStatusCode = ['NEW', 'INPROG'];
      this.isActiveMessagesTabEnabled = true;
      this.getRequests();
    }
  },
  watch: {
    pageSize() {
      this.getRequests();
    },
    pageNumber() {
      this.getRequests();
    }
  }
};
</script>

<style scoped>

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
  border: thin solid #ebedef;
}

.v-radio >>> .v-icon {
  color: #003366;
}

.activeRadio {
  color: #003366;
}
.subjectHeading{
  font-size: x-large;
}

.statusCodeLabel{
  font-size: large;
}

.ministryLine{
  color: black;
  font-size: large;
}

@media screen and (max-width: 801px){
  .subjectHeading {
    font-size: larger;
  }

  .statusCodeLabel{
    font-size: inherit;
  }

  .ministryLine{
    font-size: inherit;
  }
}

</style>
