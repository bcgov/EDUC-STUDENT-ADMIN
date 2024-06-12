<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <CustomTable
          class="table"
          :headers="headers"
          :data="studentList"
          :total-elements="totalElements"
          :is-loading="isLoading"
          @reload="reload"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
  
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {omitBy, isEmpty} from 'lodash';
import {NEW_PEN} from '@/utils/sdc/collectionTableConfiguration';
import CustomTable from '../common/CustomTable.vue';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
  
export default {
  name: 'NewPen',
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
      headers: NEW_PEN.newPenTableHeaders,
      isLoading: false,
      pageNumber: 1,
      pageSize: 15,
      studentList: [],
      totalElements: 0,
      filterSearchParams: {
        assignedPen: NEW_PEN.defaultFilter,
        sdcSchoolCollectionStudentStatusCode: 'INFOWARN,FUNDWARN,VERIFIED',
        moreFilters: {}
      }
    };
  },
  computed: {
  },
  async created() {
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });
  },
  methods: {
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
    }
  },
};
</script>
    
    <style scoped>
  .table {
    width: none !important;
  }
    </style>
    
  
