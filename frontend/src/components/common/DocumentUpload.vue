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
        <v-btn
          color="#003366"
          class="white--text"
          id="upload_form"
          @click="submitRequest"
          :disabled="!dataReady"
          :loading="active"
          :key="buttonKey"
        >
          Upload
        </v-btn>
        <v-btn
          color="#003366"
          class="white--text"
          @click="closeForm"
        >
          Close
        </v-btn>
      </v-card-actions>


  </v-card>
</template>

<script>
import {getFileExtensionWithDot, getFileNameWithMaxNameLength} from '@/utils/file';
import {mapGetters} from 'vuex';

export default {
  props: {
    eager: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      fileAccept: 'xls, xlsx',
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
      let document = {
        fileName: getFileNameWithMaxNameLength(this.file.name),
        fileExtension: getFileExtensionWithDot(this.file.name),
        fileSize: this.file.size,
        documentData: btoa(env.target.result)
      };
      this.$emit('upload', document);
      this.resetForm();
      this.$emit('close:form');
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
