<template>
  <v-container class="containerSetup mb-5">
    <v-row>
      <v-col>
        <h2>
          <strong>
            {{ getSchoolName() }}
          </strong>
        </h2>
      </v-col>
    </v-row>
    <v-row class="pb-2 mt-n3">
      <v-col class="d-flex">
        <v-icon
          :color="getStatusColorAuthorityOrSchool(getSchoolStatus)"
          dark
        >
         mdi-circle-medium
        </v-icon>
        <span>{{
          getSchoolStatus
        }}</span>
      </v-col>
      <v-col class="d-flex justify-end">
        <v-chip
          id="primaryEdxActivationCode"
          :class="primaryEdxActivationCode != null ? 'primary_color' : 'secondary_color'"
        >
          <v-icon left>
            mdi-shield-key-outline
          </v-icon>Primary Activation Code:
          {{ primaryEdxActivationCode ? primaryEdxActivationCode.activationCode : `Code Not Found` }}
        </v-chip>
        <ClipboardButton
          v-if="primaryEdxActivationCode"
          id="copyPrimaryEdxActivationCodeButton"
          :copy-text="primaryEdxActivationCode.activationCode"
          icon="mdi-content-copy"
          style="color: white"
        />
        <PrimaryButton
          id="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibilityButton"
          short
          secondary
          icon="mdi-sync"
          style="margin-top: 0.2em"
          text="Generate"
          class="ml-2 pl-2 pr-2"
          @click-action="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility"
        />
      </v-col>
    </v-row>
    <v-expand-transition>
      <v-row
        v-if="doShowGenerateNewPrimaryEdxActivationCodeDialog"
        id="generateNewPrimaryEdxActivationCodeDialog"
        :class="['d-sm-flex', 'align-center', 'searchBox']"
        class="px-2 mb-4"
      >
        <v-col>
          <v-row no-gutters>
            <v-col>
              <span>Generating a new Primary Activation Code for a school will replace the existing code for the school.</span>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Are you sure that you want to generate a new Primary Activation Code?</p>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="d-flex justify-end">
              <PrimaryButton
                id="closeGenerateNewPrimaryEdxActivationCodeDialogButton"
                secondary
                class="ml-2"
                text="No"
                @click-action="closeGenerateNewPrimaryEdxActivationCodeDialog"
              />
              <PrimaryButton
                id="doGeneratePrimaryEdxActivationCodeButton"
                class="ml-2"
                text="Yes"
                @click-action="doGeneratePrimaryEdxActivationCode"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-expand-transition>
    <v-divider class="divider" />

    <!--    search filter -->
    <v-row :class="['d-sm-flex', 'align-center', 'searchBox', 'mt-4']">
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          id="name-text-field"
          v-model="searchFilter.name"
          variant="underlined"
          label="Name"
          clearable
          @keyup.enter="enterPushed()"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-select
          id="roleName-select-field"
          v-model="searchFilter.roleName"
          clearable
          variant="underlined"
          :items="filteredSchoolRoles"
          item-title="label"
          item-value="edxRoleCode"
          label="Role"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
        :class="['text-right']"
      >
        <PrimaryButton
          id="user-clear-button"
          secondary
          text="Clear"
          @click-action="clearButtonClick"
        />
        <PrimaryButton
          id="user-search-button"
          class="ml-2"
          text="Search"
          @click-action="searchButtonClick"
          :disabled="searchEnabled()"
        />
      </v-col>
    </v-row>
    <!-- warning message for no existing users-->
    <v-row v-if="!hasAdminUsers && primaryEdxActivationCode">
      <v-col class="mx-3 px-0 pb-0">
        <v-alert
          density="compact"
          color="#003366"
          type="info"
          class="px-2"
          variant="tonal"
        >
          The Primary Activation Code will have to be communicated to any new users, as there are no school level administrators.
        </v-alert>
      </v-col>
    </v-row>
    <!--    user info -->
    <Spinner v-if="loadingUsers" />
    <v-row
      v-else
      class="d-flex align-stretch"
    >
      <v-col
        v-for="user in filteredUsers"
        :key="user.digitalID"
        lg="4"
        sm="6"
        cols="12"
        class="pb-0"
      >
        <AccessUserCard
          :user-roles="user?.edxUserSchools[0]?.edxUserSchoolRoles"
          :user="user"
          :institute-code="schoolID"
          :institute-roles="filteredSchoolRoles"
          institute-type-code="SCHOOL"
          institute-type-label="School"
          @refresh="getUsersData"
        />
      </v-col>
      <v-col
        lg="4"
        sm="6"
        cols="12"
        class="pb-0"
      >
        <v-row style="height: 100%;">
          <v-col style="min-height: 150px">
            <v-card class="add-new-user d-flex align-center flex-column h-100" style="min-height: 12em">
              <v-row
                class="add-new-user"
                align="center"
                justify="center"
              >
                <v-col class="justify-center">
                  <PrimaryButton
                    id="new-user-button"
                    icon="mdi-plus"
                    :large-icon="true"
                    :secondary="!!primaryEdxActivationCode"
                    icon-left
                    :disabled="!primaryEdxActivationCode"
                    text="Add New User"
                    @click-action="openNewUserInviteSheet"
                  />
                </v-col>
              </v-row>
              <v-row v-if="!primaryEdxActivationCode" class="align-end h-0 mt-n16">
                <v-col class="mx-3 mb-3">
                  <v-alert
                    density="compact"
                    style="background-color: #E9EBEF !important;"
                    color="#003366"
                    outlined
                    type="info"
                    class="pa-2"
                  >
                    <template #prepend>
                      <v-icon
                        color="#003366"
                        icon="mdi-information"
                      />
                    </template>
                    <span style="color: #003366">Before adding users, a Primary Activation Code must be generated.</span>
                  </v-alert>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-bottom-sheet
      v-model="newUserInviteSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <v-card
        v-if="newUserInviteSheet"
        id="newUserInviteVCard"
        class="information-window-v-card"
      >
        <v-card-title
          id="newUserInviteVCardTitle"
          class="sheetHeader pt-1 pb-1"
        >
          New User
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col>
              <v-alert
                density="compact"
                type="warning"
                class="mx-4"
                variant="tonal"
                v-if="getSchoolStatus === 'Closed'"
              >
                Please note, you are adding a user to a closed school.
              </v-alert>
            </v-col>
          </v-row>
          
          <InviteUserPage
            :user-roles="filteredSchoolRoles"
            :institute-code="schoolID"
            institute-type-code="SCHOOL"
            institute-type-label="School"
            :school-name="getSchoolNameForUserInvite()"
            @access-user:messageSent="closeNewUserModal"
            @access-user:cancelMessage="closeNewUserModal"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {setEmptyInputParams} from '@/utils/common';
import {isNotEmptyInputParams} from '@/utils/validation';
import {Routes} from '@/utils/constants';
import {mapState} from 'pinia';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import AccessUserCard from './AccessUserCard.vue';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner.vue';
import InviteUserPage from '@/components/secure-message/InviteUserPage.vue';
import ClipboardButton from '@/components/util/ClipboardButton.vue';
import {appStore} from '@/store/modules/app';
import {edxStore} from '@/store/modules/edx';
import { ROLE } from '@/utils/constants/Roles';
import {getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool} from '@/utils/institute/status';

export default {
  name: 'AccessUsersPage',
  components: {
    AccessUserCard,
    ClipboardButton,
    InviteUserPage,
    PrimaryButton,
    Spinner
  },
  mixins: [ alertMixin ],
  props: {
    schoolID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      newUserInviteSheet: false,
      primaryEdxActivationCode: null,
      users: [],
      filteredUsers: [],
      loadingUsers: true,
      searchFilter: {
        name: null,
        roleName: null,
      },
      doShowGenerateNewPrimaryEdxActivationCodeDialog: false
    };
  },
  computed: {
    ...mapState(appStore, ['schoolMap', 'config', 'gradSchoolMap']),
    ...mapState(edxStore, ['schoolRoles','schoolRolesCopy']),
    getSchoolStatus() {
      let school = this.schoolMap?.get(this.schoolID);
      return getStatusAuthorityOrSchool(school);
    },
    hasAdminUsers() {
      return this.users.filter(user => {
        return user.edxUserSchools.some(school => school.edxUserSchoolRoles.some(role => role.edxRoleCode === ROLE.EDX_SCHOOL_ADMIN));
      })?.length > 0;
    },
    filteredSchoolRoles() {
      let school = this.gradSchoolMap.get(this.schoolID);
      if(school?.canIssueTranscripts === 'N') {
        return this.schoolRoles.filter(role => role.edxRoleCode !== 'GRAD_SCH_ADMIN' && role.edxRoleCode !== 'GRAD_SCH_RO');
      } else if(this.getSchoolStatus === 'Closed') {
        return this.schoolRoles.filter(role => role.edxRoleCode === 'GRAD_SCH_ADMIN' || role.edxRoleCode === 'SECURE_EXCHANGE_SCHOOL');
      }
      return this.schoolRoles;
    }
  },
  async beforeMount() {
    if (this.schoolRoles.length === 0) {
      await edxStore().getSchoolExchangeRoles();
    }
    if (this.schoolMap.size === 0) {
      await appStore().getInstituteCodes();
    }
  },
  created() {
    this.getUsersData();
    this.getPrimaryEdxActivationCode();
  },
  methods: {
    getStatusColorAuthorityOrSchool, 
    getStatusAuthorityOrSchool,
    enterPushed() {
      if (this.searchFilter.name) {
        this.searchButtonClick();
      }
    },
    sortUserData(users){
      return users.sort((a, b) => {
        if (a.firstName > b.firstName) {
          return 1;
        } else if (a.firstName < b.firstName) {
          return -1;
        }
        return 0;
      } );
    },
    getUsersData() {
      this.loadingUsers = true;
      ApiService.apiAxios.get(`${Routes.edx.EDX_SCHOOL_USERS_URL}/${this.schoolID}`)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        })
        .finally(() => {
          this.loadingUsers = false;
        });
    },
    getPrimaryEdxActivationCode() {
      ApiService.apiAxios.get(`${Routes.edx.PRIMARY_ACTIVATION_CODE_URL}/school/${this.schoolID}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
        }).catch(e => {
          this.primaryEdxActivationCode = null;
          console.log(e);
        });
    },
    generateOrRegeneratePrimaryEdxActivationCode() {
      ApiService.apiAxios.post(`${Routes.edx.PRIMARY_ACTIVATION_CODE_URL }/school/${this.schoolID}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
          this.setSuccessAlert(`The new Primary Activation Code is ${ this.primaryEdxActivationCode.activationCode }.`);
        }).catch (e => {
          this.primaryEdxActivationCode = null;
          this.setFailureAlert('There was an error generating the Primary Activation code. Please try again.',);
          console.log(e);
        });
    },
    toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility() {
      this.doShowGenerateNewPrimaryEdxActivationCodeDialog = !this.doShowGenerateNewPrimaryEdxActivationCodeDialog;
    },
    closeGenerateNewPrimaryEdxActivationCodeDialog() {
      this.doShowGenerateNewPrimaryEdxActivationCodeDialog = false;
    },
    doGeneratePrimaryEdxActivationCode() {
      this.generateOrRegeneratePrimaryEdxActivationCode();
      this.closeGenerateNewPrimaryEdxActivationCodeDialog();
    },
    getSchoolName() {
      const schoolName = this.schoolMap.get(this.schoolID)?.schoolName;
      const mincode = this.schoolMap.get(this.schoolID)?.mincode;
      return `${mincode} - ${schoolName}`;
    },
    clearButtonClick() {
      setEmptyInputParams(this.searchFilter);
      this.searchButtonClick();
    },
    searchButtonClick() {
      this.filteredUsers = this.users
        .filter(user => {
          return this.nameFilter(user, this.searchFilter?.name) && this.roleFilter(user, this.searchFilter?.roleName);
        });
    },
    nameFilter(user, name) {
      if (name) {
        return `${user.firstName} ${user.lastName}`.toLowerCase().includes(name.toLowerCase());
      }

      return true;
    },
    roleFilter(user, roleName) {
      if (roleName) {
        return user.edxUserSchools[0].edxUserSchoolRoles.some(role => role.edxRoleCode === roleName);
      }

      return true;
    },
    openNewUserInviteSheet(){
      this.newUserInviteSheet = !this.newUserInviteSheet;
    },
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    },
    closeNewUserModal(){
      const eStore = edxStore();
      eStore.setSchoolRoles(JSON.parse(JSON.stringify(this.schoolRolesCopy)));
      this.newUserInviteSheet = false; // close the modal window.
    },
    getSchoolNameForUserInvite(){
      return this.schoolMap.get(this.schoolID).schoolName;
    }
  }
};
</script>

<style scoped>
.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.divider {
    border-color: #FCBA19;
    border-width: 2px;
    opacity: unset;
}

#generateNewPrimaryEdxActivationCodeDialog {
  border-radius: 5px;
  background-color: #e7ebf0;
}

.searchBox {
  padding-left: 1em;
  padding-right: 1em;
  margin-left: 0;
  margin-right: 0;
  border-radius: 5px;
  background-color: #F2F2F2;
}

.primary_color {
  background-color: #4caf50;
  color: white;
}
.secondary_color {
  background-color: #424242;
  color: white;
}

.add-new-user {
  min-height: 150px;
}

.v-dialog__content >>> .v-bottom-sheet {
  width: 30% !important;
}

@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}


</style>
