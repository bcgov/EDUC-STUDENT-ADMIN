<template>
  <v-row justify="center">
    <v-col>
      <v-dialog v-model="PDFRenderDialog"
                max-width="80%"
      >
        <v-card>
          <v-card-title class="px-0 pb-0 pt-5">
            <v-list-item>
              <v-list-item-content class="pt-0 pl-2">
                <slot name="headLine">
                  <v-list-item-title class="headline">
                    Document Viewer
                  </v-list-item-title>
                </slot>
              </v-list-item-content>
              <v-list-item-icon class="my-0">
                <v-btn id="closePDFRendererModalBtn" text icon @click="PDFRenderDialog=false">
                  <v-icon large color="#38598A">mdi-close</v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-list-item>
          </v-card-title>
          <v-spacer/>
          <v-card style="min-height: 740px">
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
              <v-spacer></v-spacer>
              <v-row justify="center" v-if="!isLoading">
                <vue-pdf-app page-scale="page-fit" :config="config" v-if="!isLoading" :pdf="arrayBuffer"></vue-pdf-app>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card>

      </v-dialog>
    </v-col>

  </v-row>
</template>

<script>
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import VuePdfApp from 'vue-pdf-app';
import alertMixin from '@/mixins/alertMixin';
import 'vue-pdf-app/dist/icons/main.css';

export default {
  name: 'PdfRenderer',
  mixins: [alertMixin],
  components: {
    VuePdfApp
  },
  data() {
    return {
      arrayBuffer: undefined,
      isLoading: true,
      PDFRenderDialog: false,
      documentID: '',
      config:{
        sidebar: false,
        secondaryToolbar: {
          secondaryPresentationMode: false,
          secondaryOpenFile: false,
          secondaryPrint: false,
          secondaryDownload: false,
          secondaryViewBookmark: false,
          firstPage: false,
          lastPage: false,
          pageRotateCw: true,
          pageRotateCcw: true,
          cursorSelectTool: false,
          cursorHandTool: false,
          scrollVertical: false,
          scrollHorizontal: false,
          scrollWrapped: false,
          spreadNone: false,
          spreadOdd: false,
          spreadEven: false,
          documentProperties: false,
        },
        toolbar: {
          toolbarViewerLeft: {
            findbar: false,
            previous: true,
            next: true,
            pageNumber: false,
          },
          toolbarViewerRight: {
            presentationMode: false,
            openFile: false,
            print: false,
            download: false,
            viewBookmark: false,
          },
          toolbarViewerMiddle: {
            zoomOut: true,
            zoomIn: true,
            scaleSelectContainer: true,
          },
        },
      }
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
      required: false
    },
    documentId: {
      type: String,
      required: true
    },
    route: {
      type: String,
      required: false
    }
  },
  watch: {
    dialog(newValue) {
      this.PDFRenderDialog = newValue;
    },
    PDFRenderDialog(newValue) {
      if(!newValue && this.dialog) {
        this.$emit('closeDialog');
      }
    },
    documentId(newValue) {
      this.documentID = newValue;
      this.isLoading = true;
      this.arrayBuffer = undefined;
      if (this.documentID?.length > 0) {
        let url = (typeof this.route != 'undefined')
          ? `${this.route}/${this.requestId}/documents/${this.documentId}`
          : `${Routes[this.requestType].ROOT_ENDPOINT}/${this.requestId}/documents/${this.documentId}`;
        //console.log('URL IS: ' + url);
        ApiService.apiAxios.get(url).then((response) => {
          console.log('data is: ' + JSON.stringify(response.data));
          this.base64ToArrayBuffer(response.data);
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
    base64ToArrayBuffer(base64) {
      let binary_string = window.atob(base64);
      let len = binary_string.length;
      let bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      this.arrayBuffer = bytes.buffer;
    }
  }
};
</script>

<style>
.pdf-app #outerContainer{
  position: inherit !important;
}
</style>
