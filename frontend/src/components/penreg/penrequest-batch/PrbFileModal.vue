<template>
  <v-dialog
      id="prbFileModal"
      v-model="isFileViewerOpen"
      max-width="85%"
  >
    <v-card class="studentDetailDialogCard fill-height ma-0 px-4 pb-4">
      <v-card-title class="px-0 pb-0 pt-5">
      </v-card-title>
      <div v-if="!loading" class="file-header-box">
        <span>{{`File: ${penWebBlob.fileName}`}}</span>
        <span>{{`Mincode: ${penWebBlob.mincode}`}}</span>
        <span>{{`Submission #: ${penWebBlob.submissionNumber}`}}</span>
      </div>
      <v-progress-linear
          indeterminate
          color="blue"
          :active="loading"
      ></v-progress-linear>
      <div class="text-area-box">
        <LinedTextArea v-if="!loading" :value="penWebBlob.fileContents"></LinedTextArea>
      </div>
      <div class="action-buttons-box">
        <PrimaryButton
            id="closeFileViewer"
            text="Close"
            @click.native="isFileViewerOpen=false">
        </PrimaryButton>
      </div>
    </v-card>
  </v-dialog>
</template>
<script>
import alertMixin from '@/mixins/alertMixin';
import LinedTextArea from '../../util/LinedTextArea.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
export default {
  name: 'PrbFileModal',
  components: {
    PrimaryButton,
    LinedTextArea,
  },
  mixins: [alertMixin],
  props: {
    submissionNumber: {
      type: String,
      required: false,
    },
    openDialog: {
      type: Boolean,
      default: true,
    }
  },
  mounted() {
    this.isFileViewerOpen = this.openDialog;
    this.loadPenWebBlob();
  },
  watch: {
    openDialog(val) {
      this.isFileViewerOpen = val;
    },
    isFileViewerOpen(newValue) {
      if(!newValue && this.openDialog) {
        this.$emit('closeDialog');
      }
    },
    submissionNumber(val) {
      this.submissionNumber = val;
      this.loadPenWebBlob();
    },
  },
  data() {
    return {
      isFileViewerOpen: this.openDialog,
      loading: false,
      penWebBlob: {},
    };
  },
  methods: {
    loadPenWebBlob() {
      this.loading = true;
      const req = {
        params: {
          submissionNumber: this.submissionNumber,
          fileType: 'PEN'
        }
      };
      ApiService.apiAxios
        .get(Routes.penRequestBatch.SOURCE_URL, req)
        .then(response => {
          if (response.data && response.data.length > 0) {
            this.penWebBlob = response.data[0];
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the pen web blob. Please try again later.');
        })
        .finally(() => (this.loading = false));
    },
  }
};

</script>

<style scoped>
.file-header-box{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0px 6px 4px 6px;
  font-size: 0.8em;
}
.text-area-box {
  display: block;
  position: relative;
  width: 100%;
  min-height: 600px;
}
.action-buttons-box {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
