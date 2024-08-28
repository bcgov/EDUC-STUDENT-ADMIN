<template>
  <v-container
    fluid
  >
    <v-row
      style="background-color:white;"
    >
      <v-col class="pa-5">
        <v-data-table
          id="dataTable"
          v-model:page="pageNumber"
          v-model:items="bandCodeList"
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :search="search"
          :loading="dataLoading"
          :sort-by="sortBy"
          @click:row="editBandData"
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
        </v-data-table>
      </v-col>
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
    <v-dialog
      v-model="openBandCodeDialog"
      width="30em"
    >
      <v-card>
        <v-card-title
          class="header pt-1 pb-1"
        >
          <slot name="title">
            Edit Band Information
          </slot>
        </v-card-title>
        <v-card-text>
          <v-text-field
            id="bandCode"
            v-model="editBandRecord.bandCode"
            class="pt-0 pb-5"
            label="Band Code"
            variant="underlined"
            disabled
            hide-details="auto"
          />
          <v-text-field
            id="bandLabel"
            v-model="editBandRecord.label"
            class="pt-0 pb-5"
            maxlength="30"
            label="Band Name"
            variant="underlined"
            hide-details="auto"
          />
          <v-text-field
            id="bandLabel"
            v-model="editBandRecord.description"
            class="pt-0 pb-5"
            maxlength="255"
            label="Description"
            variant="underlined"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
          <PrimaryButton
            id="rejectBtn"
            secondary
            text="Cancel"
            @click-action="openBandCodeDialog = false"
          />
          <PrimaryButton
            id="resolveBtn"
            text="Save"
            @click-action="saveBandData"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import {appStore} from '@/store/modules/app';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {deepCloneObject} from '@/utils/common';


export default {
  name: 'BandCodes',
  components: {
    PrimaryButton,
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
        {title: 'Band Code', value: 'bandCode', align: 'start', tooltip: 'Band Code', key: 'bandCode'},
        {title: 'Band Name', value: 'label', tooltip: 'Band Name', key: 'label'},
        {title: 'Description', value: 'description', tooltip: 'Description', key: 'description'}
      ],
      sortBy: [
        {
          'key': 'bandCode',
          'order': 'asc'
        }
      ],
      openBandCodeDialog: false,
      dataLoading: true,
      editBandRecord: null,
      bandCodeList: []
    };
  },
  created() {
    appStore().getInstituteCodes();
    this.loadBandCodes();
  },
  computed: {
    ...mapState(sdcCollectionStore, ['bandCodes']),
  },
  methods: {
    deepCloneObject,
    editBandData(event, band){
      this.editBandRecord = this.deepCloneObject(band.item.raw);
      this.openBandCodeDialog = true;
    },
    loadBandCodes(){
      sdcCollectionStore().getLatestBandCodes().then(() => {
        this.bandCodeList = this.bandCodes.filter(bandCode => bandCode.bandCode !== null);
        this.dataLoading = false;
      });
    },
    saveBandData(){
      this.dataLoading = true;
      ApiService.apiAxios.put(`${Routes.sdc.SDC_BAND_CODES}`, this.editBandRecord)
        .then(() => {
          this.setSuccessAlert('Success! The band information has been updated.');
          this.loadBandCodes();
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the band code changes. Please try again later.');
        })
        .finally(() => {
          this.dataLoading = false;
          this.openBandCodeDialog = false;
        });
    }
  }
};
</script>

<style scoped>
:deep(.v-data-table-header__content){
  font-weight: bold;
}

:deep(#dataTable > div.v-table__wrapper > table > tbody > tr:hover > td){
  background-color: #e8e8e8;
}
</style>
