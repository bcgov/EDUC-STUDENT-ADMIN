<template>
  <div>
    <v-dialog
      max-width="30rem"
      max-height="50rem"
      v-model="dialog"
      xl="2" lg="2" md="2" xs="2" sm="2"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          rounded
          class="ma-1 white--text order-first"
          color="#0C7CBA"
          v-on="on"
        >
          <v-icon left>fa-paperclip</v-icon>
          Upload
        </v-btn>
      </template>
      <DocumentUpload
        @upload="upload"
        @close:form="() => dialog = false"
      ></DocumentUpload>
    </v-dialog>
    <v-card v-if="getHeaders().length>0">
      <v-card-title>
        Nominal Roll
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table dense :key="dataTableKey" v-if="getHeaders().length>0"
                    :headers="getHeaders()"
                    :items="items"
                    :search="search"
                    class="fill-height"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td v-for="(value) in item">{{ value }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

  </div>
</template>

<script>
import DocumentUpload from '../common/DocumentUpload';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'NominalRoll',
  mixins: [alertMixin],
  components: {
    DocumentUpload
  },
  data() {
    return {
      dialog: false,
      search: '',
      headers: [],
      items: [],
      dataTableKey: 0,
      filters: {}
    };
  },
  methods: {
    async upload(document) {
      try {
        const res = await ApiService.apiAxios.post(Routes.nominalRoll.ROOT_ENDPOINT, document);
        this.headers = res.data.headers;
        this.items = res.data.nominalRollStudents;
        this.dialog = false;
        console.info(this.items);
        this.dataTableKey += 1;
      } catch (e) {
        console.error(e);
        console.error(e.response);
        this.dialog = false;
        this.setFailureAlert(e.response?.data?.message || e.message);
      }
    },
    getHeaders() {
      if (this.headers.length > 0) {
        const headerData = [];
        for (const header of this.headers) {
          headerData.push({
            text: header,
            value: header,
            filterable: true,
            sortable: false
          });
        }
        return headerData;
      }
      return [];
    }
  }
};
</script>
