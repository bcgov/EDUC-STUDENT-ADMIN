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
        <NewMessageDialog :myTeam="myTeam" @send="getRequests"/>
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
        <template v-slot:header.contact="{ header }">
          <th
              id="contact-header"
          >
            {{ header.text }}
          </th>
          <v-text-field
              id="contact-text-field"
              v-model="headerSearchParams.contact"
              class="header-text"
              outlined
              dense
              clearable
          ></v-text-field>
        </template>
        <template v-slot:header.subject="{ header }">
          <th
              id="subject-header"
          >
            {{ header.text }}
          </th>
          <v-text-field
              id="subject-text-field"
              v-model="headerSearchParams.subject"
              class="header-text"
              outlined
              dense
              clearable
          ></v-text-field>
        </template>
        <template v-slot:header.createDate="{ header }">
          <th
              id="create-date-header"
              :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']"
          >
            {{ header.text }}
            <em
                :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']"
            ></em>
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
                  :value="headerSearchParams.createDate? headerSearchParams.createDate.join(): ''"
                  outlined
                  dense
                  readonly
                  v-on="on"
                  @click:clear="headerSearchParams.createDate = []"
                  clearable
                  class="header-text"
              ></v-text-field>
            </template>
            <v-date-picker
                id="date-picker"
                v-model="headerSearchParams.createDate"
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
              v-model="headerSearchParams.status"
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
          <v-select
              id="reviewer-text-field"
              v-model="headerSearchParams.reviewer"
              :items="reviewers"
              item-text="reviewerText"
              item-value="reviewerCode"
              class="header-text"
              outlined
              dense
              clearable
          >
          </v-select>
        </template>
        <template v-slot:no-data>There are no messages.</template>
        <template v-slot:item="{ item, index }">
          <tr v-on:click="clickViewMessageDetails(item)"
              :key="index"
              :class="[{'unread': item.isReadByMinistry === 'N'}, 'tableRow']">
            <td>{{ item.contact }}</td>
            <td>{{ item.subject }}</td>
            <td>{{
                item.createDate ? moment(item.createDate).format('YYYY/MM/DD') : ''
              }}
            </td>
            <td>{{ item.secureExchangeStatusCode }}</td>

            <td v-if="item.reviewer !== 'unclaimed'">{{ item.reviewer }}</td>
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
import {mapState} from 'vuex';
import ApiService from '../common/apiService';
import {Routes} from '@/utils/constants';

import PrimaryButton from './util/PrimaryButton';
import NewMessageDialog from './secure-message/NewMessageDialog';

export default {
  name: 'ExchangePage',
  components: {
    PrimaryButton,
    NewMessageDialog,
  },
  data() {
    return {
      selectedItem: 0,
      pageNumber: 1,
      pageSize: 25,
      totalRequests: 0,
      itemsPerPageOptions: [1, 2, 10, 15, 25, 50, 100],
      loadingTable: false,
      dateMenu: false,
      headerSearchParams: {
        contact: '',
        subject: '',
        createDate: [],
        status: '',
        reviewer: ''
      },
      headerSortParams: {
        currentSort: 'createDate',
        currentSortDir: true
      },
      requests: [],
      reviewers: [
        {
          reviewerCode: '404',
          reviewerText: 'Unclaimed'
        },
        {
          reviewerCode: '100',
          reviewerText: 'JONES, TIM EDUC:EX'
        },
        {
          reviewerCode: '101',
          reviewerText: 'ROUND, ROBIN EDUC:EX'
        }
      ]
    };
  },
  computed: {
    ...mapState({
      userName: state => state.auth.userInfo.userName
    }),
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['ministryTeams', 'statuses']),
    myTeam() {
      return this.ministryTeams.find(team => this.userInfo.userRoles.some(role => team.groupRoleIdentifier === role)) || {};
    },
    headers() {
      return [
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
    }
  },
  created() {
    this.$store.dispatch('app/getCodes');
    this.$store.dispatch('edx/getCodes');
    this.getRequests();
  },
  methods: {
    claim() {
      console.log(this.userName + ' would like to claim');
      alert(`claim as ${this.userName}?`);
    },
    clickViewMessageDetails(message) {
      //mocked function that will show the full message details when clicked
      console.log(`message id ${message?.id} was clicked`);
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
        createDate: 'ASC',
      };
      ApiService.apiAxios.get(Routes.edx.EXCHANGE_URL, {params: {pageNumber: this.pageNumber - 1, pageSize: this.pageSize, sort}})
        .then(response => {
          this.requests = response.data.content;
          this.totalRequests = response.data.totalElements;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.loadingTable = false;
        });
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

.table-header {
  cursor: pointer;
  margin-bottom: 0;
}

.tableRow {
  cursor: pointer;
}

.v-icon {
  font-size: 18px;
}

.unread {
  font-weight: bold;
}

</style>
