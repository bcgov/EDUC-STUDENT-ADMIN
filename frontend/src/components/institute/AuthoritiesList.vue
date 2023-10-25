<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <Spinner
      v-if="loadingAuthorities"
      flat
    />
    <div v-else>
      <v-row>
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
          >Return to Dashboard</a>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton
            v-if="canAddAuthority()"
            id="addAuthorityBtn"
            icon-left
            width="12em"
            icon="mdi-plus-thick"
            text="New Authority"
            @click-action="openNewAuthoritySheet"
          />
        </v-col>
      </v-row>
      <v-row
        style="background: rgb(235, 237, 239);border-radius: 8px;"
        class="px-3 elevation-2"
      >
        <v-col>
          <v-row>
            <v-col
              cols="5"
              class="d-flex justify-start"
            >
              <v-autocomplete
                id="authority-text-field"
                v-model="authorityCodeNameFilter"
                label="Authority Code & Name"
                item-value="authorityID"
                item-title="authorityCodeName"
                variant="underlined"
                :items="authoritySearchNames"
                :menu-props="{closeOnContentClick:true}"
                clearable
                @update:model-value="searchButtonClick"
              >
                <template #selection="{ item, index }">
                  {{
                    item.raw.authorityCodeName
                  }}
                </template>
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    prepend-icon="mdi-circle-medium"
                    :base-color="getStatusColorAuthorityOrSchool(item.raw.status)"
                    title=""
                  >
                    <v-list-item-title style="color: black !important;">
                      {{
                        item.raw.authorityCodeName
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col class="d-flex justify-start">
              <v-select
                id="status-select-field"
                v-model="authorityStatusFilter"
                clearable
                :items="authorityStatus"
                item-title="name"
                variant="underlined"
                item-value="code"
                :menu-props="{closeOnContentClick:true}"
                label="Status"
              >
                <template #selection="{ item, index }">
                  {{
                    item.raw.name
                  }}
                </template>
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    prepend-icon="mdi-circle-medium"
                    :base-color="getStatusColorAuthorityOrSchool(item.raw.code)"
                    title=""
                  >
                    <v-list-item-title style="color: black !important;">
                      {{
                        item.raw.name
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col class="d-flex justify-start">
              <v-select
                id="authoritytype-select-field"
                v-model="authorityTypeFilter"
                clearable
                variant="underlined"
                :items="authorityTypes"
                item-title="label"
                item-value="authorityTypeCode"
                label="Authority Type"
              />
            </v-col>
            <v-col class="d-flex justify-end mt-5">
              <PrimaryButton
                id="user-clear-button"
                text="Clear"
                secondary
                @click-action="clearButtonClick"
              />
              <PrimaryButton
                id="user-search-button"
                class="ml-3"
                text="Search"
                :disabled="!searchEnabled()"
                @click-action="searchButtonClick"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="px-0">
          <v-data-table-server
            id="schoolListTable"
            v-model:items-per-page="pageSize"
            v-model:page="pageNumber"
            v-model:items="authorities"
            v-model:items-length="totalAuthorities"
            :loading="loadingTable"
            class="elevation-1 rounded"
            hide-default-header
            mobile-breakpoint="0"
          >
            <template #item="{ item }">
              <v-row
                id="authorityDetailsSelect"
                no-gutters
                align="center"
                class="hoverTable px-2"
                justify="center"
                style="cursor: pointer;"
                @click="openAuthority(item.raw.independentAuthorityId)"
              >
                <v-col
                  cols="7"
                  class="pb-0 pt-0"
                >
                  <v-row no-gutters>
                    <v-col class="pt-2 pr-0">
                      <span class="subjectHeading">{{
                        item.raw.authorityNumber
                      }} - {{
                        item.raw.displayName
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="pb-2 pr-0">
                      <span
                        class="ministryLine"
                        style="color: black"
                      >{{
                        item.raw.type
                      }}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col class="d-flex justify-start">
                  <v-icon
                    class="ml-0"
                    :color="getStatusColorAuthorityOrSchool(item.raw.status)"
                    right
                    dark
                  >
                    mdi-circle-medium
                  </v-icon>
                  <span class="ml-0 statusCodeLabel">{{
                    item.raw.status
                  }}</span>
                </v-col>
                <v-col
                  cols="2"
                  class="d-flex justify-start"
                >
                  <v-icon aria-hidden="false">
                    mdi-phone-outline
                  </v-icon>
                  <span class="statusCodeLabel"> {{
                    formatPhoneNumber(item.raw.phoneNumber)
                  }}</span>
                </v-col>
              </v-row>
              <v-divider />
            </template>

            <template #no-data>
              There are no authorities.
            </template>
          </v-data-table-server>
        </v-col>
      </v-row>
    </div>
    <!--    new authority sheet -->
    <v-bottom-sheet
      v-model="newAuthoritySheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <NewAuthorityPage
        v-if="newAuthoritySheet"
        @newAuthority:closeNewAuthorityPage="newAuthoritySheet = !newAuthoritySheet"
        @newAuthority:addNewAuthority="newAuthorityAdded"
      />
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import Spinner from '@/components/common/Spinner.vue';
import {mapState} from 'pinia';
import {isEmpty, omitBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber} from '@/utils/format';
import {getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool} from '@/utils/institute/status';
import router from '@/router';
import NewAuthorityPage from './NewAuthorityPage.vue';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';

export default {
  name: 'AuthoritiesListPage',
  components: {
    PrimaryButton, Spinner, NewAuthorityPage
  },
  mixins: [alertMixin],
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
      authorityCodeNameFilter: null,
      authorityStatusFilter: 'Open',
      authorityTypeFilter: null,
      authorityTypes: [],
      loadingAuthorities: true,
      newAuthoritySheet: false,
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo', 'INDEPENDENT_AUTHORITY_ADMIN_ROLE', 'OFFSHORE_SCHOOLS_ADMIN_ROLE']),
    ...mapState(instituteStore, ['authorityTypeCodes']),

    getSheetWidth() {
      return 30;
    },
  },
  watch: {
    pageSize() {
      this.getAuthorityList();
    },
    pageNumber() {
      this.getAuthorityList();
    }
  },
  created() {
    instituteStore().getAllAuthorityTypeCodes().then(() => {
      this.authorityTypes = this.authorityTypeCodes;
    });

    this.setAuthorityStatuses();
    this.getAuthorityDropDownItems();
    this.getAuthorityList();
  },
  methods: {
    setAuthorityStatuses() {
      this.authorityStatus = [{name: 'Open', code: 'Open'}, {name: 'Closing', code: 'Closing'}, {
        name: 'Closed',
        code: 'Closed'
      }];
    },
    getAuthorityDropDownItems() {
      this.loadingAuthorities = true;
      ApiService.getAuthorities().then((response) => {
        let authorityList = response.data;
        for (const authority of authorityList) {
          let authorityItem = {
            authorityCodeName: authority.authorityNumber + ' - ' + authority.name,
            authorityNumber: authority.authorityNumber,
            authorityID: authority.authorityID,
            status: getStatusAuthorityOrSchool(authority)
          };
          this.authoritySearchNames.push(authorityItem);
        }
        this.authoritySearchNames = this.authoritySearchNames.sort(function (a, b) {
          let numA = parseInt(a.authorityNumber);
          let numB = parseInt(b.authorityNumber);
          if (numA > numB) {
            return 1;
          } else if (numA < numB) {
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

      if (this.authorityCodeNameFilter !== null && this.authorityCodeNameFilter !== '') {
        this.headerSearchParams.authorityID = this.authorityCodeNameFilter;
      } else {
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
        for (const authority of authorityList) {
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
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      authority.type = this.getAuthorityType(authority);
    },
    getAuthorityType(authority) {
      return this.authorityTypes.find((auth) => auth.authorityTypeCode === authority.authorityTypeCode).label;
    },
    formatPhoneNumber,
    getStatusColorAuthorityOrSchool,
    openAuthority(authorityId) {
      this.$router.push({name: 'authorityDetails', params: {authorityID: authorityId}});
    },
    openAuthorityContacts(authorityId) {
      this.$router.push({name: 'authorityContacts', params: {authorityID: authorityId}});
    },
    resetPageNumber() {
      this.pageNumber = 1;
    },
    searchEnabled() {
      return (this.authorityStatusFilter !== '' && this.authorityStatusFilter !== null)
        || (this.authorityTypeFilter !== '' && this.authorityTypeFilter !== null)
        || (this.authorityCodeNameFilter !== '' && this.authorityCodeNameFilter !== null);
    },
    backButtonClick() {
      router.push({name: 'home'});
    },
    openNewAuthoritySheet() {
      this.newAuthoritySheet = !this.newAuthoritySheet;
    },
    clearButtonClick() {
      this.authorityCodeNameFilter = null;
      this.authorityStatusFilter = null;
      this.authorityTypeFilter = null;

      this.headerSearchParams.authorityID = null;
      this.headerSearchParams.status = null;
      this.headerSearchParams.type = null;

      this.getAuthorityList();
    },
    searchButtonClick() {
      this.resetPageNumber();
      this.getAuthorityList();
    },
    canAddAuthority() {
      return this.INDEPENDENT_AUTHORITY_ADMIN_ROLE || this.OFFSHORE_SCHOOLS_ADMIN_ROLE;
    },
    newAuthorityAdded() {
      this.newAuthoritySheet = !this.newAuthoritySheet;
      this.getAuthorityList();
    },
  }
};
</script>

<style scoped>

.sheetHeader {
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

.hoverTable:hover {
    background-color: #e8e8e8;
    cursor: pointer;
}

.containerSetup {
    padding-right: 30em !important;
    padding-left: 30em !important;
}

:deep(.v-list-item__prepend){
    margin-right: -2em;
}

:deep(.v-data-table-footer__items-per-page) {
  display: none;
}
</style>
