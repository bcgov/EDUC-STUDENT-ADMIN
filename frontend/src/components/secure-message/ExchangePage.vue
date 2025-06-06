<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row class="pt-0">
      <v-col class="pt-0">
        <v-row
          no-gutters
          class="pt-2 d-flex justify-end"
        >
          <v-col class="d-flex justify-start">
            <h1 id="ministryTeamInboxTitle">
              {{ ministryTeamName }} Inbox
            </h1>
          </v-col>
        </v-row>
        <v-row class="pt-0 mb-0">
          <v-col class="d-flex justify-end">
            <PrimaryButton
              id="claimBTN"
              :icon-left="true"
              :large-icon="true"
              icon="mdi-account-check-outline"
              text="Claim"
              class="mr-2"
              :disabled="isClaimDisabled"
              @click-action="claimExchanges"
            />
            <PrimaryButton
              id="newMessageBtn"
              :icon-left="true"
              :large-icon="true"
              icon="mdi-plus"
              text="New Message"
              @click-action="openNewMessageSheet"
            />
          </v-col>
        </v-row>
        <v-expansion-panels
          flat
          style="border-radius: 6px"
        >
          <v-expansion-panel
            style="background: #ebedef;"
          >
            <v-expansion-panel-title
              color="#ebedef"
              class="pt-0 pb-0"
              disable-icon-rotate
              @click.prevent.stop="onExpansionPanelClick"
            >
              <v-radio-group
                id="radioPanel"
                v-model="statusRadioGroup"
                color="#003366"
                :disabled="!statusRadioGroupEnabled"
                direction="horizontal"
                inline
                hide-details="auto"
                class="pt-1 pb-3 mb-0"
              >
                <v-radio
                  class="mt-2 radio-blue-text"
                  label="My Active Messages"
                  color="#003366"
                  value="statusFilterActive"
                  @click.prevent.stop="statusFilterActiveClicked"
                >
                  <template #label>
                    <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">My Active Messages</span>
                  </template>
                </v-radio>
                <v-radio
                  class="mt-2 radio-blue-text"
                  label="All Active Messages"
                  color="#003366"
                  value="statusFilterAllActive"
                  @click.prevent.stop="statusFilterAllActiveClicked"
                >
                  <template #label>
                    <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">All Active Messages</span>
                  </template>
                </v-radio>
                <v-radio
                  class="mt-2 radio-blue-text"
                  label="All Active Messages"
                  color="#003366"
                  value="statusFilterAll"
                  @click.prevent.stop="filterExchanges"
                >
                  <template #label>
                    <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">All Messages</span>
                  </template>
                </v-radio>
                <v-radio
                  class="mt-2 radio-blue-text"
                  label="All Unclaimed Messages"
                  color="#003366"
                  value="statusFilterAllUnclaimed"
                  @click.prevent.stop="statusFilterUnclaimedClicked"
                >
                  <template #label>
                    <span :class="{ 'activeRadio' : statusRadioGroupEnabled }">All Unclaimed Messages</span>
                  </template>
                </v-radio>
              </v-radio-group>
              <template #actions>
                <v-btn
                  id="filterid"
                  title="filter"
                  color="#003366"
                  variant="text"
                  class="mt-0 pt-0 filterButton"
                >
                  <v-icon
                    color="#003366"
                    class="ml-n1"
                    :nudge-down="4"
                    right
                    dark
                  >
                    mdi-filter-outline
                  </v-icon>
                  <span class="ml-1">{{ filterText }}</span>
                </v-btn>
              </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row class="mt-3">
                <v-col
                  cols="12"
                  md="4"
                  class="pt-0 px-7"
                >
                  <v-autocomplete
                    id="schoolName"
                    v-model="contactNameFilter"
                    label="Contact"
                    class="pt-0 mt-0"
                    item-value="value"
                    item-title="text"
                    variant="underlined"
                    prepend-inner-icon="mdi-card-account-mail-outline"
                    :clearable="true"
                    :items="contacts"
                  >
                    <template #selection="{ item }">
                      <span> {{ item.title }} </span>
                    </template>
                    <template #item="{props, item}">
                      <v-list-item
                        v-bind="props"
                        :prepend-icon="item.raw.districtNumber ? 'mdi-domain' : 'mdi-school'"
                      />
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                  class="pt-0 px-7"
                >
                  <v-text-field
                    id="subject-text-field"
                    v-model="subjectFilter"
                    class="pt-0 mt-0"
                    variant="underlined"
                    label="Subject"
                    prepend-inner-icon="mdi-book-open-variant"
                    clearable
                    @keyup.enter="enterPushed()"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                  class="pt-0 px-7"
                >
                  <DatePicker
                    id="messageDateTextField"
                    v-model="messageDate"
                    label="Message Date"
                    model-type="yyyy-MM-dd'T'00:00:00"
                    @keyup.enter="enterPushed()"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                  class="pt-0 px-7"
                >
                  <v-select
                    id="statusSelector"
                    v-model="statusSelectFilter"
                    clearable
                    :items="secureExchangeStatusCodes"
                    item-title="label"
                    variant="underlined"
                    item-value="secureExchangeStatusCode"
                    class="pt-0 mt-0"
                    :menu-props="{closeOnContentClick:true}"
                    label="Status"
                  >
                    <template #prepend-inner>
                      <v-icon :color="getStatusColor(statusSelectFilter ? statusSelectFilter : '')">
                        mdi-circle-medium
                      </v-icon>
                    </template>
                    <template #selection="{ item }">
                      {{
                        item.raw.label
                      }}
                    </template>
                    <template #item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        prepend-icon="mdi-circle-medium"
                        :base-color="getStatusColor(item.raw.label)"
                        title=""
                      >
                        <v-list-item-title style="color: black !important;">
                          {{
                            item.raw.label
                          }}
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                  class="pt-0 px-7"
                >
                  <v-text-field
                    id="claimed-by-text-field"
                    v-model="claimedByFilter"
                    class="pt-0 mt-0"
                    label="Claimed By"
                    variant="underlined"
                    prepend-inner-icon="mdi-account-check-outline"
                    clearable
                    @keyup.enter="enterPushed()"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                  class="pt-0 px-7"
                >
                  <v-text-field
                    v-model="messageIDFilter"
                    class="pt-0 mt-0"
                    label="Message ID"
                    variant="underlined"
                    prepend-inner-icon="mdi-pound"
                    clearable
                    @keyup.enter="enterPushed()"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                  class="pt-0 px-7"
                >
                  <v-text-field
                    v-model="studentIDFilter"
                    class="pt-0 mt-0"
                    label="Student PEN"
                    variant="underlined"
                    prepend-inner-icon="mdi-account"
                    maxlength="9"
                    counter="9"
                    clearable
                    @keyup.enter="enterPushed()"
                  />
                </v-col>
              </v-row>
              <v-row
                no-gutters
                class="justify-end mt-n2"
              >
                <v-col
                  cols="12"
                  class="d-flex justify-end"
                >
                  <PrimaryButton
                    id="search-clear"
                    class="mr-3"
                    :secondary="true"
                    text="Clear"
                    @click-action="clearSearch"
                  />
                  <PrimaryButton
                    id="searchButton"
                    :loading="loadingTable"
                    :disabled="!searchEnabled"
                    text="Search"
                    @click-action="filterExchanges"
                  />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-row no-gutters>
          <v-col>
            <v-data-table-server
              v-model:items-per-page="pageSize"
              v-model:page="pageNumber"
              v-model:items="exchanges"
              v-model:items-length="totalRequests"
              :headers="headers"
              show-select
              item-value="secureExchangeID"
              select-strategy="page"
              :items-per-page-options="itemsPerPageOptions"
              :loading="loadingTable"
              class="elevation-1 mt-2 rounded"
              mobile-breakpoint="0"
            >
              <template #no-data>
                <v-row no-gutters>
                  <v-col class="d-flex justify-center">
                    There are no messages.
                  </v-col>
                </v-row>
              </template>
              <template #headers />
              <template #item="{ item }">
                <v-row
                  class="hoverTable pa-2"
                  no-gutters
                >
                  <v-col cols="auto">
                    <v-checkbox
                      v-model="selectedExchanges"
                      :value="item.raw"
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    @click="openExchange(item.raw.secureExchangeID)"
                  >
                    <v-row no-gutters>
                      <v-col
                        cols="12"
                      >
                        <span
                          class="subjectHeading"
                          :style="{color: item.raw.isReadByMinistry ? 'black': '#1f7cef'}"
                        >{{ getSubject(item.raw.subject) }}</span><span style="color: gray"> - {{ getLatestComment(item.raw) }}</span>
                        <v-icon
                          v-if="item?.raw?.documentList?.length > 0"
                          size="x-small"
                          class="mb-1"
                        >
                          mdi-paperclip
                        </v-icon>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col
                        cols="12"
                      >
                        <span class="ministryLine">{{ getContactLineItem(item.raw) }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col
                    style="text-align: end"
                    class="d-flex justify-end"
                    @click="openExchange(item.raw.secureExchangeID)"
                  >
                    <v-row
                      no-gutters
                      class="d-flex justify-end"
                    >
                      <v-col cols="2">
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-icon
                              right
                              size="medium"
                              dark
                            >
                              mdi-pound
                            </v-icon>
                          </v-col>
                          <v-col
                            class="statusCodeLabel"
                            cols="6"
                          >
                            <span>{{ item.raw.sequenceNumber }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col cols="2">
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-icon
                              class="pb-1"
                              :color="getStatusColor(item.raw.secureExchangeStatusCode)"
                              right
                              dark
                            >
                              mdi-circle-medium
                            </v-icon>
                          </v-col>
                          <v-col
                            class="statusCodeLabel"
                            cols="6"
                          >
                            <span>{{ item.raw.secureExchangeStatusCode }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col
                        cols="3"
                        class="pr-0"
                      >
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-icon
                              style="margin-bottom: 0.2em"
                              right
                              dark
                            >
                              mdi-account-outline
                            </v-icon>
                          </v-col>
                          <v-col
                            class="statusCodeLabel"
                            cols="6"
                          >
                            <span>{{ getReviewer(item.raw.reviewer) }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col
                        cols="3"
                        class="pl-0 pr-0"
                      >
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-icon
                              class="pr-1"
                              style="margin-bottom: 0.2em"
                              right
                              dark
                            >
                              mdi-clock-outline
                            </v-icon>
                          </v-col>
                          <v-col
                            class="statusCodeLabel"
                            cols="4"
                          >
                            <span>{{ getNumberOfDays(item.raw.createDate) }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-divider />
              </template>
            </v-data-table-server>
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
    >
      <v-card
        v-if="newMessageSheet"
        class="information-window-v-card"
      >
        <v-card-title class="sheetHeader pt-1 pb-1">
          New Message
        </v-card-title>
        <v-divider />
        <v-card-text>
          <NewMessagePage
            :ministry-ownership-group-role-i-d="ministryOwnershipGroupRoleID"
            @secure-exchange:message-sent="messageSent"
            @secure-exchange:cancel-message="newMessageSheet = false"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>


<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import NewMessagePage from './NewMessagePage.vue';
import {mapState} from 'pinia';
import router from '@/router';
import _, {isEmpty, omitBy} from 'lodash';
import {ChronoUnit, LocalDateTime} from '@js-joda/core';
import alertMixin from '@/mixins/alertMixin';
import {edxStore} from '@/store/modules/edx';
import {appStore} from '@/store/modules/app';
import {authStore} from '@/store/modules/auth';
import {notificationsStore} from '@/store/modules/notifications';
import DatePicker from '@/components/util/DatePicker.vue';
import {formatDate} from '@/utils/format';

export default {
  name: 'ExchangeInbox',
  components: {
    DatePicker,
    PrimaryButton,
    NewMessagePage
  },
  mixins: [alertMixin],
  props: {
    ministryOwnershipGroupRoleID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      newMessageSheet: false,
      statusSelectFilter: null,
      statusRadioGroup: 'statusFilterAllActive',
      statusRadioGroupEnabled: true,
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
      itemsPerPageOptions: [
        {value: 15, title: '15'},
        {value: 25, title: '25'},
        {value: 50, title: '50'}
      ],
      loadingTableCount: 0,
      headerSearchParams: {
        sequenceNumber: '',
        contact: '',
        subject: '',
        createDate: [],
        secureExchangeStatusCode: ''
      },
      exchanges: [],
      selectedExchanges: [],
      isActiveMessagesTabEnabled: true,
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['schoolMap', 'districtMap', 'mincodeSchoolNames']),
    ...mapState(edxStore, ['statuses', 'ministryTeams']),
    ...mapState(notificationsStore, ['notification']),
    secureExchangeStatusCodes() {
      return this.statuses;
    },
    isClaimDisabled() {
      let closedExchanges = this.selectedExchanges.find(exchange => exchange.secureExchangeStatusCode.toUpperCase() === 'CLOSED');
      return this.selectedExchanges.length === 0 || closedExchanges !== undefined;
    },
    searchEnabled() {
      return (this.claimedByFilter !== '' && this.claimedByFilter !== null)
        || (this.messageIDFilter !== '' && this.messageIDFilter !== null)
        || (this.studentIDFilter !== '' && this.studentIDFilter !== null)
        || (this.subjectFilter !== '' && this.subjectFilter !== null)
        || (this.contactNameFilter !== '' && this.contactNameFilter !== null && this.contactNameFilter !== undefined)
        || this.messageDate !== null
        || this.secureExchangeStatusCodes.some(item => item.secureExchangeStatusCode === this.statusSelectFilter);
    },
    contacts() {
      let school = _.sortBy(Array.from(this.schoolMap.entries()).map(school => ({
        text: `${school[1]?.schoolName} (${school[1]?.mincode})`,
        value: school[1]?.schoolID,
        mincode: school[1].mincode
      })), ['mincode']);
      let district = _.sortBy(Array.from(this.districtMap.entries()).map(district => ({
        text: `${district[1]?.name} (${district[1]?.districtNumber})`,
        value: district[1]?.districtId,
        districtNumber: district[1].districtNumber
      })), ['districtNumber']);
      return [...district, ...school];
    },
    myself() {
      return {name: this.userInfo.userName, id: this.userInfo.userGuid};
    },
    loadingTable() {
      return this.loadingTableCount !== 0;
    },
  },
  watch: {
    pageSize() {
      this.getExchanges();
    },
    pageNumber() {
      this.getExchanges();
    },
    notification(notificationData) {
      if (notificationData?.eventType === 'SEND_EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE' && notificationData?.eventOutcome === 'EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE_SENT') {
        this.getExchanges();
      }
    }
  },
  created() {
    appStore().getInstituteCodes();
    edxStore().getCodes();
    edxStore().getMinistryTeams().then(() => {
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
    messageSent() {
      this.newMessageSheet = !this.newMessageSheet;
    },
    getMinistryTeamNameByGroupRoleID() {
      this.ministryTeamName = this.ministryTeams.find(item => item.groupRoleIdentifier === this.ministryOwnershipGroupRoleID).teamName;
    },
    getNumberOfDays(start) {
      const start_date = new LocalDateTime.parse(start);
      const end_date = LocalDateTime.now();

      return ChronoUnit.DAYS.between(start_date, end_date) + ' days';
    },
    getSchoolName(schoolID) {
      return this.schoolMap.get(schoolID)?.schoolName;
    },
    getContactLineItem(item) {
      switch (item.secureExchangeContactTypeCode) {
      case 'SCHOOL':
        return `${this.schoolMap.get(item?.contactIdentifier)?.schoolName} (${this.schoolMap.get(item?.contactIdentifier)?.mincode}) - ${formatDate(item?.createDate)}`;
      case 'DISTRICT':
        return `${this.districtMap.get(item?.contactIdentifier)?.name} (${this.districtMap.get(item?.contactIdentifier)?.districtNumber}) - ${formatDate(item?.createDate)}`;
      }
    },
    getReviewer(reviewer) {
      if (!reviewer) return 'Unclaimed';
      return reviewer;
    },
    getMinistryTeamIDByGroupRoleID(groupRoleID) {
      return this.ministryTeams.find(item => item.groupRoleIdentifier === groupRoleID).ministryOwnershipTeamId;
    },
    setFilterStatusAllActive() {
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
      this.headerSearchParams.reviewer = '';
    },
    setFilterStatusAll() {
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN', 'CLOSED'];
      this.headerSearchParams.reviewer = '';
    },
    setFilterStatusActive() {
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
      this.headerSearchParams.reviewer = this.myself.name;
    },
    setFilterStatusUnclaimed() {
      this.headerSearchParams.secureExchangeStatusCode = ['OPEN'];
      this.headerSearchParams.reviewer = 'Unclaimed';
    },
    statusFilterActiveClicked() {
      this.setFilterStatusActive();
      this.resetPageNumber();
      this.getExchanges();
      this.statusRadioGroup = 'statusFilterActive';
    },
    statusFilterAllActiveClicked() {
      this.setFilterStatusAllActive();
      this.resetPageNumber();
      this.getExchanges();
      this.statusRadioGroup = 'statusFilterAllActive';
    },
    statusFilterUnclaimedClicked() {
      this.setFilterStatusUnclaimed();
      this.resetPageNumber();
      this.getExchanges();
      this.statusRadioGroup = 'statusFilterAllUnclaimed';
    },
    resetPageNumber() {
      this.pageNumber = 1;
    },
    openNewMessageSheet() {
      this.newMessageSheet = !this.newMessageSheet;
    },
    clearSearch(runSearch = true) {
      this.subjectFilter = null;
      this.messageIDFilter = null;
      this.studentIDFilter = null;
      this.claimedByFilter = null;
      this.contactNameFilter = null;
      this.messageDate = null;
      this.statusSelectFilter = null;
      if (runSearch) {
        this.resetPageNumber();
        this.setFilterStatusAll();
        this.getExchanges();
      }
    },
    onExpansionPanelClick() {
      if (this.filterText !== 'More Filters') {
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
        this.filterText = 'Fewer Filters';
        this.statusRadioGroupEnabled = false;
        this.clearSearch();
      }

    },
    getStatusColor(status) {
      if (status?.toLowerCase() === 'open') {
        return 'green';
      } else if (status?.toLowerCase() === 'closed') {
        return 'red';
      }
    },
    getSubject(subject) {
      if (subject.length > 16) {
        return this.getContentString(subject, 20);
      }
      return subject;
    },
    getContentString(content, length) {
      if (content.length > length) {
        return content.substring(0, length) + '...';
      }
      return content;
    },
    getLatestComment(item) {
      const content = item.commentsList.reduce((a, b) => (a.createDate > b.createDate ? a : b)).content;
      if (content.length > 25) {
        return this.getContentString(content, 40);
      }
      return content;
    },
    filterExchanges() {
      this.setFilterStatusAll();
      this.resetPageNumber();
      this.getExchanges();
      this.statusRadioGroup = 'statusFilterAll';
    },
    claimExchanges() {
      this.loadingTableCount += 1;
      const selected = this.selectedExchanges.map(({secureExchangeID}) => secureExchangeID);
      const payload = {
        secureExchangeIDs: selected,
      };
      const pluralExchanges = this.selectedExchanges.length != 1;
      ApiService.apiAxios.post(`${Routes['edx'].CLAIM_URL}`, payload)
        .then(() => {
          this.setSuccessAlert(`Secure ${
            pluralExchanges ? 'exchanges have' : 'exchange has'
          } been claimed successfully.`);
          this.getExchanges();
          this.selectedExchanges = [];
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(`An error occurred while claiming ${
            pluralExchanges ? 'exchanges' : 'exchange'
          }. Please try again later.`);})
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

      if (this.claimedByFilter !== '' && this.claimedByFilter !== null) {
        this.headerSearchParams.reviewer = this.claimedByFilter;
      }

      if (this.statusSelectFilter !== null && this.statusSelectFilter !== '' && this.statusSelectFilter !== undefined) {
        this.headerSearchParams.secureExchangeStatusCode = [this.statusSelectFilter];
      }

      ApiService.apiAxios.get(Routes.edx.EXCHANGE_URL, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort,
          searchParams: JSON.stringify(omitBy(this.headerSearchParams, isEmpty)),
        }
      }).then(response => {
        this.exchanges = response.data.content;
        if (this.isActiveMessagesTabEnabled) {
          this.totalRequests = response.data.totalElements;
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get a list of Secure Exchanges. Please try again later.');
      }).finally(() => {
        this.loadingTableCount -= 1;
      });
    },
    openExchange(exchangeID) {
      router.push({
        name: 'viewExchange',
        params: {
          secureExchangeID: exchangeID
        }
      });
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

.sheetHeader {
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

.subjectHeading {
    font-size: large;
    cursor: pointer;
    font-weight: bold;
}

.statusCodeLabel {
    font-size: medium;
    white-space: nowrap;
    text-align: left;
}

* >>> .v-data-table-header {
    height: 0 !important;
}

* >>> .v-data-table-header > tr {
    height: 0 !important;
}

* >>> .v-data-table-header > tr > th {
    height: 0 !important;
}

.ministryLine {
    color: black;
    font-size: medium;
}

.hoverTable:hover {
    background-color: #e8e8e8;
    cursor: pointer;
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

:deep(.dp__input) {
    display: none;
}

:deep(.dp__icon) {
    display: none;
}

</style>
