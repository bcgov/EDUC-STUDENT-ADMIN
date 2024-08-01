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
        <v-card-title
          class="text-wrap pb-0"
          style="width: 25em"
        >
          <v-row no-gutters>
            <strong>Student Level Data (1701)</strong>
          </v-row>
        </v-card-title>
        <v-card-subtitle class="mt-1">
          <span v-if="collectionObject !== null">{{ collectionType }} {{ year }} Collection</span>
          <span v-else>No Open Collection</span>
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
            Snapshot Date: {{ collectionObject !== null ? snapshotDate : '-' }}
          </v-row>
          <v-row class="dates">
            <v-icon
              small
              color="#003366"
              class="mr-1"
            >
              mdi-calendar
            </v-icon>
            Submission Due: {{ collectionObject !== null ? submissionDueDate : '-' }}
          </v-row>
        </v-card-text>
        <v-spacer />
        <v-card-actions
          class="justify-end pt-0"
        >
          <v-hover v-slot="{ hover }">
            <v-btn
              variant="text"
              @click="goToCloseCollection()"
              :disabled="collectionObject === null"
            >
              <span
                class="ml-1 pr-2"
                style="color: #003366"
              >Continue</span>
              <v-icon
                color="#003366"
                class="ml-n1 mr-1"
                right
                icon="mdi-arrow-right"
                dark
              />
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
import alertMixin from '@/mixins/alertMixin';
import {notificationsStore} from '@/store/modules/notifications';

export default {
  name: 'ActiveCollectionPage',
  mixins: [alertMixin],
  props: {},
  data() {
    return {
      year: null,
      collectionID: null,
      collectionType: null,
      snapshotDate: null,
      submissionDueDate: null,
      collectionObject: null
    };
  },
  created() {
    this.getActiveCollection();
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
  },
  watch: {
    notification(notificationData) {
      if (notificationData) {
        if (notificationData.eventType === 'CLOSE_CURRENT_COLLECTION_AND_OPEN_NEW_COLLECTION' && notificationData.eventOutcome === 'NEW_COLLECTION_CREATED' && notificationData.eventPayload) {
          try {
              const eventMessage = `New Collection is now OPEN. Please refresh your screen.`;
              this.setSuccessAlert(eventMessage);
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
  },
  methods:{
    getActiveCollection(){
      ApiService.apiAxios.get(`${Routes.sdc.ACTIVE_COLLECTION}`)
        .then(response => {
          this.collectionObject = response.data;
          let createTimestamp = Date.parse(response.data.openDate);
          this.year = new Date(createTimestamp).getFullYear();

          let lowercaseCollectionType = response.data.collectionTypeCode.toLowerCase();
          this.collectionType = lowercaseCollectionType.replace(lowercaseCollectionType[0], lowercaseCollectionType[0].toUpperCase());
          this.collectionID = response.data.collectionID;
          this.snapshotDate = response.data.snapshotDate.replaceAll('-', '/');
          this.submissionDueDate = response.data.submissionDueDate.replaceAll('-', '/');
        });
    },
    goToCloseCollection() {
      this.$router.push({name: 'collection-view', params: {'collectionID': this.collectionID}});
    }
  }
};

</script>

<style scoped>
.containerSetup {
  padding-right: 0 !important;
  padding-left: 0 !important;
  width: 100%;
}

.dates {
  color: #003366;
  font-style: italic;
  padding-top: 1em;
}

</style>
