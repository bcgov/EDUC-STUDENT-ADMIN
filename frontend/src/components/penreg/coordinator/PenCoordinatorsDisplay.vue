<template>
  <v-container
    fluid
    class="px-0 mb-4"
  >
    <v-row
      no-gutters
      style="background-color:white;"
    >
      <div
        id="pen-coordinator-list"
        class="px-3"
        style="width: 100%"
        :overlay="false"
      >
        <v-form v-model="isValidPenCoordForm">
          <v-data-table
            id="dataTable"
            v-model:page="pageNumber"
            class="pen-coordinator-table"
            :headers="headers"
            :items="searchResult"
            :search="search"
            :items-per-page="itemsPerPage"
            hide-default-footer
            item-key="penRequestBatchID"
            :loading="dataLoading"
            @page-count="pageCount = $event"
          >
            <template #top>
              <v-text-field
                v-model="search"
                clearable
                hide-details="auto"
                label="Search"
                class="pa-4"
              />
            </template>
            <template #item="item">
              <tr
                @mouseover="enableActions(item.item.raw)"
                @mouseleave="disableActions()"
                @click="clickCoordinatorText(item.item.raw)"
              >
                <td
                  v-for="header in headers"
                  :key="header.id"
                  @mouseover="enableEdit(header)"
                  @mouseleave="disableEdit()"
                >
                  <v-row
                    v-if="header.editable && hoveredOveredRowID === item.item.raw.mincode && ((hoveredOveredHeader === header.value && !dataLoading) || hasEdits(header.value))"
                    no-gutters
                  >
                    <v-col cols="9">
                      <v-text-field
                        v-model="item.item.raw[header.value]"
                        variant="outlined"
                        class="mt-5"
                        density="compact"
                        :maxlength="header.maxLength"
                        :rules="header.rules"
                        :disabled="dataLoading"
                      />
                    </v-col>
                    <v-col cols="2">
                      <TertiaryButton
                        :id="`revert-${header.value}`"
                        :class-modifier="[{'revert-action': !hasEdits(header.value) || dataLoading}, 'ml-3', 'mt-6']"
                        short
                        text="Revert"
                        @click-action="revertField(header.value)"
                      />
                    </v-col>
                  </v-row>
                  <div v-else-if="header.value === 'actions'">
                    <PrimaryButton
                      v-if="hoveredOveredRowID === item.item.raw.mincode"
                      id="cancel-action"
                      class="mr-2"
                      secondary
                      short
                      text="Cancel"
                      :disabled="!hasAnyEdits() || dataLoading"
                      :click-action="clickCancel"
                    />
                    <PrimaryButton
                      v-if="hoveredOveredRowID === item.item.raw.mincode"
                      id="save-action"
                      short
                      text="Save"
                      :disabled="!hasAnyEdits() || !isValidPenCoordForm || dataLoading"
                      :loading="dataLoading"
                      :click-action="clickSave"
                    />
                  </div>
                  <span v-else>{{ item.item.raw[header.value] }}</span>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-form>
      </div>
    </v-row>
    <ConfirmationDialog ref="confirmationDialog">
      <template #message>
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
import {mapState} from 'pinia';
import PrimaryButton from '../../util/PrimaryButton.vue';
import TertiaryButton from '../../util/TertiaryButton.vue';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {
  isValidEmail,
} from '@/utils/validation';
import {deepCloneObject} from '@/utils/common';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import _ from 'lodash';

export default {
  name: 'PenCoordinatorsDisplay',
  components: {
    PrimaryButton,
    TertiaryButton,
    ConfirmationDialog
  },
  mixins: [alertMixin],
  data() {
    return {
      search: null,
      pageNumber: 1,
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        {title: 'Mincode', value: 'mincode', sortable: false, align: 'start', tooltip: 'Mincode', key: 'mincode'},
        {title: 'School', value: 'schoolName', sortable: false, tooltip: 'School Name', key: 'schoolName'},
        {
          title: 'PEN Contact Name',
          value: 'penCoordinatorName',
          sortable: false,
          tooltip: 'PEN Contact Name',
          key: 'penCoordinatorName',
          editable: true,
          maxLength: '40',
          rules: [v => v?.trim().length >= 1 || 'Required']
        },
        {
          title: 'Email',
          value: 'penCoordinatorEmail',
          sortable: false,
          tooltip: 'Eamil',
          editable: true,
          key: 'penCoordinatorEmail',
          maxLength: '100',
          rules: [v => isValidEmail(v) || 'Valid Email Required']
        },
        {value: 'actions', sortable: false},
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
    ...mapState(appStore, ['schoolApiMincodeSchoolNames']),
    ...mapState(authStore, ['EDIT_PEN_COORDINATOR_INFO_ROLE']),
    schools() {
      return _.sortedUniq([...this.schoolApiMincodeSchoolNames.values()].sort());
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
    appStore().getCodes();
  },
  mounted() {
    this.loadPenCoords();
  },
  beforeRouteLeave(to, from, next) {
    this.openConfirmation(() => next(), () => next(false));
  },
  methods: {
    loadPenCoords() {
      this.dataLoading = true;
      ApiService.apiAxios
        .get(`${Routes.SCHOOL_DATA_URL}/penCoordinators`)
        .then(response => {
          if (response.data) {
            this.penCoordinators = response.data;
            this.searchResult = _.filter(this.penCoordinators, this.validSearchParams);
            this.setCurrentItems(this.searchResult);
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the PEN contact data. Please try again later.');
        })
        .finally(() => (this.dataLoading = false));
    },
    enableActions(item) {
      if (!this.hasAnyEdits() && !this.dataLoading && this.EDIT_PEN_COORDINATOR_INFO_ROLE) {
        this.hoveredOveredRowID = item.mincode;
        this.hoveredOveredRow = item;
      }
    },
    disableActions() {
      if (!this.hasAnyEdits() && !this.dataLoading) {
        this.resetHoveredOveredRow();
      }
    },
    resetHoveredOveredRow() {
      this.hoveredOveredRowID = null;
      this.hoveredOveredRow = null;
    },
    openConfirmation(cancel, save) {
      if (this.hasAnyEdits() && !this.dataLoading) {
        this.$refs.confirmationDialog.open(null, null, {
          color: '#fff',
          width: 480,
          closeIcon: true,
          dark: false,
          resolveText: 'Save Changes',
          resolveDisabled: !this.isValidPenCoordForm
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
      if (this.hasAnyEdits() && this.hoveredOveredRowID != item.mincode && !this.dataLoading) {
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
.v-select-list /deep/ .v-list-item__mask {
    color: rgb(0, 0, 0);
    font-weight: bold;
    background: rgba(238, 238, 238, 0.02);
}

:deep(.v-data-table-header__content) {
    font-size: 0.875rem;
    font-weight: bold;
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

#dataTable.pen-coordinator-table /deep/ .v-text-field__details {
    min-height: 0;
    margin-bottom: 0;
}

#dataTable.pen-coordinator-table /deep/ .v-messages {
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

:deep(.v-data-table-footer__items-per-page) {
    display: none;
}

.revert-action {
    visibility: hidden;
}

</style>
