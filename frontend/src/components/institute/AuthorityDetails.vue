<template>
  <v-form
    ref="authorityForm"
    v-model="authorityFormValid"
  >
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
          >Return to Authority List</a>
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
              cols="8"
              class="d-flex justify-start"
            >
              <h2 id="authorityName">
                {{
                  authority?.authorityNumber
                }} - {{
                  authority?.displayName
                }}
              </h2>
            </v-col>
            <v-col
              v-else
              class="d-flex"
            >
              <h2 id="authorityName">
                {{
                  authority?.authorityNumber
                }} -
              </h2>
              <v-text-field
                v-model="authorityCopy.displayName"
                class="mt-n4 ml-3"
                required
                variant="underlined"
                :rules="[rules.required(), rules.noSpecialCharactersSchDisAuthName()]"
                :maxlength="255"
                style="font-size: x-large"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="2"
            >
              <v-icon
                class="pb-1"
                :color="getStatusColorAuthorityOrSchool(authority?.status)"
                right
                dark
              >
                mdi-circle-medium
              </v-icon>
              <span>{{
                authority?.status
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
                      :authority-i-d="authorityID"
                      @updateAuthority="saveAuthority"
                      :has-access="hasEditAccess"
                      :canEditIndependentAuthority="canEditIndependentAuthority"
                      :canEditOffshoreAuthority="canEditOffshoreAuthority"
                    />
                  </v-window-item>
                  <v-window-item value="contacts">
                    <AuthorityContacts 
                      :authority-i-d="authorityID"
                      :has-access="hasEditAccess"
                    />
                  </v-window-item>
                  <v-window-item value="notes">
                    <InstituteNotes
                      :notes="notes ? notes : []"
                      :has-access="hasEditAccess"
                      :loading="notesLoading"
                      @add-institute-note="saveNewAuthorityNote"
                      @edit-institute-note="saveChangesToAuthorityNote"
                      @remove-institute-note="removeAuthorityNote"
                    />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool} from '@/utils/institute/status';
import {mapState} from 'pinia';
import router from '@/router';
import {deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';
import Details from './authority/Details.vue';
import AuthorityContacts from './authority/AuthoritiesContacts.vue';
import InstituteNotes from '@/components/institute/common/InstituteNotes.vue';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'AuthorityDetailsPage',
  components: {
    Details,
    AuthorityContacts,
    InstituteNotes
  },
  mixins: [alertMixin],
  props: {
    authorityID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      sameAsMailingCheckbox: true,
      editing: false,
      authority: null,
      authorityFormValid: false,
      authorityCopy: null,
      loading: false,
      noteRequestCount: 0,
      openAuthorityStatusEditCard: false,
      authorityHasOpenSchools: false,
      closedDateOfLastClosingSchool: null,
      rules: Rules,
      notes: [],
      authorityTypes: [],
      provinceCodeValues: [],
      countryCodeValues: [],
      listOfOpenSchools: [],
      listOfClosingSchools: [],
      tab: null,
      excludeShowingPhysicalAddressesForAuthoritiesOfType: [
        'OFFSHORE',
      ],

    };
  },
  computed: {
    ...mapState(instituteStore, ['authorityTypeCodes', 'provinceCodes', 'countryCodes']),
    ...mapState(authStore, ['userInfo']),
    notesLoading() {
      return this.noteRequestCount > 0;
    },
    hasSamePhysicalAddress() {
      return !this.authority?.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    showPhysicalAddress() {
      if (this.editing) {
        return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.authorityCopy.authorityTypeCode);
      }
      return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.authority?.authorityTypeCode);
    },
    canEditIndependentAuthority() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_INDEPENDENT_AUTHORITY_PERMISSION); 
    },
    canEditOffshoreAuthority() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_OFFSHORE_AUTHORITY_PERMISSION);
    },
    hasEditAccess() {
      return (this.authority?.authorityTypeCode === 'INDEPENDNT' && this.canEditIndependentAuthority) || 
      (this.authority?.authorityTypeCode === 'OFFSHORE' && this.canEditOffshoreAuthority);
    }
  },
  created() {
    const instStore = instituteStore();
    instStore.getAllProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province => province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instStore.getAllCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    instStore.getAllAuthorityTypeCodes().then(() => {
      this.authorityTypes = this.authorityTypeCodes;
    });
    this.getAuthority();
    this.getAuthorityNotes();
  },
  methods: {
    hasRequiredPermission,
    formatPhoneNumber,
    formatDate,
    getStatusColorAuthorityOrSchool,
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      authority.type = this.getAuthorityType(authority);
    },
    getAuthority() {
      this.loading = true;
      ApiService.apiAxios.get(Routes.institute.AUTHORITY_DATA_URL + '/' + this.authorityID, {}).then(response => {
        this.authority = response.data;
        this.populateExtraAuthorityFields(this.authority);
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.setHasSamePhysicalFlag();
        this.loading = false;
      });
    },
    getAuthorityNotes() {
      ApiService.apiAxios.get(`${Routes.institute.AUTHORITY_DATA_URL}/${this.authorityID}/notes`)
        .then(response => {
          this.notes = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        });
    },
    backButtonClick() {
      router.push({name: 'instituteAuthoritiesList'});
    },
    deepCloneObject,
    setHasSamePhysicalFlag() {
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async clickSameAsAddressButton() {
      await this.$nextTick();
      this.$refs.authorityForm.validate();
    },
    saveAuthority(authorityCopy) {
      this.loading = true;
      const payload = authorityCopy;
      ApiService.apiAxios.post(`${Routes.institute.AUTHORITY_DATA_URL}` + '/' + authorityCopy.independentAuthorityId, payload)
        .then(() => {
          this.setSuccessAlert('Success! The authority details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the authority information. Please try again later.');
        })
        .finally(() => {
          this.getAuthority();
        });
    },
   
    getAuthorityType(authority) {
      return this.authorityTypes.find((autorityType) => autorityType.authorityTypeCode === authority?.authorityTypeCode).label;
    },
    saveNewAuthorityNote(authorityNote) {
      this.noteRequestCount += 1;
      const payload = {
        independentAuthorityId: this.authorityID,
        content: authorityNote.content
      };
      ApiService.apiAxios.post(Routes.institute.AUTHORITY_NOTE_URL, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the authority.');
          this.getAuthority();
          this.getAuthorityNotes();
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the authority note. Please try again later.');
        })
        .finally(() => {
          this.noteRequestCount -= 1;
        });
    },
    saveChangesToAuthorityNote(authorityNote) {
      this.noteRequestCount += 1;
      let payload = {
        noteId: authorityNote.noteId,
        independentAuthorityId: this.authorityID,
        content: authorityNote.content
      };
      ApiService.apiAxios.put(`${Routes.institute.AUTHORITY_NOTE_URL}/${authorityNote.noteId}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been saved.');
          this.getAuthority();
          this.getAuthorityNotes();
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the changes to the authority note. Please try again later.');
        })
        .finally(() => {
          this.noteRequestCount -= 1;
        });
    },
    removeAuthorityNote(authorityNote) {
      this.noteRequestCount += 1;
      ApiService.apiAxios.delete(`${Routes.institute.AUTHORITY_NOTE_URL}/${this.authorityID}/${authorityNote.noteId}`).then(() => {
        this.setSuccessAlert('The authority note has been removed successfully!');
        this.getAuthority();
        this.getAuthorityNotes();
      }).catch(error => {
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while removing the authority note. Please try again later.');
      }).finally(() => {
        this.noteRequestCount -= 1;
      });
    }
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
