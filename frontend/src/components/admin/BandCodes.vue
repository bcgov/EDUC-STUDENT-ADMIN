<template>
  <v-container
    fluid
    class="px-0 mb-4"
  >
    <v-row
      no-gutters
      style="background-color:white;"
    >
      <v-col>
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
  </v-container>
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
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import {appStore} from '@/store/modules/app';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import PrimaryButton from '@/components/util/PrimaryButton.vue';


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
      dataLoading: false,
      editBandRecord: null,
      bandCodeList: []
    };
  },
  created() {
    appStore().getInstituteCodes();
    sdcCollectionStore().getCodes().then(() => {
      this.bandCodeList = this.bandCodes.filter(bandCode => bandCode.bandCode !== null);
    });
  },
  computed: {
    ...mapState(sdcCollectionStore, ['bandCodes']),
  },
  methods: {
    editBandData(event, band){
      this.editBandRecord = band.item.raw;
      this.openBandCodeDialog = true;
    }
  }
};
</script>

<style scoped>
:deep(.v-data-table-header__content){
  font-weight: bold;
}

</style>
