<template>
  <v-container fluid class="full-height px-0">
    <v-dialog
      max-width="30rem"
      max-height="50rem"
      v-model="dialog"
      xl="2" lg="2" md="2" xs="2" sm="2"
    >
      <DocumentUpload
        @upload="upload"
        @close:form="() => dialog = false"
      ></DocumentUpload>
    </v-dialog>
    <v-row dense no-gutters>
      <v-col cols="12">
        <v-card flat v-if="items || processing" class="ma-2">
          <v-card-title>
            Nominal Roll - {{ currentYear }} - Sanity Check
            <v-spacer></v-spacer>
            <PrimaryButton v-if="items" title="process nominal roll file" text="Process" :loading="processStudentsLoading" :disabled="processing"
                           @click.native="processNominalRollStudents()"></PrimaryButton>
          </v-card-title>
          <v-progress-linear
            v-model="progress"
            :active="processing"
            buffer-value="0"
            query
            stream
          >
          </v-progress-linear>
          <v-data-table dense v-if="items"
                        :headers="headers"
                        :items="items"

                        class="fill-height"
                        :items-per-page="10"
                        :footer-props="{
                      'items-per-page-options': [10]
                      }"
          >
            <v-card-actions></v-card-actions>

          </v-data-table>
        </v-card>
        <spinner flat class="ma-2" v-if="loading"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DocumentUpload from '../common/DocumentUpload';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner';
import {LocalDate} from '@js-joda/core';
import PrimaryButton from '@/components/util/PrimaryButton';
import router from '../../router';
import {
  NOMINAL_ROLL_STUDENT_STATUS_CODES,
} from '@/utils/constants';

export default {
  name: 'NominalRoll',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    Spinner,
    DocumentUpload
  },
  data() {
    return {
      currentYear: LocalDate.now().year(),
      dialog: false,
      search: '',
      headers: [
        {text: 'School District', value: 'schoolDistrictNumber',},
        {text: 'School Number', value: 'schoolNumber',},
        {text: 'School Name', value: 'schoolName',},
        {text: 'LEA/Provincial', value: 'leaProvincial',},
        {text: 'Recipient Number', value: 'recipientNumber'},
        {text: 'Recipient Name', value: 'recipientName'},
        {text: 'Surname', value: 'surname'},
        {text: 'Given Name(s)', value: 'givenNames'},
        {text: 'Gender', value: 'gender'},
        {text: 'Birth Date', value: 'birthDate'},
        {text: 'Grade', value: 'grade'},
        {text: 'FTE', value: 'fte'},
        {text: 'Band of Residence', value: 'bandOfResidence'},
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
      if(this.processing) {
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
  beforeDestroy () {
    if(this.interval) {
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
        if(res.data.length === 0) {
          this.dialog = true; // there is no file in process show the dialog to upload a new file.
        } else {
          const loadedCount = res.data.find(item => item.status === NOMINAL_ROLL_STUDENT_STATUS_CODES.ERROR)?.count || 0;
          if(loadedCount === 0) {
            if(this.interval) {
              this.progress = 100;
              clearInterval(this.interval);
            }
            router.push({name:'nrStudentList'});
          } else {
            this.processing = true;
            const allCount = res.data.reduce((acc, item) => {
              return acc + item.count;
            }, 0);
            this.progress = Math.floor((allCount - loadedCount)/allCount * 100);
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
