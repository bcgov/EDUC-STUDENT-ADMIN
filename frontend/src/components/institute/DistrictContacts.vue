<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-col class="mt-1 d-flex justify-start">
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
      <v-row>
        <v-col
          cols="12"
          class="d-flex justify-start"
        >
          <v-row no-gutters>
            <v-col cols="12">
              <h2 class="subjectHeading">
                {{
                  districtDetails.districtNumber
                }} - {{
                  districtDetails.displayName
                }}
              </h2>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
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
            id="viewDistrictDetailsButton"
            class="mr-2"
            secondary
            icon-left
            icon="mdi-domain"
            :to="`/district/${districtID}`"
            text="View District Details"
          />
          <PrimaryButton
            v-if="canEditDistrictContact"
            icon-left
            width="11em"
            icon="mdi-plus-thick"
            text="New Contact"
            :click-action="showNewContactSheet"
          />
        </v-col>
      </v-row>
      <div
        v-for="districtContactType in districtContactTypes"
        :key="districtContactType.code"
        class="mt-5"
      >
        <v-row
          class="mb-1"
          no-gutters
        >
          <v-col>
            <h2 style="color:#1A5A96">
              {{
                districtContactType.label
              }}
            </h2>
          </v-col>
        </v-row>
        <v-row v-if="!districtContactType.publiclyAvailable">
          <v-col>
            <v-alert
              style="background-color: #003366"
              color="white"
              density="compact"
              variant="text"
              type="info"
            >
              Contacts of this type are only available to the
              ministry and not available to public.
            </v-alert>
          </v-col>
        </v-row>
        <v-row
          v-if="districtContacts.has(districtContactType.districtContactTypeCode)"
          class="mt-0 mb-0"
          cols="2"
        >
          <v-col
            v-for="contact in districtContacts.get(districtContactType.districtContactTypeCode)"
            :key="contact.schoolId"
            cols="5"
            lg="4"
          >
            <DistrictContact
              :contact="contact"
              :can-edit-district-contact="canEditDistrictContact"
              @edit-district-contact:do-show-edit-district-contact-form="showDistrictEditForm(contact)"
              @remove-school-contact:show-confirmation-prompt="removeContact"
            />
          </v-col>
        </v-row>
        <v-row
          v-else
          no-gutters
          cols="2"
        >
          <v-col>
            <p>No contacts of this type have been listed.</p>
          </v-col>
        </v-row>
      </div>
    </template>
    <v-bottom-sheet
      v-model="newContactSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <NewDistrictContactPage
        v-if="newContactSheet"
        :district-contact-types="districtContactTypes"
        :district-i-d="$route.params.districtID"
        @new-district-contact:close-new-district-contact-page="newContactSheet = !newContactSheet"
        @new-district-contact:add-new-district-contact="newDistrictContactAdded"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
      v-model="editContactSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <EditDistrictContactPage
        v-if="editContactSheet"
        :contact="editContact"
        :district-contact-types="districtContactTypes"
        :district-i-d="$route.params.districtID"
        @edit-district-contact:cancel-edit-district-contact-page="editContactSheet = !editContactSheet"
        @edit-district-contact:edit-district-contact-success="contactEditSuccess"
      />
    </v-bottom-sheet>
    <ConfirmationDialog ref="confirmationDialog" />
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import DistrictContact from '@/components/institute/DistrictContact.vue';
import NewDistrictContactPage from '@/components/institute/NewDistrictContactPage.vue';
import EditDistrictContactPage from '@/components/institute/EditDistrictContactPage.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import alertMixin from '@/mixins/alertMixin';
import {mapState} from 'pinia';
import {sortBy} from 'lodash';
import {isExpired} from '@/utils/institute/status';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'DistrictContactsPage',
  components: {
    NewDistrictContactPage,
    EditDistrictContactPage,
    DistrictContact,
    PrimaryButton,
    ConfirmationDialog,
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: false,
      default: undefined
    },
  },
  data() {
    return {
      loadingCount: 0,
      districtContactTypes: [],
      districtContacts: new Map(),
      districtDetails: '',
      editContact: null,
      newContactSheet: false,
      editContactSheet: false
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo', 'DISTRICT_ADMIN_ROLE']),
    loading() {
      return this.loadingCount !== 0;
    },
    canEditDistrictContact() {
      return this.DISTRICT_ADMIN_ROLE && this.districtDetails.districtStatusCode === 'ACTIVE';
    }
  },
  created() {
    this.getDistrictContactTypeCodes();
    this.getThisDistrictsContacts();
  },
  methods: {
    getDistrictContactTypeCodes() {
      this.loadingCount += 1;
      ApiService.apiAxios.get(Routes.cache.DISTRICT_CONTACT_TYPE_CODES + '?active=true')
        .then(response => {
          this.districtContactTypes = response.data;
          this.districtContactTypes.sort((a, b) => a.displayOrder - b.displayOrder);
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get the details of available District Contact Type Codes. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    getThisDistrictsContacts() {
      this.loadingCount += 1;
      let searchDistrictID = this.districtID ? this.districtID : this.userInfo.activeInstituteIdentifier;

      ApiService.apiAxios.get(`${Routes.institute.DISTRICT_DATA_URL}/${searchDistrictID}`)
        .then(response => {
          this.districtDetails = response.data;
          this.districtContacts = new Map();
          response.data.contacts = sortBy(response.data.contacts, ['firstName']);
          response.data.contacts.forEach(contact => {
            if (!isExpired(contact.expiryDate)) {
              if (!this.districtContacts.has(contact.districtContactTypeCode)) {
                this.districtContacts.set(contact.districtContactTypeCode, [contact]);
                return;
              }
              this.districtContacts.get(contact.districtContactTypeCode).push(contact);
            }
          });
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get a list of the district\'s contacts. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    showNewContactSheet() {
      this.newContactSheet = !this.newContactSheet;
    },
    backButtonClick() {
      this.$router.push({name: 'instituteDistrict'});
    },
    showDistrictEditForm(contact) {
      this.editContact = contact;
      this.editContactSheet = true;
    },
    contactEditSuccess() {
      this.editContactSheet = false;
      this.getThisDistrictsContacts();
    },
    newDistrictContactAdded() {
      this.newContactSheet = !this.newContactSheet;
      this.getThisDistrictsContacts();
    },
    removeContact(districtId, districtContactId) {
      const opts = {
        color: '#003366',
        dense: false,
        dark: true,
        width: 400,
        titleBold: true,
        resolveText: 'Remove'
      };
      this.$refs.confirmationDialog.open('Please Confirm', 'Are you sure you want to remove this contact?', opts)
        .then((result) => {
          if (result) { // the component returns true only when user confirms the dialog.
            this.loadingCount += 1;
            ApiService.apiAxios.delete(`${Routes.institute.DISTRICT_CONTACT_URL}/${districtId}/${districtContactId}`).then(() => {
              this.setSuccessAlert('District contact removed successfully');
              this.getThisDistrictsContacts();
            }).catch(error => {
              console.log(error);
              this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'Error removing district contact. Please try again later');
            }).finally(() => {
              this.loadingCount -= 1;
            });
          }
        });
    },
  }
};
</script>

<style scoped>

.v-dialog__content /deep/ .v-bottom-sheet {
    width: 30% !important;
}

@media screen and (max-width: 950px) {
    .v-dialog__content /deep/ .v-bottom-sheet {
        width: 60% !important;
    }
}

.containerSetup {
    padding-right: 32em !important;
    padding-left: 32em !important;
}

@media screen and (max-width: 1950px) {
    .containerSetup {
        padding-right: 20em !important;
        padding-left: 20em !important;
    }
}

@media screen and (max-width: 1200px) {
    .containerSetup {
        padding-right: 4em !important;
        padding-left: 4em !important;
    }
}

</style>
