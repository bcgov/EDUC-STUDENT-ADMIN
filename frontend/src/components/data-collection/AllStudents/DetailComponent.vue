<template>
  <v-row>
    <v-col cols="12">
      <v-row justify="space-between">
        <v-col
          cols="4"
          class="found-align"
        >
          <span
            id="studentsFound"
            class="bold"
          >Students Found:  {{ totalElements }}
          </span>
          <router-link
            v-if="showExportBtn"
            class="ml-2"
            :to="{ path: downloadReportURL() }"
            target="_blank"
          >
            <v-icon
              small
              class="ml-1"
              color="#003366"
            >
              mdi-tray-arrow-down
            </v-icon>
            <span class="export">Export All Student Records</span>
          </router-link>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
        >
          <v-btn
            id="filters"
            color="#003366"
            text="Filter"
            class="mr-1 mb-1"
            prepend-icon="mdi-filter-multiple-outline"
            variant="outlined"
            @click="toggleFilters"
          >
            <template #append>
              <v-badge
                color="error"
                :content="filterCount"
                floating
                offset-y="-10"
              />
            </template>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <CustomTable
            :headers="config.tableHeaders"
            :data="studentList"
            :total-elements="totalElements"
            :is-loading="isLoading"
            :reset="resetFlag"
            @reload="reload"
            @editSelectedRow="editStudent"
            @selections="selectedStudents = $event"
          />
        </v-col>
      </v-row>
    </v-col>
    <v-navigation-drawer
      v-model="showFilters"
      location="right"
      :temporary="true"
      width="700"
      :persistent="true"
      scrim="transparent"
      :border="true"
      style="top:0; height: 100%;"
      rounded="true"
    >
      <Filters
        :filters="config.allowedFilters"
        :collection-object="collectionObject"
        @apply-filters="applyFilters"
        @clear-filters="clearFilters"
        @close="showFilters= !showFilters"
      />
    </v-navigation-drawer>
  </v-row>
  <v-bottom-sheet
    v-model="editStudentSheet"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ViewStudentDetailsComponent
      :selected-student-ids="studentForEdit"
      @close="closeAndLoadStudents"
    />
  </v-bottom-sheet>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import CustomTable from '../../common/CustomTable.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {cloneDeep, isEmpty, omitBy} from 'lodash';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import ViewStudentDetailsComponent from './ViewStudentDetailsComponent.vue';
import Filters from '../../common/Filters.vue';
import {mapState} from 'pinia';

export default {
  name: 'DetailComponent',
  components: {
    Filters,
    CustomTable,
    ViewStudentDetailsComponent
  },
  mixins: [alertMixin],
  props: {
    config: {
      tabFilter: Object,
      required: true,
      type: Object,
      default: null
    },
    collectionObject: {
      type: Object,
      required: true,
      default: null
    },
    showExportBtn: {
      type: Boolean,
      default: false
    }
  },
  emits: [],
  data() {
    return {
      chip: true,
      pageNumber: 1,
      pageSize: 15,
      studentList: [],
      isLoading: false,
      totalElements: 0,
      selectedStudents: [],
      filterSearchParams: {
        tabFilter: this.config.defaultFilter,
        sdcSchoolCollectionStudentStatusCode: 'INFOWARN,FUNDWARN,VERIFIED',
        moreFilters: {}
      },
      showFilters: null,
      studentForEdit: [],
      editStudentSheet: false,
      resetFlag: false
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['schoolCollection','schoolFundingCodesMap', 'enrolledProgramCodesMap', 'careerProgramCodesMap', 'bandCodesMap', 'specialEducationCodesMap']),
    filterCount() {
      return Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []).length;
    }
  },
  created() {
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });

  },
  methods: {
    closeAndLoadStudents() {
      this.editStudentSheet = !this.editStudentSheet;
      this.loadStudents();
    },
    downloadReportURL() {
      return `${Routes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/report/csv_dis/download`;
    },
    editStudent($event) {
      const selectedStudent = cloneDeep($event);
      this.studentForEdit.splice(0);
      this.studentForEdit.push(selectedStudent?.sdcSchoolCollectionStudentID);
      this.editStudentSheet = true;
    },
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.loadStudents();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.loadStudents();
    },
    loadStudents() {
      this.isLoading = true;
      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionObject.collectionID}/students-paginated?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            legalLastName: 'ASC'
          },
        }
      }).then(response => {
        this.studentList = response.data.content;
        this.totalElements = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.loadStudents();
    }
  }
};
</script>

<style scoped>
.search-box {
  background: rgb(235, 237, 239);
  border-radius: 8px;
  padding: 10px;
}

.filter-col {
  color: #7f7f7f;
}

.bold {
  font-weight: bold ;
}

.found-align {
  align-self: flex-end;
}

.export {
  margin-left: 1px;
  color: #003366;
}
</style>
