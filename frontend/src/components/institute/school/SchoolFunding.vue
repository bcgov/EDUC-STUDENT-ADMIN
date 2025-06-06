<template>
  <div
    id="schoolFunding"
    class="px-0 pt-3 ma-0"
    style="width: 100%;"
  >
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col
        cols="12"
        md="6"
      >
        <v-row>
          <v-col>
            <h3 class="subHeading pt-2 pb-8">
              Current Funding Configuration
            </h3>
          </v-col>
        </v-row>

        <v-row no-gutters v-if="canEditFunding()">
          <v-col class="justify-end d-flex">
            <PrimaryButton
              id="add-action"
              class="pr-4"
              secondary
              text="Add Funding"
              icon-left
              icon="mdi-plus"
              @click-action="addFunding()"
            />
          </v-col>
        </v-row>
        <v-row no-gutters v-else>
          <v-col class="justify-end d-flex">
            <div class="pt-9"></div>
          </v-col>
        </v-row>
        <v-form
          v-model="isValidFundingForm"
          class="mt-6 pb-1 pl-1"
        >
          <v-data-table
            :headers="headers"
            :items="sortedFunding"
            :loading="loading"
            :items-per-page="25"
            class="elevation-1"
            item-value="schoolFundingGroupID"
          >
            <template #item="item">
              <tr>
                <td
                  v-for="header in headers"
                  :key="header.id"
                >
                  <v-row
                    v-if="header.editable && hoveredOveredRowID === item.item.raw.schoolGradeCode && isEditing"
                    no-gutters
                  >
                    <v-col>
                      <v-select
                        v-model="item.item.raw[header.value]"
                        :items="schoolFundingGroups"
                        item-value="schoolFundingGroupCode"
                        item-title="label"
                        variant="underlined"
                        :rules="header.rules"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    v-else-if="header.value === 'actions' && !isEditing && canEditFunding()"
                    no-gutters
                    class="flex-nowrap"
                  >
                    <v-col>
                      <v-btn
                        variant="plain"
                        class="icon-color ml-n3"
                        icon="mdi-pencil-outline"
                        @click="editRow(item)"
                      />
                    </v-col>
                    <v-col>
                      <v-btn
                        variant="plain"
                        class="icon-color ml-n3"
                        icon="mdi-delete-outline"
                        @click="deleteRow(item)"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    v-else-if="header.value === 'actions' && isEditing && hoveredOveredRowID === item.item.raw.schoolGradeCode"
                    no-gutters
                    class="flex-nowrap"
                  >
                    <v-col class="pa-2">
                      <PrimaryButton
                        id="cancel-action"
                        class="pr-4"
                        secondary
                        short
                        text="Cancel"
                        @click-action="cancel"
                      />
                    </v-col>
                    <v-col class="pa-2">
                      <PrimaryButton
                        id="save-action"
                        short
                        text="Save"
                        :loading="loading"
                        @click-action="save(item)"
                      />
                    </v-col>
                  </v-row>
                  <span v-else-if="header.value === 'schoolFundingGroupCode'">{{ item.item.raw['fundingGroupLabel'] }}</span>
                  <span v-else>{{ item.item.raw[header.value] ? item.item.raw[header.value] : '' }}</span>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-form>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <h3 class="subHeading pt-2 pb-2">
          Historic Funding Configurations
        </h3>

        <v-row>
          <v-col
            class="mt-n1 mb-1"
            cols="7"
          >
            <v-select
              v-model="selectedCollectionDate"
              :items="pastCollections"
              item-value="collectionID"
              density="compact"
              item-title="displayDate"
              class="mt-5"
              variant="underlined"
              label="Select Collection"
              @update:model-value="getSnapshotData($event)"
            />
          </v-col>
        </v-row>
        <v-row no-gutters="">
          <v-col>
            <v-data-table
              v-if="showSnapshotData"
              :headers="historicFundingHeaders"
              :items="snapshotData"
              :items-per-page="25"
              :loading="loading"
              class="elevation-1"
              item-value="schoolFundingGroupID"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-bottom-sheet
      v-model="addFundingSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <AddSchoolFunding
        v-if="addFundingSheet"
        :school-i-d="schoolID"
        :funding-groups="schoolFundingGroups"
        :filteredgrade-codes="sortedGrades"
        @close-add-funding="addFundingSheet = !addFundingSheet"
        @save-new-funding-data="saveNewFundingData"
      />
    </v-bottom-sheet>
    <ConfirmationDialog ref="confirmationDialog" />
  </div>
</template>

<script>
import {Routes} from '@/utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {formatDob} from '@/utils/format';
import {mapState} from 'pinia';
import PrimaryButton from '../../util/PrimaryButton.vue';
import {appStore} from '@/store/modules/app';
import {instituteStore} from '@/store/modules/institute';
import AddSchoolFunding from '@/components/institute/school/AddSchoolFunding.vue';
import {sortBy, orderBy} from 'lodash';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import {hasRequiredPermission, PERMISSION} from "@/utils/constants/Permission";
import {authStore} from "@/store/modules/auth";

export default {
  name: 'SchoolFunding',
  components: {
    PrimaryButton,
    AddSchoolFunding,
    ConfirmationDialog
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      funding: [],
      loading: true,
      headers: [
        {title: 'Grade', sortable: false, key: 'gradeLabel', value: 'gradeLabel'},
        {title: 'Funding Group', sortable: false, key: 'fundingGroupLabel', value: 'schoolFundingGroupCode', editable: true, maxLength: '40', rules: [v => v?.trim().length >= 1 || 'Required']},
        {title: 'Last Updated', sortable: false, key: 'updateDate', value: 'updateDate'},
        {title: 'Last Update User', sortable: false, key: 'updateUser', value: 'updateUser'},
        {value: 'actions', sortable: false, key: 'actions'},
      ],
      historicFundingHeaders: [
        {title: 'Grade', sortable: false, key: 'gradeLabel', value: 'gradeLabel'},
        {title: 'Funding Group', sortable: false, key: 'fundingGroupLabel', value: 'fundingGroupLabel'},
        {title: 'Last Updated', sortable: false, key: 'updateDate', value: 'updateDate'},
        {title: 'Last Update User', sortable: false, key: 'updateUser', value: 'updateUser'},
      ],
      hoveredOveredRowID: null,
      hoveredOveredRow: null,
      hoveredOveredHeader: null,
      isValidFundingForm: false,
      schoolFundingGroups: [],
      isEditing: false,
      collectionDates: ['2017/09/30', '2016/09/30'],
      selectedCollectionDate: null,
      showSnapshotData: false,
      snapshotData: [],
      addFundingSheet: false,
      filteredgradeCodes: [],
      sortedGrades: [],
      pastCollections: [],
      sortedFunding: []
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['activeFundingGroups']),
    ...mapState(instituteStore, ['gradeCodes']),
  },
  mounted() {
    instituteStore().getAllGradeCodes();
    appStore().getSdcCodes().then(() => {
      this.schoolFundingGroups = this.activeFundingGroups;
      this.getHistoricalCollectionsForSchool();
      this.loadSchoolsFundingData();
    });
  },
  methods: {
    loadSchoolsFundingData() {
      ApiService.apiAxios.get(`${Routes.institute.FUNDING_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.funding = response.data;
          this.funding.forEach(elem => {
            if(elem) {
              this.mapFundingData(elem);
            }
          });
          this.sortedFunding = sortBy(this.funding, ['displayOrder']);
          let existingGrades = this.sortedFunding.map(grade => grade?.schoolGradeCode);
          this.sortedGrades = sortBy(this.gradeCodes.filter(grade => !existingGrades.includes(grade?.schoolGradeCode)), ['displayOrder']);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    mapFundingData(incomingFundingData) {
      incomingFundingData.gradeLabel = this.gradeCodes?.find(grade => grade?.schoolGradeCode === incomingFundingData?.schoolGradeCode)?.label;
      incomingFundingData.displayOrder = this.gradeCodes?.find(grade => grade?.schoolGradeCode === incomingFundingData?.schoolGradeCode)?.displayOrder;
      incomingFundingData.fundingGroupLabel = this.schoolFundingGroups?.find(group => group.schoolFundingGroupCode === incomingFundingData.schoolFundingGroupCode)?.label;
      incomingFundingData.updateDate = this.formatDate(incomingFundingData.updateDate);
    },
    hasRequiredPermission,
    canEditFunding() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION);
    },
    getHistoricalCollectionsForSchool() {
      ApiService.apiAxios.get(`${Routes.sdc.SDC_SCHOOL_COLLECTION}/search/${this.schoolID}`)
        .then(response => {
          this.pastCollections = response.data;
          this.pastCollections.forEach(collection => {
            collection.formattedCollectionOpenDate = this.formatDate(collection.collectionOpenDate);
            collection.displayDate = this.formatDateYear(collection.collectionOpenDate) + ' - ' + this.capitalize(collection.collectionTypeCode.toLowerCase());
          });
          this.pastCollections = orderBy(this.pastCollections, ['formattedCollectionOpenDate'], ['desc']);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    formatDate(datetime) {
      return formatDob(datetime.substring(0, 10), 'uuuu-MM-dd');
    },
    formatDateYear(datetime) {
      return formatDob(datetime.substring(0, 10), 'uuuu-MM-dd', 'uuuu');
    },
    capitalize(s) {
      return s && s[0].toUpperCase() + s.slice(1);
    },
    cancel() {
      this.isEditing = false;
      this.loadSchoolsFundingData();
    },
    save(item) {
      this.loading = true;
      const schoolFundingGroupID = item.item.raw.schoolFundingGroupID;

      ApiService.apiAxios.put(`${Routes.institute.FUNDING_DATA_URL}/${this.schoolID}/funding/${schoolFundingGroupID}`, item.item.raw)
        .then(() => {
          this.setSuccessAlert('Success! The funding data has been updated for the school.');
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
          this.isEditing = false;
          this.$emit('refreshSchool');
          this.loadSchoolsFundingData();
        });
    },
    editRow(item) {
      this.isEditing = true;
      this.hoveredOveredRowID = item.item.raw.schoolGradeCode;
    },
    deleteRow(item) {
      const opts = {
        color: '#003366',
        dense: false,
        width: 400,
        dark: true,
        titleBold: true,
        resolveText: 'Remove'
      };
      this.$refs.confirmationDialog.open('Please Confirm', 'Are you sure you want to remove this funding configuration?', opts)
        .then((result) => {
          if (!result) {
            return;
          }
          this.loading = true;
          const schoolFundingGroupID = item.item.raw.schoolFundingGroupID;
          ApiService.apiAxios.delete(`${Routes.institute.FUNDING_DATA_URL}/${this.schoolID}/funding/${schoolFundingGroupID}`)
            .then(() => {
              this.setSuccessAlert('Success! The funding data has been removed for the school.');
            }).catch(error => {
              console.error(error);
              this.setFailureAlert(error.response?.data?.message || error.message);
            }).finally(() => {
              this.loading = false;
              this.$emit('refreshSchool');
              this.loadSchoolsFundingData();
            });
        });
    },
    getSnapshotData(collectionId){
      this.loading = true;
      this.showSnapshotData = true;
      ApiService.apiAxios.get(`${Routes.sdc.FUNDING_DATA_SNAPSHOT_URL}/${this.schoolID}/${collectionId}`)
        .then(response => {
          this.snapshotData = response.data;
          this.snapshotData.forEach(elem => {
            if(elem) {
              this.mapFundingData(elem);
            }
          });
          this.snapshotData = sortBy(this.snapshotData, ['displayOrder']);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    addFunding() {
      this.addFundingSheet = !this.addFundingSheet;
    },
    saveNewFundingData(fundingData) {
      this.addFundingSheet = !this.addFundingSheet;
      this.loading = true;

      ApiService.apiAxios.post(`${Routes.institute.FUNDING_DATA_URL}/${this.schoolID}`, fundingData)
        .then(() => {
          this.setSuccessAlert('Success! The funding data has been added for the school.');
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
          this.$emit('refreshSchool');
          this.loadSchoolsFundingData();
        });
    }

  },
};
</script>

<style scoped>
  :deep(.v-data-table-footer) {
    display: none;
  }

  .subHeading {
    color: #38598a;
  }

  .icon-color {
    color: rgb(0, 51, 102);
  }

  .add-funding {
    text-align: end;
  }
</style>



