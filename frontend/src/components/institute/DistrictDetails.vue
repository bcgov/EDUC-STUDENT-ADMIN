<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row>
      <v-col class="mt-1 mb-4 d-flex justify-start">
        <v-icon
          small
          color="#1976d2"
        >
          mdi-arrow-left
        </v-icon>
        <a
          class="ml-1"
          @click="backButtonClick"
        >Return to District List</a>
      </v-col>
    </v-row>
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
            cols="6"
            class="d-flex justify-start"
          >
            <h2 id="districtName">
              {{
                district.districtNumber
              }} - {{
                district.displayName
              }}
            </h2>
          </v-col>
          <v-col
            v-else
            class="d-flex"
          >
            <h2 id="districtNumber">
              {{
                district.districtNumber
              }} -
            </h2>
            <v-text-field
              v-model="districtDetailsCopy.displayName"
              class="mt-n5 ml-3"
              style="font-size: x-large"
              :maxlength="255"
              :rules="[rules.required(), rules.noSpecialCharactersSchDisAuthName()]"
              required
              variant="underlined"
            />
          </v-col>
          <v-col
            cols="6"
            class="d-flex justify-end"
          >
            <PrimaryButton
              id="viewSchoolsInDistrictButton"
              class="mr-2"
              secondary
              icon-left
              icon="mdi-library-outline"
              text="View Schools in District"
              @click-action="viewSchools"
            />
          </v-col>      
        </v-row>

        <v-row
          no-gutters
          class="mt-1 d-flex justify-start"
        >
          <v-col
            class="d-flex"
          >
            <v-icon
              class="pb-1"
              :color="getStatusColor()"
              right
              dark
            >
              mdi-circle-medium
            </v-icon>
            <span>{{
              getStatusText()
            }}</span>
          </v-col>
        </v-row>
                     
        <v-row>
          <v-col>
            <v-divider class="divider" />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-tabs v-model="tab">
              <v-tab value="details">
                Details
              </v-tab>
              <v-tab value="contacts">
                Contacts
              </v-tab>
              <v-tab
                v-if="!isOffshoreUser()"
                value="notes"
              >
                Ministry Notes
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-card-text class="pt-0">
              <v-window v-model="tab">
                <v-window-item value="details">
                  <Details 
                    :district-i-d="districtID"
                    :has-access="canEditDistrictDetails()"
                    @updateDistrict="updateDistrictDetails"
                  />
                </v-window-item>
                <v-window-item value="contacts">
                  <DistrictContacts 
                    :district-i-d="districtID" 
                    :has-access="canEditDistrictDetails()"
                  />
                </v-window-item>
                <v-window-item value="notes">
                  <InstituteNotes
                    :notes="notes ? notes : []"
                    :has-access="canEditDistrictDetails()"
                    :loading="notesLoading"
                    @add-institute-note="saveNewDistrictNote"
                    @edit-institute-note="saveChangesToDistrictNote"
                    @remove-institute-note="removeDistrictNote"
                  />
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import router from '@/router';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {mapState, mapActions} from 'pinia';
import {deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';
import {edxStore} from '@/store/modules/edx';
import InstituteNotes from '@/components/institute/common/InstituteNotes.vue';
import Details from './district/Details.vue';
import DistrictContacts from './district/DistrictContacts.vue';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'DistrictDetails',
  components: {
    InstituteNotes,
    PrimaryButton,
    Details,
    DistrictContacts
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      district: null,
      rules: Rules,
      notes: [],
      loading: false,
      noteRequestCount: 0,
      cleanWebsiteUrl: '',
      editing: false,
      districtDetailsCopy: {},
      provinceCodeValues: [],
      countryCodeValues: [],
      sameAsMailingCheckbox: true,
      tab: null
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo','OFFSHORE_SCHOOLS_ADMIN_ROLE']),
    ...mapState(instituteStore, ['provinceCodes', 'countryCodes']),
    ...mapState(edxStore, ['schoolSearchParams']),
    notesLoading() {
      return this.noteRequestCount > 0;
    },
    hasSamePhysicalAddress() {
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    }
  },
  created() {
    this.getDistrict();
    this.getDistrictNotes();
    this.setTab();

    instituteStore().getAllProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province => province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instituteStore().getAllCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
  },
  methods: {
    hasRequiredPermission,
    ...mapActions(edxStore, ['setSchoolSearchParams']),
    formatPhoneNumber,
    isOffshoreUser() {
      return this.OFFSHORE_SCHOOLS_ADMIN_ROLE;
    },
    setTab(){
      if(this.$route.query?.contact){
        this.tab = 'contacts';
      }
    },
    getDistrict() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.institute.DISTRICT_DATA_URL}/${this.districtID}`)
        .then(response => {
          this.district = response.data;
          this.cleanWebsiteUrl = this.district.website ? sanitizeUrl(this.district.website) : '';
          this.setHasSamePhysicalFlag();
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getDistrictNotes() {
      ApiService.apiAxios.get(`${Routes.institute.DISTRICT_DATA_URL}/${this.districtID}/notes`)
        .then(response => {
          this.notes = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        });
    },
    setHasSamePhysicalFlag() {
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    viewSchools() {
      this.schoolSearchParams.schoolID = null;
      this.schoolSearchParams.districtID = this.districtID;
      this.schoolSearchParams.authorityID = null;
      this.schoolSearchParams.status = 'Open';
      this.schoolSearchParams.facilityType = null;
      this.schoolSearchParams.schoolCategory = null;
      this.schoolSearchParams.schoolReportingRequirementCode = null;
      this.schoolSearchParams.pageNumber = 1;
      this.setSchoolSearchParams(this.schoolSearchParams);
      this.$router.push({name: 'instituteSchoolList'});
    },

    getStatusColor() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'green';
      } else {
        return 'red';
      }
    },
    canEditDistrictDetails() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_DISTRICT_PERMISSION);
    },     
    async updateDistrictDetails(districtDetailsCopy) {
      this.loading = true;

      ApiService.apiAxios.put(`${Routes.institute.DISTRICT_DATA_URL}` + '/' + districtDetailsCopy.districtId, districtDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The district details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the district information. Please try again later.');
        })
        .finally(() => {
          this.getDistrict();
        });
    },
    deepCloneObject,
    isNumber,
    formatDate,
    getStatusText() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'Active';
      } else {
        return 'Inactive';
      }
    },
    backButtonClick() {
      router.push({name: 'instituteDistrict'});
    },
    saveNewDistrictNote(districtNote) {
      this.noteRequestCount += 1;
      const payload = {
        districtId: this.districtID,
        content: districtNote.content
      };
      ApiService.apiAxios.post(Routes.institute.DISTRICT_NOTE_URL, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the district.');
          this.getDistrict();
          this.getDistrictNotes();
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the district note. Please try again later.');
        })
        .finally(() => {
          this.noteRequestCount -= 1;
        });
    },
    saveChangesToDistrictNote(districtNote) {
      this.noteRequestCount += 1;
      let payload = {
        noteId: districtNote.noteId,
        districtId: this.districtID,
        content: districtNote.content
      };
      ApiService.apiAxios.put(`${Routes.institute.DISTRICT_NOTE_URL}/${districtNote.noteId}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been saved.');
          this.getDistrict();
          this.getDistrictNotes();
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the changes to the district note. Please try again later.');
        })
        .finally(() => {
          this.noteRequestCount -= 1;
        });
    },
    removeDistrictNote(districtNote) {
      this.noteRequestCount += 1;
      ApiService.apiAxios.delete(`${Routes.institute.DISTRICT_NOTE_URL}/${this.districtID}/${districtNote.noteId}`).then(() => {
        this.setSuccessAlert('The district note has been removed successfully!');
        this.getDistrict();
        this.getDistrictNotes();
      }).catch(error => {
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while removing the district note. Please try again later.');
      }).finally(() => {
        this.noteRequestCount -= 1;
      });
    },
  }
};
</script>

<style scoped>
.divider {
    border-color: #FCBA19;
    border-width: 3px;
    opacity: unset;
}

.sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
}

.fontItalic {
    font-style: italic;
}

.containerSetup {
    padding-right: 12em !important;
    padding-left: 12em !important;
}

.editField {
    font-size: 14px;
    color: rgb(0, 51, 102);
}

.editField:hover {
    text-decoration: underline;
}

.v-tab {
    text-transform: none !important;
    font-size: 16px;
    font-weight: bold;
}

.tab-divider {
    border-right: 1px solid lightgray;
    border-radius: 0;
}

.tab-divider:last-child {
    border-right: 0
}

:deep(.v-btn--variant-text) {
    color: #003366
}

</style>
