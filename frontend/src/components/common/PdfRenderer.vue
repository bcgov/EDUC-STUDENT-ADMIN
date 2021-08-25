<template>
  <v-row justify="center">
    <v-col>
      <v-dialog v-model="PDFRenderDialog"
                max-width="90%"
                persistent
      >
        <v-card>
          <v-list-item>
            <v-list-item-content class="pt-4 pl-2">
              <slot name="headLine">
                <v-list-item-title class="headline">
                  PDF Document viewer
                </v-list-item-title>
              </slot>
            </v-list-item-content>
            <v-list-item-icon>
              <v-btn id="closePDFRendererModalBtn" text icon @click="[makeSourceNull, $emit('closeDialog')]">
                <v-icon large color="#38598A">mdi-close</v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
          <v-spacer/>
          <v-card-text>
            <v-row v-if="isLoading"
                   class="fill-height ma-0"
                   align="center"
                   justify="center"
            >
              <v-progress-circular
                :size="70"
                :width="7"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </v-row>
            <v-row justify="center" v-if="!isLoading">
              <div class="info-div" >
                <span class="info-span" > {{page}}/{{numPages}}</span>
                <v-btn :disabled="page >= numPages" :class="'button-hover white--text'" small color="#003366" class="ml-2 mr-2" @click="page += 1">&#x2b;</v-btn>
                <v-btn :disabled="page < 2 " :class="'button-hover white--text'" small color="#003366" class="mr-2" @click="page -= 1">&#8722;</v-btn>
              </div>
            </v-row>
            <v-spacer></v-spacer>
            <v-row justify="center" v-if="!isLoading">
              <div class="pdf-div" >
                <pdf ref="pdf" class="pdf-section"  :src="src" :page="page"
                     :rotate="rotate" @progress="loadedRatio = $event" @num-pages="numPages = $event"
                     @link-clicked="page = $event"></pdf>
              </div>
            </v-row>
          </v-card-text>
        </v-card>

      </v-dialog>
    </v-col>

  </v-row>
</template>

<script>
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import pdf from 'vue-pdf';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'PdfRenderer',
  mixins: [alertMixin],
  components: {
    pdf
  },
  data() {
    return {
      currentPage: 0,
      pageCount: 0,
      src: undefined,
      loadedRatio: 0,
      page: 1,
      numPages: 0,
      rotate: 0,
      isLoading: true,
      PDFRenderDialog: false,
      documentID: '',
    };
  },
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    requestId: {
      type: String,
      required: true
    },
    requestType: {
      type: String,
      required: true
    },
    documentId: {
      type: String,
      required: true
    }
  },
  watch: {
    dialog(newValue) {
      this.PDFRenderDialog = newValue;
    },
    documentId(newValue) {
      this.documentID = newValue;
      this.isLoading = true;
      this.src = undefined;
      if (this.documentID?.length > 0) {
        let config = {
          responseType: 'arraybuffer'
        };
        ApiService.apiAxios.get(`${Routes[this.requestType].ROOT_ENDPOINT}/${this.requestId}/documents/${this.documentId}`, config).then((response) => {
          const bytes = new Uint8Array(response.data);
          const binary = bytes.reduce((data, b) => data + String.fromCharCode(b), '');
          this.src = 'data:application/pdf;base64,' + btoa(binary);
        }).catch(e => {
          console.error(e);
          this.setFailureAlert('Could not load document. Please try again later.');
        }).finally(() => {
          this.isLoading = false;
        });
      }
    }
  },
  methods: {
    makeSourceNull() {
      this.src = undefined;
    }
  }
};
</script>

<style scoped>
.info-div{
  width: 65%;
  margin-left: 42%;
}
.info-span{
  width: 3em;
  margin-bottom: 1em;
  text-align: right;
}
.pdf-div{
  width: 65%;
  margin-top: 0.2em;
}
.pdf-section{
  border: 2px solid #003366;
}
</style>
