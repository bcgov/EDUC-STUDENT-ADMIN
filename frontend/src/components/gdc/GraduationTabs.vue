<template>
  <v-container
    fluid
    class="px-16"
  >
    <v-row no-gutters>
      <v-col>
        <v-tabs
          v-model="tab"
          style="color: #38598a"
        >
          <v-tab
            id="reportingDatesTab"
            value="reportingDatesTab"
            prepend-icon="mdi-file-upload-outline"
          >
            Reporting Dates
          </v-tab>
          <v-tab
            id="schoolsTab"
            value="schoolsTab"
            prepend-icon="mdi-account-search-outline"
          >
            Schools
          </v-tab>
          <v-tab
            id="reportingInsightsTab"
            value="reportingInsightsTab"
            prepend-icon="mdi-finance"
          >
            Reporting Insights
          </v-tab>
          <v-tab
            id="studentDataTab"
            value="studentDataTab"
            prepend-icon="mdi-account-multiple-outline"
          >
            Find Student in Data Submissions
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-card-text class="pt-0">
          <v-window v-model="tab">
            <v-window-item value="reportingDatesTab">
              Reporting Dates
            </v-window-item>
            <v-window-item value="schoolsTab">
              Schools
            </v-window-item>
            <v-window-item value="reportingInsightsTab">
              Reporting Insights
            </v-window-item>
            <v-window-item value="studentDataTab">
              Find Student in Data Submissions
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import alertMixin from '@/mixins/alertMixin';
import {PAGE_TITLES} from '@/utils/constants';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';

export default {
  name: 'GraduationSchoolTabs',
  components: {

  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: false,
      default: null
    },
  },
  data() {
    return {
      PAGE_TITLES: PAGE_TITLES,
      tab: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(appStore, ['config'])
  },
  methods: {

  }
};
</script>
