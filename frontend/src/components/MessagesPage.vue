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
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
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
      requests: [
        {
          contact: 'Bear Valley School (08288028)',
          subject: 'Question about PEN assignment',
          date: '2021/11/15',
          status: 'IN PROGRESS',
          reviewer: 'JONES, TIM EDUC:EX'
        },
        {
          contact: 'Nootka Elem Summer School (03990089)',
          subject: 'Student name change',
          date: '2021/11/16',
          status: 'NEW',
          reviewer: 'unclaimed'
        }
      ],
    };
  },
  computed: {
    //contact, subject, date, status, claimed by
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
          value: 'date',
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
  }
};
</script>
