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
              :disabled="collectionObject === null"
              @click="goToCloseCollection()"
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
    <v-divider class="py-6 mt-6" />
    <v-row>
      <v-icon icon="mdi-history pt-3" />
      <h2 class="pl-2">
        Collection History
      </h2>
    </v-row>
    <v-row>
      <v-col>
        <v-select
          v-model="searchParams.collectionType"
          label="Collection Type"
          density="compact"
          variant="outlined"
          hide-details
          :clearable="true"
          :items="collectionTypeCodes"
          item-value="collectionTypeCode"
          item-text="label"
          item-title="label"
          @update:model-value="getHistoricCollections"
        />
      </v-col>
      <v-col>
        <VueDatePicker
          v-model="searchParams.year"
          placeholder="Year"
          year-picker
          reverse-years
          :year-range="[1990, maxDate]"
          auto-apply
          @update:model-value="getHistoricCollections"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-data-table-server
        id="collection-history-dataTable"
        :items-per-page="itemsPerPage"
        :page="pageNumber"
        :items="collections"
        :items-length="totalElements"
        :headers="headers"
        :loading="searchLoading"
        :hover="true"
        @update:options="loadItems"
        @click:row="openCollection"
      />
    </v-row>
  </v-container>
</template>

<script>
import {mapState} from 'pinia';
import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {notificationsStore} from '@/store/modules/notifications';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import VueDatePicker from '@vuepic/vue-datepicker';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';

export default {
  name: 'ActiveCollectionPage',
  components: {
    VueDatePicker
  },
  mixins: [alertMixin],
  props: {},
  data() {
    return {
      year: null,
      collectionID: null,
      collectionType: null,
      snapshotDate: null,
      submissionDueDate: null,
      collectionObject: null,
      headers: [
        {
          title: 'Collection Type',
          key: 'collectionTypeCode',
          sortable: false
        },
        {
          title: 'Year',
          key: 'submissionDueDate',
          sortable: false,
          value: item => LocalDate.parse(item.submissionDueDate)?.year()
        }
      ],
      itemsPerPage: 5,
      pageNumber: 1,
      collections: [],
      searchLoading: false,
      searchParams: {
        collectionType: null,
        year: null
      },
      totalElements: 0
    };
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
    ...mapState(sdcCollectionStore, ['collectionTypeCodes', 'collectionTypeCodesMap']),
    maxDate() {
      return LocalDate.now().year();
    }
  },
  watch: {
    notification(notificationData) {
      if (notificationData) {
        if (notificationData.eventType === 'CLOSE_CURRENT_COLLECTION_AND_OPEN_NEW_COLLECTION' && notificationData.eventOutcome === 'NEW_COLLECTION_CREATED' && notificationData.eventPayload) {
          try {
            const eventMessage = 'New Collection is now OPEN. Please refresh your screen.';
            this.setSuccessAlert(eventMessage);
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
  },
  created() {
    sdcCollectionStore().getCollectionTypeCodesMap();
    this.getHistoricCollections();
    this.getActiveCollection();
  },
  methods:{
    getActiveCollection(){
      ApiService.apiAxios.get(`${Routes.sdc.ACTIVE_COLLECTION}`)
          .then(response => {
            this.collectionObject = response.data;

            let createTimestamp = LocalDate.parse(response.data.submissionDueDate);
            this.year = createTimestamp.year();

            let lowercaseCollectionType = response.data.collectionTypeCode.toLowerCase();
            this.collectionType = lowercaseCollectionType.replace(lowercaseCollectionType[0], lowercaseCollectionType[0].toUpperCase());
            this.collectionID = response.data.collectionID;

            this.snapshotDate = LocalDate.parse(response.data.snapshotDate).format(DateTimeFormatter.ofPattern('yyyy/MM/dd'));
            this.submissionDueDate = LocalDate.parse(response.data.submissionDueDate).format(DateTimeFormatter.ofPattern('yyyy/MM/dd'));
          });
    },
    getHistoricCollections() {
      this.searchLoading = true;
      ApiService.apiAxios.get(`${Routes.sdc.COLLECTION_PAGINATED}`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.itemsPerPage,
          searchParams: this.searchParams,
          sort: {
            'submissionDueDate': 'DESC'
          },
        }
      })
        .then(response => {
          this.collections = response?.data?.content.map(collection => {
            return { ...collection, collectionTypeCode: this.collectionTypeCodesMap.get(collection.collectionTypeCode)?.label};
          });
          this.totalElements = response?.data?.totalElements;
        })
        .finally(() => {
          this.searchLoading = false;
        });
    },
    goToCloseCollection() {
      this.$router.push({name: 'collection-view', params: {'collectionID': this.collectionID}});
    },
    loadItems({ page, itemsPerPage }) {
      this.pageNumber = page;
      this.itemsPerPage = itemsPerPage;
      this.getHistoricCollections();
    },
    openCollection(e, { item }) {
      this.$router.push({name: 'collection-view', params: {'collectionID': item?.raw?.collectionID}});
    }
  }
};

</script>

<style scoped>
:deep(.v-data-table-footer__items-per-page) {
  display: none;
}

.containerSetup {
  width: 100%;
}

.dates {
  color: #003366;
  font-style: italic;
  padding-top: 1em;
}

</style>
