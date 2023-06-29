<template>
  <v-card
    class="document-upload mb-1"
    max-width="640px"
    min-width="40em"
    elevation="2"
  >
    <v-card-title><h3>Document Upload</h3></v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        v-model="validForm"
      >
        <v-file-input
          id="selectFileInput"
          color="#003366"
          :accept="fileAccept"
          :rules="fileRules"
          variant="underlined"
          :disabled="hasReadOnlyRoleAccess()"
          placeholder="Select your file"
          hint="JPEG, PNG, CSV, MS-WORD, MS-EXCEL, .STD, .VER and PDF files supported"
          :error-messages="fileInputError"
          class="pt-0"
          @update:model-value="selectFile"
        />
      </v-form>
      <v-alert
        v-model="alert"
        density="compact"
        outlined
        dismissible
        color="#712024"
        style="background-color: #f7d8da !important;"
        :class="alertType"
        class="mb-3"
      >
        {{ alertMessage }}
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <PrimaryButton
        id="cancelUploadButton"
        secondary
        text="Cancel"
        :click-action="closeForm"
      />
      <PrimaryButton
        id="upload_form"
        :key="buttonKey"
        :loading="active"
        :disabled="!dataReady"
        text="Upload"
        width="7rem"
        :click-action="submitRequest"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import {humanFileSize, getFileExtensionWithDot, getFileNameWithMaxNameLength} from '@/utils/file';
import { mapState } from 'pinia';
import PrimaryButton from '../util/PrimaryButton.vue';
import {authStore} from '@/store/modules/auth';
import {edxStore} from '@/store/modules/edx';

export default {
  components: {PrimaryButton},
  props: {
    eager: {
      type: Boolean,
      default: false
    },
    smallFileExtension: {
      type: Boolean,
      default: true
    },
    checkFileRules: {
      type: Boolean,
      default: false
    },
    allowedFileFormat: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      fileAccept: 'xls, xlsx',
      fileRules: [],
      requiredRules: [v => !!v || 'Required'],
      validForm: true,
      fileInputError: [],
      documentTypeCode: null,
      file: null,
      active: false,
      buttonKey: 0,
      uploadFileValue: null,
      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  watch: {
    dataReady() {
      //force re-renders of the button to solve the color issue
      this.buttonKey += 1;
    },
  },
  async created() {
    await edxStore().getFileRequirements();
    await this.getFileRules();
    await this.validateForm();
  },
  computed: {
    ...mapState(authStore, ['NOMINAL_ROLL_READ_ONLY_ROLE']),
    ...mapState(edxStore, ['fileRequirements']),
    dataReady() {
      return this.validForm && this.uploadFileValue;
    },
  },
  methods: {
    makefileFormatList(extensions) {
      extensions = extensions.map(v => v.split(new RegExp('/'))[1]).filter(v => v).map(v => v.toUpperCase());
      if(extensions.length <= 2) {
        return extensions.join(' and ');
      } else {
        const lastTwo = extensions.splice(-2, 2).join(', and ');
        extensions.push(lastTwo);
        return extensions.join(', ');
      }
    },
    hasReadOnlyRoleAccess() {
      return this.NOMINAL_ROLL_READ_ONLY_ROLE === true;
    },
    closeForm() {
      this.resetForm();
      this.$emit('close:form');
    },
    resetForm() {
      this.$refs.form.reset();
      this.fileInputError = [];
      this.uploadFileValue = null;
      this.alert = false;
      this.active = false;
      this.validateForm();
    },
    setSuccessAlert() {
      this.alertMessage = 'File upload successful.';
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    selectFile(file) {
      this.uploadFileValue = file;
      if(file?.length === 0 && !this.active) {
        this.fileInputError = 'Required';
      } else {
        this.fileInputError = [];
        this.alert = false;
      }
    },
    async validateForm() {
      const valid = await this.$refs.form.validate();
      this.isFormValid = valid.valid;
    },
    submitRequest() {
      if(this.dataReady){
        try {
          if(this.uploadFileValue[0].name && this.uploadFileValue[0].name.match('^[\\u0080-\\uFFFF\\w,\\s-_]+\\.[A-Za-z]{3,4}$')){
            this.active = true;
            const reader = new FileReader();
            reader.onload = this.uploadFile;
            reader.onabort = this.handleFileReadErr;
            reader.onerror = this.handleFileReadErr;
            reader.readAsBinaryString(this.uploadFileValue[0]);
          }else{
            this.active = false;
            this.setErrorAlert('Please remove spaces and special characters from file name and try uploading again.');
          }
        } catch (e) {
          this.handleFileReadErr();
          throw e;
        }
      }
    },
    getFileRules() {
      const maxSize = this.fileRequirements.maxSize;
      this.fileRules = [
        value => {
          if(value){
            return true;
          }
          return 'Required';
        },
        value => {
          return !value || !value.length || value[0].size < maxSize || `File size should not be larger than ${humanFileSize(maxSize)}!`;
        },
        value => {
          //const extension = `.${value[0]?.name.split('.').slice(-1)}`;
          return !value?.length || this.fileRequirements.extensions.includes(`.${value[0]?.name.split('.').slice(-1)}`) || this.fileRequirements.extensions.includes(value[0]?.type) || `File formats should be ${this.fileFormats}.`;
        }
      ];
      this.fileAccept = this.fileRequirements.extensions.join();
      this.fileFormats = this.allowedFileFormat ? this.allowedFileFormat : this.makefileFormatList(fileRequirements.extensions);
    },
    handleFileReadErr() {
      this.active = false;
      this.setErrorAlert('Sorry, an unexpected error seems to have occurred. Try uploading your files later.');
    },
    async uploadFile(env) {
      let fileExtensionValue;
      if(this.smallFileExtension){
        fileExtensionValue = getFileExtensionWithDot(this.uploadFileValue[0].name);
      } else {
        fileExtensionValue = this.uploadFileValue[0].type ? this.uploadFileValue[0].type : getFileExtensionWithDot(this.uploadFileValue[0].name);
      }

      let document = {
        fileName: getFileNameWithMaxNameLength(this.uploadFileValue[0].name),
        fileExtension: fileExtensionValue,
        fileSize: this.uploadFileValue[0].size,
        documentData: btoa(env.target.result)
      };
      this.$emit('upload', document);
      this.resetForm();
      this.$emit('close:form');
    }
  },
};
</script>

<style scoped>
.document-upload{
  padding: 1.1rem;
  max-width: 40rem;
  min-width: 10rem;
}

.v-dialog > .v-card > .v-card__text {
  padding: 24px 24px 20px;
}

p{
  padding-top: 10px;
}
ul{
  width: 100%;
}

.v-input >>> .v-input__slot{
  padding-top: 0;
}

.bottom-text{
  /* margin-top: -0.7rem; */
  padding-top: 0;
  color: #666666;
  margin-left: 1.7rem;
  font-size: 0.8rem;
}

.v-text-field__details{
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
}
.v-messages{
  min-height: 0 !important;
  height: 0 !important;
}

h3 {
  font-size: 1.2rem
}

.v-alert {
  font-size: 1.05rem;
}

</style>
