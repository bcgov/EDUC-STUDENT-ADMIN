<template>
  <v-container class="containerSetup mb-5">
    <v-row class="pr-4">
      <v-col class="pb-0 mt-4">
        <h2>
            Open Collections
        </h2>
      </v-col>
    </v-row>
    <v-row>
      <v-card
        class="d-flex flex-column mt-4"
        height="100%"
      >
        <v-card-title class="text-wrap pb-0" style="width: 25em">
          <v-row no-gutters>
            <strong>Student Level Data (1701)</strong>
          </v-row>
        </v-card-title>
        <v-card-subtitle class="mt-1">
          {{collectionType}} {{year}} Collection
        </v-card-subtitle>
        <v-card-text
            class="mt-2 ml-2 mr-2"
        >
          <v-row class="dates">
            <v-icon
                small
                color="#003366"
                class="mr-1"
            >
              mdi-calendar
            </v-icon>
            Snapshot Date: {{snapshotDate}}
          </v-row>
          <v-row class="dates" >
            <v-icon
                small
                color="#003366"
                class="mr-1"
            >
              mdi-calendar
            </v-icon>
            Submission Due: {{submissionDueDate}}
          </v-row>
        </v-card-text>
        <v-spacer/>
        <v-card-actions
          class="justify-end pt-0"
        >
          <v-hover v-slot="{ hover }">
            <v-btn
                variant="text"
            >
              <span
                  class="ml-1 pr-2"
                  style = "color: #003366"
              >Continue</span>
              <v-icon
                  color="#003366"
                  class="ml-n1 mr-1"
                  right
                  icon="mdi-arrow-right"
                  dark
              >
              </v-icon>
            </v-btn>
          </v-hover>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner.vue';
import router from '@/router';
import ClipboardButton from '@/components/util/ClipboardButton.vue';
import {edxStore} from '@/store/modules/edx';
import { ROLE } from '@/utils/constants/Roles';
import {DateTimeFormatter, LocalDate} from "@js-joda/core";

export default {
  name: 'ActiveCollectionPage',
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {},
  data() {
    return {
      year: null,
      collectionType: null,
      snapshotDate: null,
      submissionDueDate: null
    };
  },
  created() {
    this.getActiveCollection();
  },
  methods:{
    getActiveCollection(){
      ApiService.apiAxios.get(`${Routes.sdc.ACTIVE_COLLECTION}`)
          .then(response => {

            let createTimestamp = Date.parse(response.data.createDate);
            this.year = new Date(createTimestamp).getFullYear();

            let lowercaseCollectionType = response.data.collectionTypeCode.toLowerCase();
            this.collectionType = lowercaseCollectionType.replace(lowercaseCollectionType[0], lowercaseCollectionType[0].toUpperCase());

            this.snapshotDate = response.data.snapshotDate.replaceAll('-', '/')
            this.submissionDueDate = response.data.submissionDueDate.replaceAll('-', '/')

          })
    }
  }

}

</script>

<style scoped>
.containerSetup {
  padding-right: 12em !important;
  padding-left: 12em !important;
  width: 100%;
}

.dates {
  color: #003366;
  font-style: italic;
  padding-top: 1em;
}

#continueButton {
  border: none
}

</style>