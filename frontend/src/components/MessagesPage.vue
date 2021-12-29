<template>
  <v-row>
    <v-col cols='2'>
      <v-expansion-panels :value="0">
        <v-expansion-panel>
          <v-expansion-panel-header> PEN Team</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-list dense>
              <v-list-item-group v-model="selectedItem" color="primary">
                <v-list-item>
                  <v-list-item-content>Messages</v-list-item-content>
                  <v-list-item-avatar>1</v-list-item-avatar>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Unclaimed Messages</v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
    <v-col>
      <v-row class='d-flex justify-end pb-2'>
        <PrimaryButton text='Add Message'/>
      </v-row>
      <v-data-table
          :headers="headers"
          :items-per-page.sync="pageSize"
          :page.sync="pageNumber"
          :footer-props="{
              'items-per-page-options': itemsPerPageOptions
            }"
          :items="requests"
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
        <template v-slot:header.initialSubmitDate="{ header }">
          <th
              id="submit-date-header"
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
                  :value="headerSearchParams.initialSubmitDate? headerSearchParams.initialSubmitDate.join(): ''"
                  outlined
                  dense
                  readonly
                  v-on="on"
                  @click:clear="headerSearchParams.initialSubmitDate = []"
                  clearable
                  class="header-text"
              ></v-text-field>
            </template>
            <v-date-picker
                id="date-picker"
                v-model="headerSearchParams.initialSubmitDate"
                no-title
                range
            >
              <v-spacer></v-spacer>
              <PrimaryButton id="date-picker-ok-button" text="OK"
                             @click.native="dateMenu=false"></PrimaryButton>
            </v-date-picker>
          </v-menu>
        </template>
        <template v-slot:header.status="{ header }">
          <th
              id="status-header"
          >
            {{ header.text }}
          </th>
          <v-select
              id="status-text-field"
              v-model="headerSearchParams.status"
              :items="statuses"
              item-text="statusText"
              item-value="statusCode"
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
        <template v-slot:item="{ item }">
          <tr v-on:click="viewMessageDetails(item)" :class="{'unread': !item.read}">
            <td>{{ item.contact }}</td>
            <td>{{ item.subject }}</td>
            <td>{{
                item.initialSubmitDate ? moment(item.initialSubmitDate).format('YYYY/MM/DD') : ''
              }}
            </td>
            <td>{{ item.status }}</td>

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
import moment from 'moment';

import PrimaryButton from './util/PrimaryButton';

export default {
  name: 'MessagesPage',
  components: {
    PrimaryButton,
  },
  data() {
    return {
      selectedItem: 0,
      pageNumber: 1,
      pageSize: 25,
      itemsPerPageOptions: [10, 15, 25, 50, 100],
      dateMenu: false,
      headerSearchParams: {
        contact: '',
        subject: '',
        initialSubmitDate: [],
        status: '',
        reviewer: ''
      },
      headerSortParams: {
        currentSort: 'initialSubmitDate',
        currentSortDir: true
      },
      requests: [
        {
          id: 142,
          contact: 'SFU (06718294)',
          subject: 'Test University',
          initialSubmitDate: moment('2021/12/27', 'YYYY/MM/DD'),
          status: 'NEW',
          reviewer: 'unclaimed',
          read: true
        },
        {
          id: 143,
          contact: 'Bear Valley School (08288028)',
          subject: 'Question about PEN assignment',
          initialSubmitDate: moment('2021/01/01', 'YYYY/MM/DD'),
          status: 'IN PROGRESS',
          reviewer: 'JONES, TIM EDUC:EX',
          read: true
        },
        {
          id: 144,
          contact: 'Nootka Elem Summer School (03990089)',
          subject: 'Student name change',
          initialSubmitDate: moment('2021/07/07', 'YYYY/MM/DD'),
          status: 'NEW',
          reviewer: 'unclaimed',
          read: false
        }
      ],
      statuses: [
        {
          statusCode: 'inProgress',
          statusText: 'In Progress'
        },
        {
          statusCode: 'new',
          statusText: 'New'
        },
        {
          statusCode: 'completed',
          statusText: 'Completed'
        },
        {
          statusCode: 'done',
          statusText: 'Done'
        },
      ],
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
          value: 'initialSubmitDate',
          sortable: false
        },
        {
          text: 'Status',
          value: 'status',
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
  methods: {
    claim() {
      console.log(this.userName + ' would like to claim');
      alert(`claim as ${this.userName}?`);
    },
    viewMessageDetails(message) {
      console.log(`message id ${message?.id} was clicked` );
    }
  }
};
</script>

<style scoped>

.table-header {
  cursor: pointer;
  margin-bottom: 0;
}

.v-icon {
  font-size: 18px;
}

.unread {
  font-weight: bold;
}

</style>
