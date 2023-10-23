<template>
  <v-container
    fluid
  >
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
            v-if="canEditAuthorityContact"
            icon-left
            width="11em"
            icon="mdi-plus-thick"
            text="New Contact"
            @click-action="openNewContactSheet"
          />
        </v-col>
      </v-row>
      <div
        v-for="authorityContactType in authorityContactTypes"
        :key="authorityContactType.code"
        class="pb-4"
      >
        <v-row>
          <v-col class="pb-0">
            <h2
              id="authorityTypeLabel"
              style="color:#1A5A96"
            >
              {{
                authorityContactType.label
              }}
            </h2>
          </v-col>
        </v-row>
        <v-row
          v-if="authorityContacts.has(authorityContactType.authorityContactTypeCode)"
          cols="2"
        >
          <v-col
            v-for="contact in authorityContacts.get(authorityContactType.authorityContactTypeCode)"
            :key="contact.independentAuthorityId"
            class="pt-0"
            cols="5"
            lg="4"
          >
            <AuthorityContact
              :contact="contact"
              :can-edit-authority-contact="canEditAuthorityContact"
              @edit-authority-contact:show-edit-authority-contact-form="showContactEditForm(contact)"
              @remove-authority-contact:show-confirmation-prompt="removeContact"
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
      <NewAuthorityContactPage
        v-if="newContactSheet"
        :authority-contact-types="authorityContactTypes"
        :authority-i-d="$route.params.authorityID"
        @new-authority-contact:close-new-authority-contact-page="newContactSheet = !newContactSheet"
        @new-authority-contact:add-new-authority-contact="newAuthorityContactAdded"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
      v-model="editContactSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <EditAuthorityContactPage
        v-if="editContactSheet"
        :contact="editContact"
        :authority-contact-types="authorityContactTypes"
        :authority-i-d="$route.params.authorityID"
        @edit-authority-contact:cancel-edit-authority-contact-page="editContactSheet = !editContactSheet"
        @edit-authority-contact:edit-authority-contact-success="contactEditSuccess"
      />
    </v-bottom-sheet>
    <ConfirmationDialog ref="confirmationDialog" />
  </v-container>
</template>

<script>

import ApiService from '../../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../../util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';
import {isExpired, getStatusAuthorityOrSchool} from '@/utils/institute/status';
import {mapState} from 'pinia';
import AuthorityContact from '@/components/institute/authority/AuthorityContact.vue';
import NewAuthorityContactPage from '@/components/institute/authority/NewAuthorityContactPage.vue';
import {sortBy} from 'lodash';
import EditAuthorityContactPage from '@/components/institute/authority/EditAuthorityContactPage.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';

export default {
  name: 'AuthorityContacts',
  components: {
    EditAuthorityContactPage,
    PrimaryButton,
    AuthorityContact,
    NewAuthorityContactPage,
    ConfirmationDialog
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
      loadingCount: 0,
      authorityContactTypes: [],
      authorityContacts: new Map(),
      authority: {},
      newContactSheet: false,
      editContactSheet: false
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'INDEPENDENT_AUTHORITY_ADMIN_ROLE', 'OFFSHORE_SCHOOLS_ADMIN_ROLE']),
    ...mapState(instituteStore, ['authorityContactTypeCodes', 'independentAuthorityAuthorityContacts', 'offshoreAuthorityContacts', 'regularAuthorityContactTypes']),
    loading() {
      return this.loadingCount !== 0;
    },
    canEditAuthorityContact() {
      if(this.authority?.authorityTypeCode === 'OFFSHORE') {
        return this.INDEPENDENT_AUTHORITY_ADMIN_ROLE || this.OFFSHORE_SCHOOLS_ADMIN_ROLE;
      }
      return this.INDEPENDENT_AUTHORITY_ADMIN_ROLE && this.isNotClosedAndNeverOpened();
    },
  },
  watch: {
    async authority(value) {
      if (!this.authorityContactTypeCodes) {
        await this.loadAuthorityContactTypeCodes();
      }
      let contactTypes = [];
      if (value?.authorityTypeCode === 'OFFSHORE') {
        contactTypes = [...this.offshoreAuthorityContacts];
      } else if (value?.authorityTypeCode === 'INDEPENDNT') {
        contactTypes = [...this.independentAuthorityAuthorityContacts];
      } else {
        contactTypes = [...this.regularAuthorityContactTypes];
      }

      this.authorityContactTypes = contactTypes.sort((a, b) => {
        if (a.authorityContactTypeCode == 'INDAUTHREP') return -1;
        if (b.authorityContactTypeCode == 'INDAUTHREP') return 1;
        return 0;
      });
    }
  },
  created() {
    this.getThisAuthorityContacts();
  },
  methods: {
    async loadAuthorityContactTypeCodes() {
      this.loadingCount += 1;
      await instituteStore().getAllAuthorityContactTypeCodes()
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get the details of available Authority Contact Type Codes. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    getThisAuthorityContacts() {
      this.loadingCount += 1;

      ApiService.apiAxios.get(`${Routes.institute.AUTHORITY_DATA_URL}/${this.$route.params.authorityID}`)
        .then(response => {
          this.authorityContacts = new Map();
          this.authority = response.data;
          response.data.contacts = sortBy(response.data.contacts, ['firstName']);
          response.data.contacts.forEach(contact => {
            if (!isExpired(contact.expiryDate)) {
              if (!this.authorityContacts.has(contact.authorityContactTypeCode)) {
                this.authorityContacts.set(contact.authorityContactTypeCode, [contact]);
                return;
              }
              this.authorityContacts.get(contact.authorityContactTypeCode).push(contact);
            }
          });
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get Authority by ID. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    backButtonClick() {
      this.$router.push({name: 'instituteAuthoritiesList'});
    },
    contactEditSuccess() {
      this.editContactSheet = false;
      this.getThisAuthorityContacts();
    },
    newAuthorityContactAdded() {
      this.newContactSheet = !this.newContactSheet;
      this.getThisAuthorityContacts();
    },
    showContactEditForm(contact) {
      this.editContact = contact;
      this.editContactSheet = true;
    },
    openNewContactSheet() {
      this.newContactSheet = !this.newContactSheet;
    },
    removeContact(independentAuthorityId, authorityContactId) {
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
            ApiService.apiAxios.delete(`${Routes.institute.AUTHORITY_CONTACT_URL}/${independentAuthorityId}/${authorityContactId}`).then(() => {
              this.setSuccessAlert('Authority contact removed successfully');
              this.getThisAuthorityContacts();
            }).catch(error => {
              console.log(error);
              this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'Error removing authority contact. Please try again later');
            }).finally(() => {
              this.loadingCount -= 1;
            });
          }
        });
    },
    isNotClosedAndNeverOpened() {
      return getStatusAuthorityOrSchool(this.authority) !== 'Closed' && getStatusAuthorityOrSchool(this.authority) !== 'Never Opened';
    }
  },
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
