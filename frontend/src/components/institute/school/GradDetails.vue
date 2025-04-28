<template>
  <v-form
    ref="schoolDetailsForm"
    v-model="schoolDetailsFormValid"
  >
    <v-container fluid>
      <v-row v-if="loading">
        <v-col class="d-flex justify-center">
          <v-progress-circular
            class="mt-16"
            :size="70"
            :width="7"
            color="primary"
            indeterminate
            :active="loading"
          />
        </v-col>
      </v-row>
      <v-row
        v-else
        no-gutters
      >
        <v-col>
          <v-row class="d-flex justify-start">
            <v-col
              v-if="!editing"
              class="d-flex justify-end"
            >
              <PrimaryButton
                v-if="hasAccess"
                id="schoolDetailsEditButton"
                icon-left
                width="6em"
                icon="mdi-pencil"
                text="Edit"
                @click-action="toggleEdit"
              />
            </v-col>
            <v-col
              v-else
              class="d-flex justify-end"
            >
              <PrimaryButton
                id="cancelButton"
                class="mr-2"
                secondary
                icon-left
                width="6em"
                text="Cancel"
                @click-action="cancelClicked"
              />
              <PrimaryButton
                id="saveButton"
                icon-left
                width="6em"
                text="Save"
                :disabled="!schoolDetailsFormValid"
                @click-action="saveGradSchoolDetails"
              />
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start mb-2">
            <v-col
              cols="2"
              class="pb-0 pt-0"
            >
              <v-row
                v-if="!editing"
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Issue Transcripts?</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="pb-1 pr-0"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    gradSchool.canIssueTranscripts === 'Y' ? 'Yes' : 'No'
                  }}</span>
                  <v-select
                    v-else
                    v-model="gradSchoolDetailsCopy.canIssueTranscripts"
                    :items="canIssueTypes"
                    item-value="canIssueTypeCode"
                    item-title="label"
                    class="mt-n5"
                    variant="underlined"
                    label="Can Issue Transcripts?"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="2"
              class="pb-0 pt-0"
            >
              <v-row
                v-if="!editing"
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Issue Certificates?</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="pb-1 pr-0"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    gradSchool.canIssueCertificates === 'Y' ? 'Yes' : 'No'
                  }}</span>
                  <v-select
                    v-else
                    v-model="gradSchoolDetailsCopy.canIssueCertificates"
                    :items="canIssueTypes"
                    item-value="canIssueTypeCode"
                    item-title="label"
                    class="mt-n5"
                    variant="underlined"
                    label="Can Issue Certificates?"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="2"
              class="pb-0 pt-0"
            >
              <v-row
                v-if="!editing"
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Submission Mode</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="pb-1 pr-0"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    getSubmissionModeText(gradSchool.submissionModeCode)
                  }}</span>
                  <v-select
                    v-else
                    v-model="gradSchoolDetailsCopy.submissionModeCode"
                    :items="submissionModeCodes"
                    item-value="submissionModeCode"
                    item-title="label"
                    class="mt-n5"
                    variant="underlined"
                    label="Submission Mode Code"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>

import PrimaryButton from '../../util/PrimaryButton.vue';
import {mapState} from 'pinia';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {deepCloneObject} from '@/utils/common';
import {isNumber} from '@/utils/institute/formInput';
import {authStore} from '@/store/modules/auth';
import {notificationsStore} from '@/store/modules/notifications';

export default {
  name: 'GradDetails',
  components: {
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    },
    hasAccess: {
      type: Boolean,
      required: true
    },
    canEditAllSchools: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      gradSchool: '',
      canIssueTypes: [{
        'canIssueTypeCode': 'Y',
        'label': 'Yes'
      },
      {
        'canIssueTypeCode': 'N',
        'label': 'No'
      },],
      submissionModeCodes: [{
        'submissionModeCode': 'REPLACE',
        'label': 'Replace'
      },
      {
        'submissionModeCode': 'APPEND',
        'label': 'Append'
      },],
      loading: true,
      schoolDetailsFormValid: true,
      editing: false,
      gradSchoolDetailsCopy: {}
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
    ...mapState(notificationsStore, ['notification']),
  },
  created() {
    this.getGradSchoolsDetails();
  },
  methods: {
    getSubmissionModeText(submissionMode){
      if(submissionMode) {
        return submissionMode.charAt(0).toUpperCase() + submissionMode.toLowerCase().slice(1);
      }
    },
    getGradSchoolsDetails() {
      this.loading = true;
      this.gradSchool = '';

      ApiService.apiAxios.get(`${Routes.gradSchool.BASE_URL}/${this.schoolID}`)
        .then(response => {
          this.gradSchool = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    deepCloneObject,
    isNumber,
    async toggleEdit() {
      this.gradSchoolDetailsCopy = this.deepCloneObject(this.gradSchool);
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    cancelClicked() {
      this.editing = false;
    },
    saveGradSchoolDetails() {
      this.loading = true;
      ApiService.apiAxios.put(`${Routes.gradSchool.BASE_URL}/${this.schoolID}`, this.gradSchoolDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The school graduation details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the graduation school details. Please try again later.');
        })
        .finally(() => {
          this.getGradSchoolsDetails();
          this.editing = false;
        });
    },
    async validateForm() {
      if(this.$refs.schoolDetailsForm){
        const isValid = await this.$refs.schoolDetailsForm.validate();
        this.schoolDetailsFormValid = isValid.valid;
      }
    },
  },
};
</script>

<style scoped>

.fontItalic {
    font-style: italic;
}

.editField {
    font-size: 14px;
    color: rgb(0, 51, 102);
}

.editField:hover {
    text-decoration: underline;
}

.subHeading {
    color: #38598a;
}
</style>
