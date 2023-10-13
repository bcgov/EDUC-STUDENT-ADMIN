<template>
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
    <template v-if="!loading">
      <v-row cols="2">
        <v-col class="d-flex justify-start">
          <v-chip
            class="mr-3"
            color="#A9D18E"
          >
            Active
          </v-chip>
          <v-chip
            class="mr-3"
            color="#9DC3E6"
          >
            Pending Start Date
          </v-chip>
          <v-chip color="#F4B183">
            Pending End Date
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton
            v-if="canAddEditSchoolContact"
            id="addSchoolContactBtn"
            icon-left
            width="11em"
            icon="mdi-plus-thick"
            text="New Contact"
            @click-action="openNewContactSheet"
          />
        </v-col>
      </v-row>
      <div
        v-for="schoolContactType in schoolContactTypes"
        :key="schoolContactType.code"
        class="pb-4"
      >
        <v-row>
          <v-col class="pb-0">
            <h2 style="color:#1A5A96">
              {{
                schoolContactType.label
              }}
            </h2>
          </v-col>
        </v-row>
        <v-row
          v-if="!schoolContactType.publiclyAvailable"
          cols="2"
        >
          <v-col class="pt-0" cols="12">
            <v-alert
              :id="`publiclyAvailableAlert${schoolContactType.label}`"
              color="#003366"
              density="compact"
              type="info"
              variant="tonal"
            >
              <p>
                Contacts of this type are only available to the ministry and not available to public.
              </p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row
          v-if="schoolContacts.has(schoolContactType.schoolContactTypeCode)"
          cols="2"
        >
          <v-col
            v-for="contact in schoolContacts.get(schoolContactType.schoolContactTypeCode)"
            :key="contact.schoolId"
            class="pt-0"
            cols="5"
            lg="4"
          >
            <SchoolContact
              :contact="contact"
              :can-edit-school-contact="canAddEditSchoolContact"
              @editSchoolContact:doShowEditSchoolContactForm="showContactEditForm(contact)"
              @removeSchoolContact:showConfirmationPrompt="removeContact"
            />
          </v-col>
        </v-row>
        <v-row
          v-else
          cols="2"
        >
          <v-col class="pt-0">
            <p>No contacts of this type have been listed.</p>
          </v-col>
        </v-row>
      </div>
    </template>
    <!--    new contact sheet -->
    <v-bottom-sheet
      v-model="newContactSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <NewSchoolContactPage
        v-if="newContactSheet"
        :school-contact-types="schoolContactTypes"
        :school-i-d="$route.params.schoolID"
        @newSchoolContact:closeNewSchoolContactPage="newContactSheet = !newContactSheet"
        @newSchoolContact:addNewSchoolContact="newSchoolContactAdded"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
      v-model="editContactSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <EditSchoolContactPage
        v-if="editContactSheet"
        :contact="editContact"
        :school-contact-types="schoolContactTypes"
        :school-i-d="$route.params.schoolID"
        @editSchoolContact:cancelEditSchoolContactPage="editContactSheet = !editContactSheet"
        @editSchoolContact:editSchoolContactSuccess="contactEditSuccess"
      />
    </v-bottom-sheet>
    <ConfirmationDialog ref="confirmationDialog" />
  </v-container>
</template>

<script>

import ApiService from '../../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../../util/PrimaryButton.vue';
import SchoolContact from './SchoolContact.vue';
import NewSchoolContactPage from './NewSchoolContactPage.vue';
import EditSchoolContactPage from './EditSchoolContactPage.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import alertMixin from '@/mixins/alertMixin';
import {mapState} from 'pinia';
import {isExpired, getStatusAuthorityOrSchool} from '@/utils/institute/status';
import {sortBy} from 'lodash';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';
import {SCHOOL_CONTACT_TYPES} from '@/utils/constants/SchoolContactTypes';

export default {
  name: 'SchoolContacts',
  components: {
    PrimaryButton, SchoolContact, NewSchoolContactPage, EditSchoolContactPage, ConfirmationDialog
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      independentArray: ['INDEPEND', 'INDP_FNS'],
      offshoreArray: ['OFFSHORE'],
      loadingCount: 0,
      schoolContactTypes: [],
      schoolContacts: new Map(),
      school: {},
      editContact: null,
      newContactSheet: false,
      editContactSheet: false,
      SCHOOL_CONTACT_TYPES: SCHOOL_CONTACT_TYPES
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo', 'INDEPENDENT_SCHOOLS_ADMIN_ROLE', 'SCHOOL_ADMIN_ROLE', 'OFFSHORE_SCHOOLS_ADMIN_ROLE']),
    ...mapState(instituteStore, ['schoolContactTypeCodes', 'independentAuthoritySchoolContacts', 'offshoreSchoolContacts', 'regularSchoolContactTypes']),
    loading() {
      return this.loadingCount !== 0;
    },
    canAddEditSchoolContact() {
      if (this.school.schoolCategoryCode && this.independentArray.includes(this.school.schoolCategoryCode)) {
        return (this.INDEPENDENT_SCHOOLS_ADMIN_ROLE || this.SCHOOL_ADMIN_ROLE) && this.isNotClosedAndNeverOpened();
      } else if(this.school.schoolCategoryCode && this.offshoreArray.includes(this.school.schoolCategoryCode)) {
        return (this.OFFSHORE_SCHOOLS_ADMIN_ROLE || this.SCHOOL_ADMIN_ROLE) && this.isNotClosedAndNeverOpened();
      }
      return this.SCHOOL_ADMIN_ROLE && this.isNotClosedAndNeverOpened();
    },
  },
  watch: {
    async school(value) {
      if (!this.schoolContactTypeCodes) {
        await this.loadSchoolContactTypeCodes();
      }

      if (value?.schoolCategoryCode === 'OFFSHORE') {
        this.schoolContactTypes = this.offshoreSchoolContacts;
      } else if (value?.schoolCategoryCode === 'INDEPEND') {
        this.schoolContactTypes = this.independentAuthoritySchoolContacts;
      } else {
        this.schoolContactTypes = this.regularSchoolContactTypes;
      }

      this.schoolContactTypes.sort((schoolContactA, schoolContactB) => schoolContactA.displayOrder - schoolContactB.displayOrder);
    }
  },
  created() {
    this.getThisSchoolsContacts();
  },
  methods: {
    async loadSchoolContactTypeCodes() {
      this.loadingCount += 1;
      await instituteStore().getSchoolContactTypeCodes()
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get the details of available School Contact Type Codes. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    getThisSchoolsContacts() {
      this.loadingCount += 1;
      let searchSchoolID = this.schoolID;

      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${searchSchoolID}`)
        .then(response => {
          this.schoolContacts = new Map();
          this.school = response.data;
          response.data.contacts = sortBy(response.data.contacts, ['firstName']);
          response.data.contacts.forEach(contact => {
            if (!isExpired(contact.expiryDate)) {
              if (!this.schoolContacts.has(contact.schoolContactTypeCode)) {
                this.schoolContacts.set(contact.schoolContactTypeCode, [contact]);
                return;
              }
              this.schoolContacts.get(contact.schoolContactTypeCode).push(contact);
            }
          });
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get a list of the school\'s contacts. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    backButtonClick() {
      this.$router.push({name: 'instituteSchoolList'});
    },
    showContactEditForm(contact) {
      this.editContact = contact;
      this.editContactSheet = true;
    },
    openNewContactSheet() {
      this.newContactSheet = !this.newContactSheet;
    },
    contactEditSuccess() {
      this.editContactSheet = false;
      this.getThisSchoolsContacts();
    },
    newSchoolContactAdded() {
      this.newContactSheet = !this.newContactSheet;
      this.getThisSchoolsContacts();
    },
    removeContact(schoolId, schoolContactId) {
      const opts = {
        color: '#003366',
        dense: false,
        width: 400,
        dark: true,
        titleBold: true,
        resolveText: 'Remove'
      };
      this.$refs.confirmationDialog.open('Please Confirm', 'Are you sure you want to remove this contact?', opts)
        .then((result) => {
          if (result) { // the component returns true only when user confirms the dialog.

            this.loadingCount += 1;
            ApiService.apiAxios.delete(`${Routes.institute.SCHOOL_CONTACT_URL}/${schoolId}/${schoolContactId}`).then(() => {
              this.setSuccessAlert('School contact removed successfully');
              this.getThisSchoolsContacts();
            }).catch(error => {
              console.log(error);
              this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'Error removing school contact. Please try again later');
            }).finally(() => {
              this.loadingCount -= 1;
            });

          }
        });
    },
    isNotClosedAndNeverOpened() {
      return getStatusAuthorityOrSchool(this.school) !== 'Closed' && getStatusAuthorityOrSchool(this.school) !== 'Never Opened';
    }
  },
};
</script>

<style scoped>

.v-dialog__content /deep/ .v-bottom-sheet {
    width: 30% !important;
}

.containerSetup {
    padding-right: 32em !important;
    padding-left: 32em !important;
}


</style>
