<template>
  <v-container fluid class="px-0 mb-4">
    <v-form v-model="isValidSearchForm">
      <v-sheet
        class="my-4 mx-2 mx-sm-2 mx-md-3 mx-lg-3 mx-xl-3 px-2 d-flex align-end align-self-start"
        color="rgba(0, 0, 0, 0.06)"
        outlined
        rounded
      >
        <v-col cols="3" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
          <v-text-field
            id='minCode'
            v-model="searchParams.mincode"
            tabindex="1"
            color="#003366"
            label="District or Mincode"
            maxlength="8"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            :rules="mincodeRules"
            dense
            autofocus
          ></v-text-field>
        </v-col>
        <v-col cols="3" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
          <v-autocomplete
            id='schoolName'
            v-model="searchParams.schoolName"
            :items="schools"
            tabindex="2"
            color="#003366"
            label="School Name"
            clearable
            clear-icon="clear"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            dense
          ></v-autocomplete>
        </v-col>
        <v-col class="d-flex justify-end align-end">
          <PrimaryButton id="clear-action" class="mr-2" secondary text="Clear" @click.native="clearSearchParams"></PrimaryButton>
          <PrimaryButton id="search-action" :disabled="!isValidSearchForm || !searchEnabled"
                        class="mr-0" text="Search"
                        @click.native="searchBatchFiles"></PrimaryButton>
        </v-col>
      </v-sheet>
    </v-form>
      <v-row no-gutters class="py-2" style="background-color:white;">
        <div id="pen-coordinator-list" class="px-3" style="width: 100%" :overlay="false">
          <v-data-table
            id="dataTable"
            class="pen-coordinator-table"
            :headers="headers"
            :items="searchResult"
            :page.sync="pageNumber"
            :items-per-page="itemsPerPage"
            hide-default-footer
            item-key="penRequestBatchID"
            :loading="searchLoading"
            @page-count="pageCount = $event"
          ></v-data-table>
          <Pagination
            v-model="pageNumber"
            :dataResponse="penCoordinatorPage"
          />
        </div>
      </v-row>
  </v-container>
</template>

<script>
import {Routes} from '@/utils/constants';
import {mapState} from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import Pagination from '@/components/util/Pagination';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {
  isNotEmptyInputParams,
  isValidMincode,
} from '@/utils/validation';
import {deepCloneObject, setEmptyInputParams} from '@/utils/common';

export default {
  name: 'PenCoordinatorsDisplay',
  components: {
    PrimaryButton,
    Pagination
  },
  mixins: [alertMixin],
  data() {
    return {
      searchLoading: false,
      searchParams: { 
        mincode: null,
        schoolName: null,
      },
      searchEnabled: false,
      
      mincodeRules: [ v => (!v || this.isValidDistrictOrMincode(v)) || 'Invalid district or mincode'],
      isValidSearchForm: false,

      pageNumber: 1,
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        { text: 'Mincode', value: 'mincode', sortable: false, align: 'start', tooltip: 'Mincode' },
        { text: 'School', value: 'schoolName', sortable: false, tooltip: 'School Name' },
        { text: 'PEN Coordinator Name', value: 'penCoordinatorName', sortable: false, tooltip: 'PEN Coordinator Name' },
        { text: 'Email', value: 'penCoordinatorEmail', sortable: false, tooltip: 'Eamil'},
      ],
      penCoordinators: [],
      searchResult: [],
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    schools() {
      return _.sortedUniq([...this.mincodeSchoolNames.values()].sort());
    },
    penCoordinatorPage() {
      return {
        totalPages: this.pageCount,
        totalElements: this.searchResult.length,
        numberOfElements: this.pageNumber < this.pageCount ? this.itemsPerPage : this.searchResult.length - (this.pageNumber - 1) * this.itemsPerPage,
        pageable: {
          pageSize: this.itemsPerPage
        }
      };
    }
  },
  created() {
    this.$store.dispatch('app/getCodes');
  },
  mounted() {
    this.loadPenCoords();
  },
  methods: {
    searchHasValues(){
      this.searchEnabled = isNotEmptyInputParams(this.searchParams);
      return this.searchEnabled;
    },
    enterPushed() {
      if (this.isValidSearchForm && this.searchHasValues()) {
        this.searchBatchFiles();
      }
    },
    searchBatchFiles() {
      let filterParams = deepCloneObject(this.searchParams);
      if(filterParams.mincode && filterParams.mincode.length < 8) {
        filterParams.districtNumber = filterParams.mincode;
        filterParams.mincode = null;
      } 
      filterParams = _.pickBy(filterParams, _.isString);
      this.searchResult = _.filter(this.penCoordinators, filterParams);
      this.pageNumber = 1;
    },
    clearSearchParams() {
      setEmptyInputParams(this.searchParams);
      this.searchEnabled = false;
      this.searchResult = this.penCoordinators;
      this.pageNumber = 1;
    },
    isValidMincode,
    isValidDistrictOrMincode(v) {
      return (isValidMincode(v) && (v.length === 3 || v.length === 8));
    },
    loadPenCoords() {
      this.searchLoading = true;
      ApiService.apiAxios
        .get(`${Routes.SCHOOL_DATA_URL}/penCoordinators`)
        .then(response => {
          if (response.data) {
            this.penCoordinators = response.data;
            this.searchResult = this.penCoordinators;
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the pen coordinator data. Please try again later.');
        })
        .finally(() => (this.searchLoading = false));
    },
  }
};
</script>

<style scoped>
  #dataTable.pen-coordinator-table /deep/ table th{
    font-size: 0.875rem;
  }

  #dataTable.pen-coordinator-table /deep/ table td { 
    border-bottom: none !important;
  }
  
  #dataTable.pen-coordinator-table /deep/ table { 
    border-top: thin solid #d7d7d7;
    border-bottom: thin solid #d7d7d7;
  }
  
  #dataTable.pen-coordinator-table /deep/ table tbody tr:hover { 
    background-color: #E1F5FE
  }
  
</style>
