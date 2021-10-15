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
        <v-card v-if="items" class="ma-2">
          <v-card-title>
            Nominal Roll - {{ currentYear }} - Sanity Check
            <v-spacer></v-spacer>
            <PrimaryButton title="process nominal roll file" text="Process"
                           @click.native="processNominalRollStudents()"></PrimaryButton>
          </v-card-title>
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
        <spinner class="ma-2" v-if="loading"/>
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
        {text: 'Identity', value: 'identity'},
        {text: 'Surname', value: 'surname'},
        {text: 'Given Name(s)', value: 'givenNames'},
        {text: 'Initial', value: 'initial'},
        {text: 'Gender', value: 'gender'},
        {text: 'Birth Date', value: 'birthDate'},
        {text: 'Grade', value: 'grade'},
        {text: 'FTE', value: 'fte'},
        {text: 'Band of Residence', value: 'bandOfResidence'},
      ],
      items: undefined,
      filters: {},
      loading: false,
      schoolDistrictNumberSearch:'',
    };
  },
  async mounted() {
    try {
      const res = await ApiService.apiAxios.get(Routes.nominalRoll.ROOT_ENDPOINT);

    } catch (e) {
      if (e.response?.status === 404) {
        this.dialog = true; // there is no file in process show the dialog to upload a new file.
      } else {
        console.error(e);
        this.setFailureAlert('Could not load page please try again later.');
      }
    }

  },
  methods: {
    async processNominalRollStudents() {

    },
    async upload(document) {
      try {
        this.items = undefined;
        this.loading = true;
        const res = await ApiService.apiAxios.post(Routes.nominalRoll.ROOT_ENDPOINT, document);
        this.items = res.data.nominalRollStudents;
      } catch (e) {
        console.error(e);
        console.error(e.response);
        this.setFailureAlert(e.response?.data?.message || e.message);
      } finally {
        this.dialog = false;
        this.loading = false;
      }
    },
    clearSearch() {
    }
  }
};
</script>
