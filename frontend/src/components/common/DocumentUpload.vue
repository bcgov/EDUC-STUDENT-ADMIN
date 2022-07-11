<template>
  <v-card class="document-upload">

    <v-card-title><h3>Document Upload</h3></v-card-title>
    <v-form
      ref="form"
      v-model="validForm"
    >
      <v-file-input
        color="#003366"
        :accept="fileAccept"
        :rules="fileRules"
        :disabled="hasReadOnlyRoleAccess()"
        placeholder="Select your file"
        :error-messages="fileInputError"
        @change="selectFile"
      ></v-file-input>


      </v-form>
      <v-alert
        dense
        outlined
        dismissible
        v-model="alert"
        :class="alertType"
        class="mb-3"
      >
         {{ alertMessage }}
      </v-alert>
      <v-card-actions>
        <v-spacer></v-spacer>
        <PrimaryButton id="cancelMessage" secondary text="Cancel" @click.native="closeForm"></PrimaryButton>
        <PrimaryButton :key="buttonKey" :loading="active" :disabled="!dataReady" id="upload_form" text="Upload" width="7rem" @click.native="submitRequest"></PrimaryButton>
      </v-card-actions>
  </v-card>
</template>

<script>
import {getFileExtensionWithDot, getFileNameWithMaxNameLength} from '@/utils/file';
import {mapGetters} from 'vuex';
import PrimaryButton from '../util/PrimaryButton';

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
  },
  data() {
    return {
      fileAccept: 'xls, xlsx',
      fileRules: [ ],
      requiredRules: [v => !!v || 'Required'],
      validForm: true,
      fileInputError: [],
      documentTypeCode: null,
      file: null,
      active: false,
      buttonKey: 0,

      alert: false,
      alertMessage: null,
      alertType: null

    };
  },
  created() {
    this.getFileRules().catch(e => {
      console.log(e);
      this.setErrorAlert('Sorry, an unexpected error seems to have occurred. You can upload files later.');
    });
  },
  watch: {
    dataReady() {
      //force re-renders of the button to solve the color issue
      this.buttonKey += 1;
    },
  },
  computed: {
    ...mapGetters('auth', ['NOMINAL_ROLL_READ_ONLY_ROLE']),
    dataReady () {
      return this.validForm && this.file;
    },
  },
  methods: {
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
      this.alert = false;
      this.active = false;
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
      this.file = file;
      if(!this.file && !this.active) {
        this.fileInputError = 'Required';
      } else {
        this.fileInputError = [];
        this.alert = false;
      }
    },
    validate() {
      this.$refs.form.validate();
    },
    submitRequest() {
      if(this.dataReady){
        try {
          if(this.file.name && this.file.name.match('^[\\u0080-\\uFFFF\\w,\\s-_]+\\.[A-Za-z]{3,4}$')){
            this.active = true;
            const reader = new FileReader();
            reader.onload = this.uploadFile;
            reader.onabort = this.handleFileReadErr;
            reader.onerror = this.handleFileReadErr;
            reader.readAsBinaryString(this.file);
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
    handleFileReadErr() {
      this.active = false;
      this.setErrorAlert('Sorry, an unexpected error seems to have occurred. Try uploading your files later.');
    },
    async uploadFile(env) {
      let fileExtensionValue;
      if(this.smallFileExtension){
        fileExtensionValue = getFileExtensionWithDot(this.file.name);
      }else{
        fileExtensionValue = this.file.type;
      }

      let document = {
        fileName: getFileNameWithMaxNameLength(this.file.name),
        fileExtension: fileExtensionValue,
        fileSize: this.file.size,
        documentData: btoa(env.target.result)
      };
      this.$emit('upload', document);
      this.resetForm();
      this.$emit('close:form');
    },
    async getFileRules() {
      const response = await ApiService.getFileRequirements(this.requestType);
      const fileRequirements = response.data;
      const maxSize = fileRequirements.maxSize;
      this.fileRules = [
        value => !value || value.size < maxSize || `File size should not be larger than ${humanFileSize(maxSize)}!`,
        value => !value || fileRequirements.extensions.includes(value.type) || `File formats should be ${this.fileFormats}.`,
      ];
      this.fileAccept = fileRequirements.extensions.join();
      this.fileFormats = this.makefileFormatList(fileRequirements.extensions);
    },
  },
};
</script>

<style scoped>
.document-upload{
  padding: 1.1rem;
  max-width: 50rem;
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

.v-input{
  padding-bottom: 0;
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
