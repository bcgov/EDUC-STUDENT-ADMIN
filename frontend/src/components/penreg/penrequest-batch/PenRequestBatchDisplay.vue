<template>
    <v-container fluid class="fill-height px-0 mb-4">
        <v-alert
          v-model="alert"
          dense
          text
          dismissible
          outlined
          transition="scale-transition"
          :class="`${alertType} flex-grow-1 mx-3`"
        >
          {{ alertMessage }}
        </v-alert>
        <v-row no-gutters class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
          <v-col cols="1">
            <v-select
              id="select-school-group"
              :items="schoolGroups"
              v-model="selectedSchoolGroup"
              outlined
              dense
              color="#38598a"
              append-icon="mdi-chevron-down"
            ></v-select>
          </v-col>
          <v-sheet
            v-if="filters && filters.length > 0"
            class="mx-4 px-2 py-1 d-flex flex-row flex-grow-1 align-center align-self-start"
            color="rgba(0, 0, 0, 0.06)"
            outlined
            rounded
          >
            <span class="mr-4"><strong>Filtered by</strong></span>
            <FilterTag
              v-for="(filter, index) in filters"
              :key="index"
              :id="index + 'tag'"
              :text="filter"
              class="mr-2"
              :close="removeFilter"
              :item="index"
            >
            </FilterTag>
          </v-sheet>
          <v-spacer v-else></v-spacer>
          <PrimaryButton id="view-list-action" class="mr-2" :disabled="!filesSelected" @click.native="clickViewList" text="View List"></PrimaryButton>
          <PrimaryButton id="view-details-action" class="mx-2" :disabled="!filesSelected" @click.native="clickViewDetails" text="View Details"></PrimaryButton>
          <PrimaryButton id="archive-action" :disabled="!actionEnabled">
            Finish Submission
            <v-icon large right>
              mdi-chevron-down
            </v-icon>
          </PrimaryButton>
        </v-row>
        <v-row no-gutters class="py-2" style="background-color:white;">
          <PenRequestBatchList
            :schoolGroup="selectedSchoolGroup"
            :filters="filters"
            @filter-change="filterChange"
            @failure-alert="setFailureAlert"
          ></PenRequestBatchList>
        </v-row>
    </v-container>
</template>

<script>
import { PEN_REQ_BATCH_STUDENT_REQUEST_CODES, SEARCH_FILTER_OPERATION, SEARCH_CONDITION, SEARCH_VALUE_TYPE } from '../../../utils/constants';
import { mapState, mapMutations } from 'vuex';
import PenRequestBatchList from './PenRequestBatchList';
import FilterTag from '../../util/FilterTag';
import PrimaryButton from '../../util/PrimaryButton';
import router from '../../../router';
import alterMixin from '../../../mixins/alterMixin';

export default {
  name: 'PenRequestBatchDisplay',
  components: {
    FilterTag,
    PrimaryButton,
    PenRequestBatchList
  },
  mixins: [alterMixin],
  props: {
    schoolGroup: {
      type: String,
      default: 'K12'
    },
  },
  data() {
    return {
      schoolGroups: [{value: 'K12', text: 'K-12'}, {value: 'PSI', text: 'PSI'}],
      filters:['Fixable'],
      actionEnabled: false,
    };
  },
  computed: {
    ...mapState('penRequestBatch', ['selectedFiles', 'prbStudentStatusFilters']),
    selectedSchoolGroup: {
      get(){
        return this.$store.state['penRequestBatch'].selectedSchoolGroup;
      },
      set(newSchoolGroup){
        return this.$store.state['penRequestBatch'].selectedSchoolGroup = newSchoolGroup;
      }
    },
    filesSelected() {
      return this.selectedFiles?.length > 0;
    },
    selectedFileBatchIDs() {
      return this.selectedFiles.map(file => file.penRequestBatchID).join(',');
    },
    selectedFilterNames() {
      const filterNames = {
        matchedCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDSYS, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDUSR],
        newPenCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENSYS, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR],
        errorCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.ERROR, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ],
        repeatCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.REPEAT],
        fixableCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE]
      };
      
      return this.prbStudentStatusFilters.map(filter => filterNames[filter]).join(',');
    }
  },
  created() {
    this.selectedSchoolGroup = this.schoolGroup;
  },
  methods: {
    ...mapMutations('prbStudentSearch', ['clearPrbStudentSearchState']),
    removeFilter(index) {
      this.filters.splice(index, 1);
    },
    filterChange(filters) {
      this.filters = filters;
    },
    clickViewList() {
      const batchIDs = this.selectedFileBatchIDs;
      const statusFilters = this.selectedFilterNames;
      this.clearPrbStudentSearchState();
      router.push({name: 'prbStudentList', query: { batchIDs, statusFilters }});
    },
    clickViewDetails() {
      const countColumn = (this.prbStudentStatusFilters.length > 0) ? 'filteredCount' : 'studentCount';
      const totalNumber = this.selectedFiles.reduce((sum, file) => sum + file[countColumn], 0);
    
      const searchCriteriaList = [
        { 
          searchCriteriaList: [
            {
              key: 'penRequestBatchEntity.penRequestBatchID', 
              operation: SEARCH_FILTER_OPERATION.IN, 
              value: this.selectedFileBatchIDs, 
              valueType: SEARCH_VALUE_TYPE.UUID
            },
            {
              key: 'penRequestBatchStudentStatusCode', 
              operation: this.selectedFilterNames.length > 0 ? SEARCH_FILTER_OPERATION.IN : SEARCH_FILTER_OPERATION.NOT_EQUAL, 
              value: this.selectedFilterNames.length > 0 ? this.selectedFilterNames : PEN_REQ_BATCH_STUDENT_REQUEST_CODES.LOADED, 
              valueType: SEARCH_VALUE_TYPE.STRING,
              condition: SEARCH_CONDITION.AND
            }
          ],
        },
      ];
      
      const query = { 
        seqNumber: 1,
        totalNumber, 
        batchCount: this.selectedFiles.length, 
        searchCriteria: JSON.stringify(searchCriteriaList),
      };
      router.push({name: 'prbStudentDetails', query});
    }
  }
};
</script>

<style scoped>
  .v-btn {
    text-transform: none !important;
  }

  #archive-action .v-icon {
    color: white !important;
  }
</style>
