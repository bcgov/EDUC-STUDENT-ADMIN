<template>
  <v-row>
    <v-col cols='2'>
      <v-expansion-panels :value="0">
        <v-expansion-panel>
          <v-expansion-panel-header> PEN Team</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-list dense>
              <v-list-item-group v-model="selectedItem" color="primary">
                <v-list-item v-on:click="clickShowMessageType('messages')">
                  <v-list-item-content>Messages</v-list-item-content>
                  <v-list-item-avatar>1</v-list-item-avatar>
                </v-list-item>
                <v-list-item v-on:click="clickShowMessageType('unclaimed')">
                  <v-list-item-content>Unclaimed Messages</v-list-item-content>
                </v-list-item>
                <v-list-item v-on:click="clickShowMessageType('mine')">
                  <v-list-item-content>My Messages</v-list-item-content>
                </v-list-item>
                <v-list-item v-on:click="clickShowMessageType('completed')">
                  <v-list-item-content>Completed Messages</v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
    <v-col>
      <v-row class='d-flex justify-end pb-2'>
        <PrimaryButton
          id="newMessageBtn"
          text="New Message"
          to="newExchange"
        ></PrimaryButton>
      </v-row>
      <v-data-table
          :headers="headers"
          :items-per-page.sync="pageSize"
          :page.sync="pageNumber"
          :footer-props="{
              'items-per-page-options': itemsPerPageOptions
            }"
          :items="requests"
          :loading="loadingTable"
          :server-items-length="totalRequests"
      >
        <template v-slot:header.sequenceNumber="{ header }">
          <th
              id="sequence-number-header"
          >
            {{ header.text }}
          </th>
          <v-text-field
              id="sequence-number-text-field"
              v-model.trim="searchParams.sequenceNumber"
              class="header-text"
              outlined
              dense
              clearable
          ></v-text-field>
        </template>
        <template v-slot:header.contact="{ header }">
          <th
              id="contact-header"
          >
            {{ header.text }}
          </th>
          <v-autocomplete
              id='contact-text-field'
              v-model="searchParams.contactIdentifier"
              :items="contacts"
              dense
              clearable
              outlined
          />
        </template>
        <template v-slot:header.subject="{ header }">
          <th
              id="subject-header"
          >
            {{ header.text }}
          </th>
          <v-text-field
              id="subject-text-field"
              v-model.trim="searchParams.subject"
              class="header-text"
              outlined
              dense
              clearable
          ></v-text-field>
        </template>
        <template v-slot:header.createDate="{ header }">
          <th
              id="create-date-header"
          >
            {{ header.text }}
          </th>
          <v-menu
              ref="dateMenu"
              v-model="dateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                  id="date-picker-text-field"
                  :value="searchParams.createDate? searchParams.createDate.join(): ''"
                  outlined
                  dense
                  readonly
                  v-on="on"
                  @click:clear="searchParams.createDate = []"
                  clearable
                  class="header-text"
              ></v-text-field>
            </template>
            <v-date-picker
                id="date-picker"
                v-model="searchParams.createDate"
                no-title
                range
            >
              <v-spacer></v-spacer>
              <PrimaryButton id="date-picker-ok-button" text="OK"
                             @click.native="dateMenu=false"></PrimaryButton>
            </v-date-picker>
          </v-menu>
        </template>
        <template v-slot:header.secureExchangeStatusCode="{ header }">
          <th
              id="status-header"
          >
            {{ header.text }}
          </th>
          <v-select
              id="status-text-field"
              v-model="searchParams.secureExchangeStatusCode"
              :items="statuses"
              item-text='secureExchangeStatusCode'
              item-value='secureExchangeStatusCode'
              class="header-text"
              outlined
              dense
              clearable
          >
          </v-select>
        </template>
        <template v-slot:header.reviewer="{ header }">
          <th v-if="header.text !== 'unclaimed'"
              id="reviewer-header"
          >
            {{ header.text }}
          </th>
          <v-text-field
              id="reviewer-text-field"
              v-model.trim="searchParams.reviewer"
              class="header-text"
              outlined
              dense
              clearable
          ></v-text-field>
        </template>
        <template v-slot:no-data>There are no messages.</template>
        <template v-slot:item="{ item, index }">
          <tr v-on:click="clickViewMessageDetails(item)"
              :key="index"
              :class="[{'unread': item.isReadByMinistry === 'N'}, 'tableRow']">
            <td>{{ item.sequenceNumber }}</td>
            <td>{{ getContactName(item)}}</td>
            <td>{{ item.subject }}</td>
            <td>{{
                item.createDate ? moment(item.createDate).format('YYYY/MM/DD') : ''
              }}
            </td>
            <td>{{ item.secureExchangeStatusCode }}</td>

            <td v-if="item.reviewer">{{ item.reviewer }}</td>
            <td v-else>
              <primary-button v-on:click.native.stop="claim">Claim</primary-button>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import {mapState,mapMutations} from 'vuex';
import ApiService from '../common/apiService';
import {Routes} from '@/utils/constants';
import router from '../router';
import {omitBy, isEmpty, debounce} from 'lodash';

import PrimaryButton from './util/PrimaryButton';
import getSecureExchangeContactMixin from '@/mixins/getSecureExchangeContactMixin';

export default {
  name: 'ExchangePage',
  components: {
    PrimaryButton,
  },
  mixins: [getSecureExchangeContactMixin],
  data() {
    return {
      initialLoad: true,
      selectedItem: 0,
      totalRequests: 0,
      searchParams: {
        sequenceNumber: '',
        contact: '',
        subject: '',
        createDate: [],
        secureExchangeStatusCode: '',
        reviewer: ''
      },
      itemsPerPageOptions: [10, 15, 25, 50, 100],
      loadingTable: false,
      dateMenu: false,
      requests: [],
    };
  },
  computed: {
    ...mapState({
      userName: state => state.auth.userInfo.userName
    }),
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['statuses', 'exchangeSearchParams', 'pageSize', 'pageNumber', 'ministryTeams']),
    ...mapState('app', ['mincodeSchoolNames']),
    contacts() {
      //creates the text and value items for the contacts search dropdown.
      const schoolNames = _.sortBy(Array.from(this.mincodeSchoolNames.entries()).map(school => ({ text: `${school[1]} (${school[0]})`, value: school[0]})), ['text']);
      const ministryNames = this.ministryTeams.map(ministryTeam => ({text: `${ministryTeam.teamName} Team`, value: ministryTeam.ministryOwnershipTeamId}));
      return [...ministryNames, ...schoolNames];
    },
    headers() {
      return [
        {
          text: 'Id',
          value: 'sequenceNumber',
          sortable: false
        },
        {
          text: 'Contact',
          value: 'contact',
          sortable: false
        },
        {
          text: 'Subject',
          value: 'subject',
          sortable: false
        },
        {
          text: 'Date',
          value: 'createDate',
          sortable: false
        },
        {
          text: 'Status',
          value: 'secureExchangeStatusCode',
          sortable: false
        },
        {
          text: 'Claimed By',
          value: 'reviewer',
          sortable: false
        }
      ];
    },
    pageNumber: {
      get() {
        return this.$store.state.edx.pageNumber;
      },
      set(page) {
        this.setPageNumber(page);
      }
    },
    pageSize: {
      get() {
        return this.$store.state.edx.pageSize;
      },
      set(pageSize) {
        this.setPageSize(pageSize);
      }
    },
  },
  created() {
    this.searchParams = {...this.exchangeSearchParams};
    this.getRequestsWithDebounce();
  },
  methods: {
    ...mapMutations('edx', ['setPageNumber', 'setPageSize', 'setExchangeSearchParams']),
    claim() {
      console.log(this.userName + ' would like to claim');
      alert(`claim as ${this.userName}?`);
    },
    clickViewMessageDetails(message) {
      router.push({ name: 'viewExchange', params: {secureExchangeID: message.secureExchangeID}});
    },
    clickShowMessageType(messageType) {
      //mocked function that will send a get request for the message inbox items
      console.log('showing ' + messageType);
      this.getRequests();
    },
    getRequests() {
      this.loadingTable = true;
      this.requests = [];
      const sort = {
        isReadByMinistry: 'ASC',
        createDate: 'ASC'
      };

      ApiService.apiAxios.get(Routes.edx.EXCHANGE_URL, {params: {pageNumber: this.pageNumber - 1, pageSize: this.pageSize, sort, searchParams: omitBy(this.searchParams, isEmpty) }})
        .then(response => {
          this.requests = response.data.content;
          this.totalRequests = response.data.totalElements;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.loadingTable = false;
          this.initialLoad = false;
        });
    },
    getRequestsWithDebounce: debounce(function() {this.getRequests();}, 1000),
  },
  watch: {
    pageSize: {
      handler() {
        this.getRequestsWithDebounce();
      }

    },
    pageNumber: {
      handler() {
        this.getRequestsWithDebounce();
      }
    },
    searchParams: {
      handler(updatedSearchParams) {
        if (!this.initialLoad) {
          this.setPageNumber(1);
        }

        this.setExchangeSearchParams(updatedSearchParams);
        this.getRequestsWithDebounce();
      },
      deep: true
    },
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

</style>
