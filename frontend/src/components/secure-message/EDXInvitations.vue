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
                    v-model:page="pageNumber"
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
            <v-window-item value="sendInvites">
              sendInvites
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
import { deepCloneObject } from '../../utils/common';
import {LocalDate} from '@js-joda/core';
  
export default {
  name: 'EDXInvitations',
  components: {
  },
  mixins: [alertMixin],
  props: {
      
  },
  data() {
    return {
      tab: null,
      schoolSearch: null,
      districtSearch: null,
      pageNumber: 1,
      pageCount: 0,
      itemsPerPage: 10,
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
  watch: {
    districtSearch() {
      this.applyDistrictFilter();
    },
    schoolSearch() {
      this.applySchoolFilter();
    }
  },
  computed: {
      

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
    }
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
  
