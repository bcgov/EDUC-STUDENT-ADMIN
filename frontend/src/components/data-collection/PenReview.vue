<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-row>
          <v-col
            cols="12"
            class="d-flex justify-end"
          >
            <v-btn
              id="view"
              color="primary"
              text="View Selected"
              class="mr-1 mb-1"
              :disabled="selectedStudents.length === 0"
              @click="viewSelectedStudents"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <CustomTable
              class="table"
              :headers="headers"
              :data="studentList"
              :total-elements="totalElements"
              :is-loading="isLoading"
              @reload="reload"
              @selections="selectedStudents = $event"
              @editSelectedRow="editStudent"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>

import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {omitBy, isEmpty, cloneDeep} from 'lodash';
import {PEN_MATCHING} from '@/utils/sdc/collectionTableConfiguration';
import CustomTable from '../common/CustomTable.vue';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import {mapState, mapActions} from 'pinia';

export default {
  name: 'PenReview',
  components: {
    CustomTable
  },
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  emits: ['next'],
  data() {
    return {
      headers: PEN_MATCHING.penReviewTableHeaders,
      isLoading: false,
      pageNumber: 1,
      pageSize: 15,
      studentList: [],
      totalElements: 0,
      filterSearchParams: {
        assignedPen: PEN_MATCHING.defaultFilter,
        notSdcSchoolCollectionStudentStatusCode: 'DELETED',
        moreFilters: {}
      },
      selectedStudents: []
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['selectedIDs']),
  },
  async created() {
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setSelectedIDs', 'setNavigationPage']),
    loadStudents() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionObject.collectionID}/students-paginated?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            penMatchResult: 'ASC'
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
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.loadStudents();
    },
    viewSelectedStudents() {
      const selectedStudents = this.selectedStudents.map(student => student.sdcSchoolCollectionStudentID);
      this.setSelectedIDs(selectedStudents);
      this.setNavigationPage(0);
      this.$router.push({name: 'student-detail', params: {studentID: selectedStudents[0]}});
    },
    editStudent($event) {
      const studentForEdit = cloneDeep($event);
      let selectedStudents = [];
      selectedStudents.push(studentForEdit?.sdcSchoolCollectionStudentID);
      this.setSelectedIDs(selectedStudents);
      this.setNavigationPage(0);
      this.$router.push({name: 'student-detail', params: {studentID: selectedStudents[0]}});
    },
  },
};
</script>
  
  <style scoped>
.table {
  width: none !important;
}
  </style>
  
