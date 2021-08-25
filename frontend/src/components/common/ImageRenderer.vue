<template>
  <v-row justify="center">
    <v-col>
      <v-dialog v-model="ImageRenderDialog"
                max-width="65%" width="65%"
                persistent
      >
        <v-card max-height="80%" height="80%">
          <v-list-item>
            <v-list-item-content class="pt-4 pl-2">
              <slot name="headLine">
                <v-list-item-title class="headline">
                  Image viewer
                </v-list-item-title>
              </slot>
            </v-list-item-content>
            <v-list-item-icon>
              <v-btn id="closeImageRendererModalBtn" text icon @click="$emit('closeDialog')">
                <v-icon large color="#38598A">mdi-close</v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
          <v-spacer/>
          <v-card-text >
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

              <v-img :src="this.src" contain>
              </v-img>

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
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'ImageRenderer',
  mixins: [alertMixin],
  data() {
    return {
      src: undefined,
      isLoading: true,
      ImageRenderDialog: false,
      documentID: '',
      width: 400,
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
    imageId: {
      type: String,
      required: true
    }
  },
  watch: {
    dialog(newValue) {
      this.ImageRenderDialog = newValue;
    },
    imageId(newValue) {
      this.documentID = newValue;
      this.isLoading = true;
      this.src = undefined;
      if (this.documentID?.length > 0) {
        let config = {
          responseType: 'arraybuffer'
        };
        ApiService.apiAxios.get(`${Routes[this.requestType].ROOT_ENDPOINT}/${this.requestId}/documents/${this.documentID}`, config).then((response) => {
          const bytes = new Uint8Array(response.data);
          const binary = bytes.reduce((data, b) => data + String.fromCharCode(b), '');
          this.src = 'data:image/jpeg;base64,' + btoa(binary);
        }).catch(e => {
          console.error(e);
          this.setFailureAlert('Could not load image. Please try again later.');
        }).finally(() => {
          this.isLoading = false;
        });
      }
    }
  },
};
</script>
