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
                    v-model:page="districtAccessPageNumber"
                    v-model:items="filteredDistrictInvites"
                    v-model:items-per-page="itemsPerPage"
                    :headers="districtHeaders"
                    :search="districtSearch"
                    :loading="districtLoading"
                    :sort-by="districtSortBy"
                  >
                    <template #top>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            v-model="districtSearch"
                            clearable
                            hide-details="auto"
                            variant="underlined"
                            label="Search"
                            class="pa-4"
                          />
                        </v-col>

                        <v-col cols="3">
                          <v-select
                            id="status-select-field"
                            v-model="statusFilter"
                            clearable
                            :items="statusType"
                            item-title="label"
                            variant="underlined"
                            :menu-props="{closeOnContentClick:true}"
                            label="Status"
                            class="pa-4"
                            @update:model-value="applyDistrictFilter"
                          />
                        </v-col>

                        <v-col cols="3">
                          <v-select
                            id="expiry-select-field"
                            v-model="expiryFilter"
                            clearable
                            :items="expiryType"
                            item-title="label"
                            variant="underlined"
                            :menu-props="{closeOnContentClick:true}"
                            label="Invitation Expiry"
                            class="pa-4"
                            @update:model-value="applyDistrictFilter"
                          />
                        </v-col>
                      </v-row>
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
                    v-model:page="schoolAccessPageNumber"
                    v-model:items="filteredSchoolInvites"
                    v-model:items-per-page="itemsPerPage"
                    :headers="schoolHeaders"
                    :search="schoolSearch"
                    :loading="schoolLoading"
                    :sort-by="schoolSortBy"
                  >
                    <template #top>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            v-model="schoolSearch"
                            clearable
                            hide-details="auto"
                            variant="underlined"
                            label="Search"
                            class="pa-4"
                          />
                        </v-col>

                        <v-col cols="3">
                          <v-select
                            id="status-select-field"
                            v-model="statusFilter"
                            clearable
                            :items="statusType"
                            item-title="label"
                            variant="underlined"
                            :menu-props="{closeOnContentClick:true}"
                            label="Status"
                            class="pa-4"
                            @update:model-value="applySchoolFilter"
                          />
                        </v-col>

                        <v-col cols="3">
                          <v-select
                            id="expiry-select-field"
                            v-model="expiryFilter"
                            clearable
                            :items="expiryType"
                            item-title="label"
                            variant="underlined"
                            :menu-props="{closeOnContentClick:true}"
                            label="Invitation Expiry"
                            class="pa-4"
                            @update:model-value="applySchoolFilter"
                          />
                        </v-col>
                      </v-row>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-window-item>
            <v-window-item
              value="sendInvites"
              style="align-self: center"
              class="mt-8"
            >
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
import {getFileNameWithMaxNameLength} from '@/utils/file';
import { deepCloneObject } from '@/utils/common';
import {LocalDate} from '@js-joda/core';
  
export default {
  name: 'EDXInvitations',
  mixins: [alertMixin],
  data() {
    return {
      tab: null,
      schoolSearch: null,
      districtSearch: null,
      districtAccessPageNumber: 1,
      schoolAccessPageNumber: 1,
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
      filteredDistrictInvites: [],
      schoolInvites: [],
      filteredSchoolInvites: [],
      districtLoading: false,
      schoolLoading: false,
      statusFilter: null,
      expiryFilter: null,
      statusType: ['Pending', 'Accepted'],
      expiryType: ['Active', 'Expired']
    };
  },
  computed: {  
  },
  watch: {
    districtSearch() {
      this.applyDistrictFilter();
    },
    schoolSearch() {
      this.applySchoolFilter();
    },
    uploadFileValue() {
      if(this.uploadFileValue){
        this.importFile();
      }
    },
  },
  async mounted() {
    this.loadDistrictInvites();
  },
  created() {
  },
  methods: {
    applySchoolFilter() {
      this.filteredSchoolInvites = this.filter(this.schoolInvites);
    },
    applyDistrictFilter() {
      this.filteredDistrictInvites = this.filter(this.districtInvites);
    },
    filter(data){
      let tempInvites = deepCloneObject(data);

      if(this.statusFilter){
        tempInvites = tempInvites.filter(invite => invite.status.toUpperCase() === this.statusFilter.toUpperCase());
      } 

      if(this.expiryFilter === 'Active') {   
        let currentDate = LocalDate.parse(LocalDate.now().toString().substring(0, 10));
        tempInvites = tempInvites.filter(invite => {
          let expiryDate = LocalDate.parse(invite.expiryDate.substring(0, 10));
          return expiryDate.isAfter(currentDate);
        });
      }

      if(this.expiryFilter === 'Expired') {
        let currentDate = LocalDate.parse(LocalDate.now().toString().substring(0, 10));
        tempInvites = tempInvites.filter(invite => {
          let expiryDate = LocalDate.parse(invite.expiryDate.substring(0, 10));
          return expiryDate.isBefore(currentDate);
        });
      }

      if(this.districtSearch){
        tempInvites = tempInvites.filter(invite => invite.fullSearch.toUpperCase().includes(this.districtSearch.toUpperCase()));   
      }

      if(this.schoolSearch){
        tempInvites = tempInvites.filter(invite => invite.fullSearch.toUpperCase().includes(this.schoolSearch.toUpperCase()));   
      }

      return tempInvites;
    },
    loadSchoolInvites() {
      this.schoolLoading = true;
      this.schoolAccessPageNumber = 1;
      ApiService.apiAxios
        .get(`${Routes.edx.FIND_SCHOOL_INVITATIONS}`)
        .then(response => {
          if (response) {
            this.schoolInvites = response.data;
            this.schoolInvites.forEach(invite => {
              invite.fullSearch = invite?.school?.mincode + ' ' + invite?.school?.schoolName+ ' ' + invite.firstName + ' ' + invite.lastName + ' '+ invite.email + ' ' + invite.status;
            });
            this.filteredSchoolInvites = this.schoolInvites;
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
      this.districtAccessPageNumber = 1;
      ApiService.apiAxios
        .get(`${Routes.edx.FIND_DISTRICT_INVITATIONS}`)
        .then(response => {
          if (response) {
            this.districtInvites = response.data;
            this.districtInvites.forEach(invite => {
              invite.fullSearch = invite.district.districtNumber + ' ' + invite.district.name+ ' ' + invite.firstName + ' ' + invite.lastName + ' ' + invite.email + ' ' + invite.status;
            });
            this.filteredDistrictInvites = this.districtInvites;
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

<style scoped>
.v-tab {
    text-transform: none !important;
    font-size: 16px;
    font-weight: bold;
}

:deep(.v-btn--variant-text) {
    color: #003366
}
</style>
  
