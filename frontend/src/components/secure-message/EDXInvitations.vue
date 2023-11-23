<template>
  <v-container
    fluid
    class="px-0 mb-4"
  >
    <v-row no-gutters>
      <v-col>
        <v-tabs v-model="tab">
          <v-tab
            value="districtAccess"
            @click="loadDistrictInvites"
          >
            District Invitations
          </v-tab>
          <v-tab
            value="schoolAccess"
            @click="loadSchoolInvites"
          >
            School Invitations
          </v-tab>
          <v-tab value="sendInvites">
            Send Invitations
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col>
        <v-card-text class="pt-0">
          <v-window v-model="tab">
            <v-window-item value="districtAccess">
              <v-row
                no-gutters
                style="background-color:white;"
              >
                <v-col>
                  <v-data-table
                    id="dataTable"
                    v-model:page="pageNumber"
                    v-model:items="districtInvites"
                    v-model:items-per-page="itemsPerPage"
                    :headers="districtHeaders"
                    :search="search"
                    :loading="districtLoading"
                    :sort-by="districtSortBy"
                  >
                    <template #top>
                      <v-text-field
                        v-model="search"
                        clearable
                        hide-details="auto"
                        label="Search"
                        class="pa-4"
                      />
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-window-item>
            <v-window-item value="schoolAccess">
              <v-row
                no-gutters
                style="background-color:white;"
              >
                <v-col>
                  <v-data-table
                    id="dataTable"
                    v-model:page="pageNumber"
                    v-model:items="schoolInvites"
                    v-model:items-per-page="itemsPerPage"
                    :headers="schoolHeaders"
                    :search="search"
                    :loading="schoolLoading"
                    :sort-by="schoolSortBy"
                  >
                    <template #top>
                      <v-text-field
                        v-model="search"
                        clearable
                        hide-details="auto"
                        label="Search"
                        class="pa-4"
                      />
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-window-item>
            <v-window-item value="sendInvites" style="align-self: center" class="mt-8">
              <v-row>
                <v-col class="mb-3 d-flex justify-center">
                  <h1>Upload User Onboarding Data</h1>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                <v-form
                    ref="documentForm"
                    v-model="validForm"
                    class="h-80"
                >
                  <v-file-input
                      id="selectFileInput"
                      ref="uploader"
                      v-model="uploadFileValue"
                      accept=".csv"
                      :clearable="true"
                      :loading="uploadInProgress"
                      :disabled="uploadInProgress"
                  />
                </v-form>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script>
  
import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import DocumentUpload from "@/components/common/DocumentUpload.vue";
import {edxStore} from "@/store/modules/edx";
import {getFileNameWithMaxNameLength} from "@/utils/file";
import PrimaryButton from "@/components/util/PrimaryButton.vue";
  
export default {
  name: 'EDXInvitations',
  components: {
    PrimaryButton,
    DocumentUpload
  },
  mixins: [alertMixin],
  props: {
      
  },
  data() {
    return {
      tab: null,
      search: null,
      pageNumber: 1,
      pageCount: 0,
      itemsPerPage: 10,
      acceptableFileExtensions: 'CSV',
      uploadInProgress: false,
      uploadFileValue: null,
      validForm: false,
      districtHeaders: [
        {title: 'District ID', value: 'district.districtNumber', align: 'start', tooltip: 'District ID', key: 'district.districtNumber'},
        {title: 'District Name', value: 'district.name', tooltip: 'District Name', key: 'district.name'},
        {title: 'First Name', value: 'firstName', tooltip: 'First Name', key: 'firstName'},
        {
          title: 'Last Name',
          value: 'lastName',
          tooltip: 'Last Name',
          key: 'lastName'
        },
        {
          title: 'Email',
          value: 'email',
          tooltip: 'Email',
          key: 'email'
        },
        {
          title: 'Status',
          value: 'status',
          tooltip: 'Status',
          key: 'status'
        },
        {
          title: 'Invitation Expiry',
          value: 'invitationExpiry',
          tooltip: 'Invitation Expiry',
          key: 'invitationExpiry'
        }
      ],
      schoolHeaders: [
        {title: 'School ID', value: 'school.mincode', align: 'start', tooltip: 'School ID', key: 'school.mincode'},
        {title: 'School Name', value: 'school.schoolName', tooltip: 'School Name', key: 'school.schoolName'},
        {title: 'First Name', value: 'firstName', tooltip: 'First Name', key: 'firstName'},
        {
          title: 'Last Name',
          value: 'lastName',
          tooltip: 'Last Name',
          key: 'lastName'
        },
        {
          title: 'Email',
          value: 'email',
          tooltip: 'Email',
          key: 'email'
        },
        {
          title: 'Status',
          value: 'status',
          tooltip: 'Status',
          key: 'status'
        },
        {
          title: 'Invitation Expiry',
          value: 'invitationExpiry',
          tooltip: 'Invitation Expiry',
          key: 'invitationExpiry'
        }
      ],
      schoolSortBy: [
        {
          'key': 'school.mincode',
          'order': 'asc'
        }
      ],
      districtSortBy: [
        {
          'key': 'district.districtNumber',
          'order': 'asc'
        }
      ],
      districtInvites: [],
      schoolInvites: [],
      districtLoading: false,
      schoolLoading: false,
    };
  },
  computed: {
      

  },
  async mounted() {
    this.loadDistrictInvites();
  },
  watch: {
    uploadFileValue() {
      if(this.uploadFileValue){
        this.importFile();
      }
    },
  },
  created() {
  },
  methods: {

    loadSchoolInvites() {
      this.schoolLoading = true;
      ApiService.apiAxios
        .get(`${Routes.edx.FIND_SCHOOL_INVITATIONS}`)
        .then(response => {
          if (response) {
            this.schoolInvites = response.data;
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the School Invitations. Please try again later.');
        })
        .finally(() => (this.schoolLoading = false));
    },
    loadDistrictInvites() {
      this.districtLoading = true;
      ApiService.apiAxios
        .get(`${Routes.edx.FIND_DISTRICT_INVITATIONS}`)
        .then(response => {
          if (response) {
            this.districtInvites = response.data;
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the District Invitations. Please try again later.');
        })
        .finally(() => (this.districtLoading = false));
    },
    async validateForm() {
      await this.$nextTick();
      await this.$refs.documentForm.validate();
    },
    async importFile() {
      if(this.uploadFileValue) {
        let data = null;

        await this.validateForm();

        if (!this.uploadFileValue[0] || !this.validForm) {
          data = 'No File Chosen';
        } else {
          let reader = new FileReader();
          reader.readAsText(this.uploadFileValue[0]);
          reader.onload = () => {
            data = reader.result;
            this.uploadFile(data);
          };
        }
      }
    },
    async uploadFile(fileAsString) {
      try{
        this.uploadInProgress = true;
        let document = {
          fileName: getFileNameWithMaxNameLength(this.uploadFileValue[0].name),
          fileContents: btoa(unescape(encodeURIComponent(fileAsString)))
        };
        const response = await ApiService.apiAxios.post(Routes.edx.UPLOAD_ONBOARDING_FILE, document);
        this.setSuccessAlert('Data for ' + response.data.processedCount + ' users uploaded');
        this.uploadFileValue = null;
      } catch (e) {
        console.error(e);
        this.setFailureAlert('The file could not be processed due to the following issue: ' + e.data);
      }

      this.uploadInProgress = false;
    },
  }
};
</script>
  
