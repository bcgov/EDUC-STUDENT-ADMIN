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
                        @click.native="searchPenCoordinators"></PrimaryButton>
        </v-col>
      </v-sheet>
    </v-form>
      <v-row no-gutters class="py-2" style="background-color:white;">
        <div id="pen-coordinator-list" class="px-3" style="width: 100%" :overlay="false">
          <v-form v-model="isValidPenCoordForm">
            <v-data-table
              id="dataTable"
              class="pen-coordinator-table"
              :headers="headers"
              :items="searchResult"
              :page.sync="pageNumber"
              :items-per-page="itemsPerPage"
              hide-default-footer
              item-key="penRequestBatchID"
              :loading="dataLoading"
              @page-count="pageCount = $event"
              @current-items="setCurrentItems"
            >
              <template v-slot:item="props">
                <tr @mouseover="enableActions(props.item)" @mouseleave="disableActions()" @click="clickCoordinatorText(props.item)">
                  <td v-for="header in props.headers" :key="header.id" @mouseover="enableEdit(header)" @mouseleave="disableEdit()">
                    <v-row
                      no-gutters
                      v-if="header.editable && hoveredOveredRowID === props.item.mincode && ((hoveredOveredHeader === header.value && !dataLoading) || hasEdits(header.value))"
                    >
                      <v-col cols="9">
                        <v-text-field
                          dense
                          outlined
                          v-model="props.item[header.value]"
                          :maxlength="header.maxLength"
                          :rules="header.rules"
                          :disabled="dataLoading"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="2">
                        <TertiaryButton
                          :id="`revert-${header.value}`"
                          :class="[{'revert-action': !hasEdits(header.value) || dataLoading}, 'ml-3', 'mt-2']"
                          short
                          text="Revert"
                          @click.native="revertField(header.value)"
                        ></TertiaryButton>
                      </v-col>
                    </v-row>
                    <div v-else-if="header.value === 'actions'">
                      <PrimaryButton
                        id="cancel-action"
                        class="mr-2"
                        short 
                        secondary
                        text="Cancel"
                        :disabled="!hasAnyEdits() || dataLoading"
                        @click.native="clickCancel"
                        v-if="hoveredOveredRowID === props.item.mincode"
                      ></PrimaryButton>
                      <PrimaryButton
                        id="save-action"
                        short 
                        text="Save"
                        :disabled="!hasAnyEdits() || !isValidPenCoordForm || dataLoading"
                        :loading="dataLoading"
                        @click.native="clickSave"
                        v-if="hoveredOveredRowID === props.item.mincode"
                      ></PrimaryButton>
                    </div>
                    <span v-else>{{props.item[header.value]}}</span>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-form>
          <Pagination
            :value="pageNumber"
            :dataResponse="penCoordinatorPage"
            @input="changePage"
          />
        </div>
      </v-row>
      <ConfirmationDialog ref="confirmationDialog">
        <template v-slot:message>
          <v-col class="mt-n6">
            <v-row class="mt-n2 mb-0">
              You have unsaved changes. Do you wish to proceed and cancel changes?
            </v-row>
          </v-col>
        </template>
      </ConfirmationDialog>
  </v-container>
</template>

<script>
import {Routes} from '@/utils/constants';
import {mapState, mapGetters} from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import TertiaryButton from '../../util/TertiaryButton';
import ConfirmationDialog from '../../util/ConfirmationDialog';
import Pagination from '@/components/util/Pagination';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {
  isNotEmptyInputParams,
  isValidMincode,
  isValidEmail,
} from '@/utils/validation';
import {deepCloneObject, setEmptyInputParams} from '@/utils/common';

export default {
  name: 'PenCoordinatorsDisplay',
  components: {
    PrimaryButton,
    TertiaryButton,
    ConfirmationDialog,
    Pagination
  },
  mixins: [alertMixin],
  data() {
    return {
      searchParams: { 
        mincode: null,
        schoolName: null,
      },
      validSearchParams: null,
      searchEnabled: false,
      
      mincodeRules: [ v => (!v || this.isValidDistrictOrMincode(v)) || 'Invalid district or mincode'],
      isValidSearchForm: false,

      pageNumber: 1,
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        { text: 'Mincode', value: 'mincode', sortable: false, align: 'start', tooltip: 'Mincode' },
        { text: 'School', value: 'schoolName', sortable: false, tooltip: 'School Name' },
        { text: 'PEN Contact Name', value: 'penCoordinatorName', sortable: false, tooltip: 'PEN Contact Name', editable: true, maxLength: '40', rules: [v => v?.trim().length >= 1 || 'Required']},
        { text: 'Email', value: 'penCoordinatorEmail', sortable: false, tooltip: 'Eamil', editable: true, maxLength: '100', rules: [v => isValidEmail(v) || 'Valid Email Required']},
        { value: 'actions', sortable: false },
      ],
      isValidPenCoordForm: false,
      penCoordinators: [],
      searchResult: [],
      hoveredOveredRowID: null,
      hoveredOveredRow: null,
      hoveredOveredHeader: null,
      originalPenCoordinators: [],
      dataLoading: false,
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapGetters('auth', ['EDIT_PEN_COORDINATOR_INFO_ROLE']),
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
    },
    originalPenCoordinator() {
      return this.originalPenCoordinators.find(coord => coord.mincode === this.hoveredOveredRowID);
    }
  },
  created() {
    this.$store.dispatch('app/getCodes');
  },
  mounted() {
    this.loadPenCoords();
  },
  beforeRouteLeave(to, from, next) {
    this.openConfirmation(() => next(), () => next(false));
  },
  methods: {
    searchHasValues(){
      this.searchEnabled = isNotEmptyInputParams(this.searchParams);
      return this.searchEnabled;
    },
    enterPushed() {
      if (this.isValidSearchForm && this.searchHasValues()) {
        this.searchPenCoordinators();
      }
    },
    searchPenCoordinators() {
      this.openConfirmation(() => {
        this.validSearchParams = deepCloneObject(this.searchParams);
        
        if(this.validSearchParams.mincode && this.validSearchParams.mincode.length < 8) {
          this.validSearchParams.districtNumber = this.validSearchParams.mincode;
          this.validSearchParams.mincode = null;
        } 
        this.validSearchParams = _.pickBy(this.validSearchParams, _.isString);
        this.searchResult = _.filter(this.penCoordinators, this.validSearchParams);
        this.pageNumber = 1;
      });
    },
    clearSearchParams() {
      this.openConfirmation(() => {
        setEmptyInputParams(this.searchParams);
        this.validSearchParams = null;
        this.searchEnabled = false;
        this.searchResult = this.penCoordinators;
        this.pageNumber = 1;
      });
    },
    isValidMincode,
    isValidDistrictOrMincode(v) {
      return (isValidMincode(v) && (v.length === 3 || v.length === 8));
    },
    loadPenCoords() {
      this.dataLoading = true;
      ApiService.apiAxios
        .get(`${Routes.SCHOOL_DATA_URL}/penCoordinators`)
        .then(response => {
          if (response.data) {
            this.penCoordinators = response.data;
            this.searchResult = _.filter(this.penCoordinators, this.validSearchParams);
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the PEN contact data. Please try again later.');
        })
        .finally(() => (this.dataLoading = false));
    },
    enableActions(item) {
      if(!this.hasAnyEdits() && !this.dataLoading && this.EDIT_PEN_COORDINATOR_INFO_ROLE) {
        this.hoveredOveredRowID = item.mincode;
        this.hoveredOveredRow = item;
      }
    },
    disableActions() {
      if(!this.hasAnyEdits() && !this.dataLoading) {
        this.resetHoveredOveredRow();
      }
    },
    resetHoveredOveredRow() {
      this.hoveredOveredRowID = null;
      this.hoveredOveredRow = null;
    },
    openConfirmation(cancel, save) {
      if(this.hasAnyEdits() && !this.dataLoading) {
        this.$refs.confirmationDialog.open(null, null, {
          color: '#fff', width: 480, closeIcon: true, dark: false, resolveText: 'Save Changes', resolveDisabled: !this.isValidPenCoordForm
        }).then((result) => {
          if (result) {
            this.clickSave();
            save && save();
          } else {
            this.clickCancel();
            cancel && cancel();
          }
        });
      } else {
        cancel && cancel();
      }
    },
    clickCoordinatorText(item) {
      if(this.hasAnyEdits() &&  this.hoveredOveredRowID != item.mincode && !this.dataLoading) {
        this.openConfirmation();
      }
    },
    enableEdit(header) {
      this.hoveredOveredHeader = header.value;
    },
    disableEdit() {
      this.hoveredOveredHeader = null;
    },
    hasEdits(key) {
      let current = this.hoveredOveredRow?.[key] || '';
      let original = this.originalPenCoordinator?.[key] || '';
      return this.hoveredOveredRow && this.originalPenCoordinator && (current !== original);
    },
    hasAnyEdits() {
      return this.hoveredOveredRow && this.originalPenCoordinator && (JSON.stringify(this.hoveredOveredRow) !== JSON.stringify(this.originalPenCoordinator));
    },
    revertField(key) {
      this.hoveredOveredRow[key] = this.originalPenCoordinator[key];
    },
    clickCancel() {
      Object.assign(this.hoveredOveredRow, this.originalPenCoordinator);
    },
    clickSave() {
      this.dataLoading = true;
      ApiService.apiAxios
        .put(`${Routes.SCHOOL_DATA_URL}/${this.hoveredOveredRow.mincode}/penCoordinator`, this.hoveredOveredRow)
        .then(() => {
          this.resetHoveredOveredRow();
          this.loadPenCoords();
          this.setSuccessAlert('Success! The PEN contact data has been updated.');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while updating the PEN contact data. Please try again later.');
          console.error(error);
          this.dataLoading = false;
        });
    },
    setCurrentItems(items) {
      this.originalPenCoordinators = deepCloneObject(items);
    },
    updatePenCoordInList(updated, list) {
      let record = list.find(coord => coord.mincode === updated.mincode);
      record && Object.assign(record, updated);
    },
    changePage(newPageNumber) {
      this.openConfirmation(() => {
        this.pageNumber = newPageNumber;
      });
    },
  }
};
</script>

<style scoped>
  .v-select-list/deep/.v-list-item__mask {
    color: rgb(0, 0, 0);
    font-weight: bold;
    background: rgba(238, 238, 238, 0.02);
  }

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
    background-color: #E1F5FE;
  }

  #dataTable.pen-coordinator-table /deep/ .v-text-field__details{
    min-height: 0;
    margin-bottom: 0;
  }
  
  #dataTable.pen-coordinator-table /deep/ .v-messages{
    min-height: 0;
  }

  .pen-coordinator-table /deep/ tr td:nth-child(1) {
    width: 10%;
  }
  .pen-coordinator-table /deep/ tr td:nth-child(2),
  .pen-coordinator-table /deep/ tr td:nth-child(3) {
    width: 22%;
  }
  .pen-coordinator-table /deep/ tr td:nth-child(4) {
    width: 31%;
  }
  .pen-coordinator-table /deep/ tr td:nth-child(5) {
    width: 15%;
  }

  .revert-action {
    visibility: hidden;
  }
  
</style>
