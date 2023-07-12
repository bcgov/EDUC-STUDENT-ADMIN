<template>
  <v-container
    fluid
    class="full-height px-0"
  >
    <v-dialog
      v-model="dialog"
      max-width="30rem"
      max-height="50rem"
      xl="2"
      lg="2"
      md="2"
      xs="2"
      sm="2"
    >
      <DocumentUpload
        @upload="upload"
        @close:form="() => dialog = false"
      />
    </v-dialog>
    <v-row
      dense
      no-gutters
    >
      <v-col cols="12">
        <v-card
          v-if="items || processing"
          flat
          class="ma-2"
        >
          <v-card-title>
            <v-row>
              <v-col class="d-flex justify-start">
                <span>Nominal Roll - {{ currentYear }} - Sanity Check</span>
              </v-col>
              <v-col class="d-flex justify-end">
                <PrimaryButton
                  v-if="items"
                  title="process nominal roll file"
                  text="Process"
                  :loading="processStudentsLoading"
                  :disabled="processing"
                  @click-action="processNominalRollStudents"
                />
              </v-col>
            </v-row>
          </v-card-title>
          <v-progress-linear
            v-model="progress"
            :active="processing"
            buffer-value="0"
            query
            stream
          />
          <v-data-table
            v-if="items"
            density="compact"
            :headers="headers"
            :items="items"
            class="fill-height mt-4"
            :items-per-page="10"
            :footer-props="{
              'items-per-page-options': [10]
            }"
          >
          </v-data-table>
        </v-card>
        <spinner
          v-if="loading"
          flat
          class="ma-2"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DocumentUpload from '../common/DocumentUpload.vue';
import ApiService from '@/common/apiService';
import {
  Routes,
  NOMINAL_ROLL_STUDENT_STATUS_CODES
} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner.vue';
import {LocalDate} from '@js-joda/core';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import router from '../../router';

export default {
  name: 'NominalRoll',
  components: {
    PrimaryButton,
    Spinner,
    DocumentUpload
  },
  mixins: [alertMixin],
  data() {
    return {
      currentYear: LocalDate.now().year(),
      dialog: false,
      search: '',
      headers: [
        {title: 'School District', text: 'School District', value: 'schoolDistrictNumber', key: 'schoolDistrictNumber'},
        {title: 'School Number', text: 'School Number', value: 'schoolNumber', key: 'schoolNumber'},
        {title: 'School Name', text: 'School Name', value: 'schoolName', key: 'schoolName'},
        {title: 'LEA/Provincial', text: 'LEA/Provincial', value: 'leaProvincial', key: 'leaProvincial'},
        {title: 'Recipient Number', text: 'Recipient Number', value: 'recipientNumber', key: 'recipientNumber'},
        {title: 'Recipient Name', text: 'Recipient Name', value: 'recipientName', key: 'recipientName'},
        {title: 'Surname', text: 'Surname', value: 'surname', key: 'surname'},
        {title: 'Given Name(s)', text: 'Given Name(s)', value: 'givenNames', key: 'givenNames'},
        {title: 'Gender', text: 'Gender', value: 'gender', key: 'gender'},
        {title: 'Birth Date', text: 'Birth Date', value: 'birthDate', key: 'birthDate'},
        {title: 'Grade', text: 'Grade', value: 'grade', key: 'grade'},
        {title: 'FTE', text: 'FTE', value: 'fte', key: 'fte'},
        {title: 'Band of Residence', text: 'Band of Residence', value: 'bandOfResidence', key: 'bandOfResidence'},
      ],
      items: undefined,
      filters: {},
      loading: false,
      schoolDistrictNumberSearch: '',
      processStudentsLoading: false,
      processing: false,
      progress: 0,
      interval: null,
    };
  },
  async mounted() {
    try {
      this.loading = true;
      await this.getProcessStatus();
      if (this.processing) {
        this.setWarningAlert('Nominal roll is currently being processed. Please wait for the process to complete.');
        this.startPollingStatus();
      }
    } catch (e) {
      console.error(e);
      this.setFailureAlert('Could not load page please try again later.');
    } finally {
      this.loading = false;
    }
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  methods: {
    async processNominalRollStudents() {
      this.processStudentsLoading = true;
      try {
        await ApiService.apiAxios.post(Routes.nominalRoll.ROOT_ENDPOINT + '/process', {nominalRollStudents: this.items});
        this.setSuccessAlert('Your request to start processing nominal roll is accepted.');
        this.processing = true;
        this.startPollingStatus();
      } catch (e) {
        console.error(e);
        this.setFailureAlert(e.response?.data?.message || e.message);
      } finally {
        this.processStudentsLoading = false;
      }
    },
    async upload(document) {
      try {
        this.items = undefined;
        this.loading = true;
        const res = await ApiService.apiAxios.post(Routes.nominalRoll.ROOT_ENDPOINT, document);
        this.items = res.data.nominalRollStudents;
      } catch (e) {
        console.error(e);
        this.setFailureAlert(e.response?.data?.message || e.message);
      } finally {
        this.dialog = false;
        this.loading = false;
      }
    },
    async startPollingStatus() {
      this.interval = setInterval(this.getProcessStatus, 20000);  // polling the api every 20 seconds
    },
    async getProcessStatus() {
      try {
        const res = await ApiService.apiAxios.get(Routes.nominalRoll.ROOT_ENDPOINT);
        if (res.data.length === 0) {
          this.dialog = true; // there is no file in process show the dialog to upload a new file.
        } else {
          const loadedCount = res.data.find(item => item.status === NOMINAL_ROLL_STUDENT_STATUS_CODES.LOADED)?.count || 0;
          if (loadedCount === 0) {
            if (this.interval) {
              this.progress = 100;
              clearInterval(this.interval);
            }
            router.push({name: 'nrStudentList'});
          } else {
            this.processing = true;
            const allCount = res.data.reduce((acc, item) => {
              return acc + item.count;
            }, 0);
            this.progress = Math.floor((allCount - loadedCount) / allCount * 100);
          }
        }
      } catch (e) {
        console.error(e);
        this.setFailureAlert('Could not load nominal roll data please try again later.');
      }
    },
  }
};
</script>

<style scoped>
.v-data-table__tr {
    border-bottom-style: groove;
    border-left-style: groove;
    border-right-style: groove;
    border-color: rgb(255 255 255 / 45%);
}

.v-data-table__tr:nth-child(1) {
    border-top-style: groove;
}

:deep(.v-data-table__tr:hover) {
    background-color: #e8e8e8;
    cursor: pointer;
}

:deep(.v-data-table__tr:hover) td {
    background-color: transparent; /* or #000 */
}

:deep(.v-data-table__tr){
    font-size: 0.87em;
}

:deep(.v-data-table-footer__items-per-page){
    display: none;
}

:deep(.v-data-table-header__content){
    font-weight: bold;
    font-size: 0.75em;
}

</style>
