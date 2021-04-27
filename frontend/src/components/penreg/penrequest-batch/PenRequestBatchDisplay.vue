<template>
    <v-container fluid class="fill-height px-0 mb-4">
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
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <PrimaryButton id="archive-action" :disabled="!filesSelected || loadingFiles" :on="on" text="Finish Submission" icon="mdi-chevron-down" largeIcon>
              </PrimaryButton>
            </template>
            <v-list>
              <v-list-item @click="archiveAndReturnFixedOnly">
                <v-list-item-title>Return Except Fix</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Return With Fix</v-list-item-title>
              </v-list-item>
              <v-list-item @click="archiveOnly">
                <v-list-item-title>Archive Only</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
        <v-row no-gutters class="py-2" style="background-color:white;">
          <PenRequestBatchList
            :schoolGroup="selectedSchoolGroup"
            :filters.sync="filters"
            :loadingFiles="loadingFiles"
            :inProgressSagaIDs="inProgressSagaIDs"
          ></PenRequestBatchList>
        </v-row>
      <ConfirmationDialog ref="fixableConfirmationDialog">
          <template v-slot:title="{cancel}">
            <v-row justify="space-between" no-gutters>
              <v-col class="pl-4 pt-4">
                {{ archiveAndReturnMessage }}<br><br>
                Note this action will not return any files to the submitting school if FIXABLE requests exist.
              </v-col>
              <v-btn id="closeBtn" text icon @click.native="cancel">
                <v-icon color="#38598A">mdi-close</v-icon>
              </v-btn>
            </v-row>
          </template>
        </ConfirmationDialog>
      <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
    </v-container>
</template>

<script>
import { PEN_REQ_BATCH_STUDENT_REQUEST_CODES, SEARCH_FILTER_OPERATION, SEARCH_CONDITION, SEARCH_VALUE_TYPE } from '../../../utils/constants';
import { mapState, mapMutations } from 'vuex';
import PenRequestBatchList from './PenRequestBatchList';
import FilterTag from '../../util/FilterTag';
import PrimaryButton from '../../util/PrimaryButton';
import router from '../../../router';
import alertMixin from '../../../mixins/alertMixin';
import ConfirmationDialog from '../../util/ConfirmationDialog';
import pluralize from 'pluralize';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';

export default {
  name: 'PenRequestBatchDisplay',
  components: {
    FilterTag,
    PrimaryButton,
    PenRequestBatchList,
    ConfirmationDialog
  },
  mixins: [alertMixin],
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
      loadingFiles: false,
      archiveAndReturnMessage: '',
      inProgressSagaIDs: []
    };
  },
  computed: {
    ...mapState('penRequestBatch', ['selectedFiles', 'prbStudentStatusFilters']),
    ...mapState('app', ['mincodeSchoolNames']),
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
        archived: false,
      };
      router.push({name: 'prbStudentDetails', query});
    },
    async archiveOnly() {
      const fileNumber = this.selectedFiles.length;
      const result = await this.$refs.confirmationDialog.open(
        `Please confirm that you would like to Archive ${fileNumber} ${pluralize('file', fileNumber)}`, 
        'Note this action will not return any files to the submitting school.', 
        { width: '520px', messagePadding: 'px-4 pt-4', color: '', dark: false, closeIcon: true, divider: true, subtitle: true, resolveText: 'Confirm' }
      );
      if(result) {
        const payload = {
          penRequestBatchIDs: this.selectedFiles.map(file => file.penRequestBatchID)
        };
        this.loadingFiles = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/archiveFiles`, payload)
          .then(response => {
            const archivedNumber = response.data.length;
            const archivedMessage = `${archivedNumber} PEN Request ${pluralize('File', archivedNumber)} ${pluralize('has', archivedNumber)} been archived.`;
            if(archivedNumber === fileNumber) {
              this.setSuccessAlert(`Success! ${archivedMessage}`);
            } else {
              this.setFailureAlert(`An error occurred while archiving PEN Request Files! ${archivedMessage} Please try again later.`);
            }
          })
          .catch(error => {
            this.setFailureAlert('An error occurred while archiving PEN Request Files! Please try again later.');
            console.log(error);
          })
          .finally(() => {
            this.loadingFiles = false;
          });
      }
    },
    async archiveAndReturnFixedOnly() {
      const fileNumber = this.selectedFiles.length;
      this.archiveAndReturnMessage = `Please confirm that you would like to return the response files to ${fileNumber} PEN request ${pluralize('file', fileNumber)}.`;
      const result = await this.$refs.fixableConfirmationDialog.open(null,null,
        { width: '520px', messagePadding: 'px-4 pt-4', color: '', dark: false, closeIcon: true, divider: true, subtitle: true, resolveText: 'Confirm' }
      );
      if(result) {
        const filesIDsWithFixableNumber = this.selectedFiles.filter(prb => prb?.fixableCount > 0).map(file => file.penRequestBatchID).length;
        const filesIDsWithoutFixable = this.selectedFiles.filter(prb => prb?.fixableCount === 0).map(file => {
          return {
            penRequestBatchID: file.penRequestBatchID,
            schoolName: this.mincodeSchoolNames.get(file?.mincode?.replace(' ', ''))
          };
        });

        this.loadingFiles = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/archiveAndReturnFiles`, { penRequestBatchIDs: filesIDsWithoutFixable})
          .then((archiveAndReturnResponse) => {
            const archivedAndReturnedNumber = archiveAndReturnResponse?.data?.length;
            let archivedMessage = `Archive requests for ${archivedAndReturnedNumber} PEN Request ${pluralize('File', archivedAndReturnedNumber)} ${pluralize('has', archivedAndReturnedNumber)} been initiated.`;
            if (filesIDsWithFixableNumber > 0) {
              archivedMessage += `\n${filesIDsWithFixableNumber} PEN Request ${pluralize('File', filesIDsWithFixableNumber)} with FIXABLE records ${pluralize('has', filesIDsWithFixableNumber)} been withheld.`;
            }
            
            if(archiveAndReturnResponse?.data) {
              archiveAndReturnResponse?.data?.forEach(response => {
                this.inProgressSagaIDs.push({sagaID: response.sagaId, penRequestBatchID: response.penRequestBatchID});
              });
            }
            if(archivedAndReturnedNumber + filesIDsWithFixableNumber === fileNumber) {
              this.setSuccessAlert(`Success! ${archivedMessage}`);
            } else {
              this.setFailureAlert('An error occurred while archiving PEN Request Files! Please try again later.');
            }
          })
          .catch(error => {
            this.setFailureAlert('An error occurred while archiving PEN Request Files! Please try again later.');
            console.log(error);
          })
          .finally(() => {
            this.loadingFiles = false;
          });
      }
    }
  }
};
</script>

<style scoped>
  .v-btn {
    text-transform: none !important;
  }

</style>
