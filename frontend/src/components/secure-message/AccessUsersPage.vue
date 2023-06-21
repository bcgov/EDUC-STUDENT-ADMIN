<template>
  <v-container class="containerSetup">
    <v-row>
      <v-col class="pb-0">
        <h2>
          <strong>
            {{getSchoolName()}}
          </strong>
        </h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon class="mt-1" small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1 mt-1" @click="backButtonClick">Return to EDX School Access</a>
      </v-col>
      <v-col class="d-flex justify-end">
        <v-chip id="primaryEdxActivationCode" :color="getChipColor()">
          <v-icon left>
            mdi-shield-key-outline
          </v-icon>Primary Activation Code:
          {{ this.primaryEdxActivationCode ? this.primaryEdxActivationCode.activationCode : `Code Not Found` }}
        </v-chip>
        <ClipboardButton id="copyPrimaryEdxActivationCodeButton" v-if="this.primaryEdxActivationCode" :copyText="this.primaryEdxActivationCode.activationCode" icon="$copy"></ClipboardButton>
        <PrimaryButton id="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibilityButton" short secondary icon="mdi-sync" style="margin-top: 0.2em" class="ml-2 pl-2 pr-2" @click.native="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility">Generate</PrimaryButton>
      </v-col>
    </v-row>
    <v-expand-transition>
      <v-row :class="['d-sm-flex', 'align-center', 'searchBox']" class="px-2 mb-4" style="margin-right: 14em;margin-left: 14em;" id="generateNewPrimaryEdxActivationCodeDialog" v-if="this.doShowGenerateNewPrimaryEdxActivationCodeDialog">
        <v-col>
          <v-row no-gutters >
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
              <PrimaryButton id="closeGenerateNewPrimaryEdxActivationCodeDialogButton" secondary class="ml-2" @click.native="closeGenerateNewPrimaryEdxActivationCodeDialog">No</PrimaryButton>
              <PrimaryButton id="doGeneratePrimaryEdxActivationCodeButton" class="ml-2" @click.native="doGeneratePrimaryEdxActivationCode">Yes</PrimaryButton>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-expand-transition>
    <v-divider class="divider"></v-divider>

    <!--    search filter -->
    <v-row :class="['d-sm-flex', 'align-center', 'searchBox', 'mt-4']">
      <v-col cols="12" md="4">
        <v-text-field id="name-text-field" label="Name" v-model="searchFilter.name" clearable @keyup.enter="enterPushed()"></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select id="roleName-select-field" clearable :items="schoolRoles" v-model="searchFilter.roleName" item-text="label" item-value="edxRoleCode" label="Role"></v-select>
      </v-col>
      <v-col cols="12" md="4" :class="['text-right']">
        <PrimaryButton id="user-clear-button" secondary @click.native="clearButtonClick">Clear</PrimaryButton>
        <PrimaryButton id="user-search-button" class="ml-2" @click.native="searchButtonClick" :disabled="searchEnabled()">Search</PrimaryButton>
      </v-col>
    </v-row>
    <!--    user info -->
    <Spinner v-if="loadingUsers"/>
    <v-row class="d-flex align-stretch" v-else>
      <v-col xl="4" cols="6" class="pb-0" v-for="user in filteredUsers" :key="user.digitalID">
        <AccessUserCard @refresh="getUsersData" :userRoles="user.edxUserSchools[0].edxUserSchoolRoles" :user="user" :institute-code="schoolID" :institute-roles="schoolRoles" institute-type-code="SCHOOL" institute-type-label="School"></AccessUserCard>
      </v-col>
      <v-col xl="4" cols="6" class="pb-0">
        <v-row style="height: 100%;">
          <v-col style="min-height: 184px">
            <v-card class="h-100 add-new-user">
              <v-row class="add-new-user" align="center" justify="center">
                <v-col class="d-flex justify-center">
                  <PrimaryButton icon="mdi-plus"
                                 :large-icon=true
                                 id="new-user-button"
                                 secondary
                                 icon-left
                                 :disabled="!primaryEdxActivationCode"
                                 text="Add New User"
                                 @click.native="newUserInviteSheet = !newUserInviteSheet"/>
                </v-col>
              </v-row>
              <v-row v-if="!primaryEdxActivationCode">
                <v-col class="mx-3">
                  <v-alert
                    dense
                    style="background-color: #E9EBEF !important;"
                    color="#003366"
                    outlined
                    type="info"
                    class="pa-2"
                  >
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
          id="newUserInviteVCard"
          v-if="newUserInviteSheet"
          class="information-window-v-card">
        <v-card-title id="newUserInviteVCardTitle" class="sheetHeader pt-1 pb-1">New User</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <InviteUserPage
              :userRoles="schoolRoles"
              :institute-code="schoolID"
              institute-type-code="SCHOOL"
              instituteTypeLabel="School"
              :schoolName='getSchoolNameForUserInvite()'
              @access-user:messageSent="closeNewUserModal"
              @access-user:updateRoles="updateUserRoles"
              @access-user:cancelMessage="closeNewUserModal"
          >
          </InviteUserPage>
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
import router from '@/router';
import ClipboardButton from '@/components/util/ClipboardButton.vue';
import {appStore} from '@/store/modules/app';
import {edxStore} from '@/store/modules/edx';

export default {
  name: 'AccessUsersPage',
  mixins: [ alertMixin ],
  components: {
    AccessUserCard,
    ClipboardButton,
    InviteUserPage,
    PrimaryButton,
    Spinner
  },
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
        name: '',
        roleName: '',
      },
      doShowGenerateNewPrimaryEdxActivationCodeDialog: false
    };
  },
  async beforeMount() {
    if (this.schoolRoles.length === 0) {
      await edxStore().getSchoolExchangeRoles();
    }
    if (this.schoolMap.size === 0) {
      await appStore().getCodes();
    }
  },
  created() {
    this.getUsersData();
    this.getPrimaryEdxActivationCode();
  },
  methods: {
    enterPushed() {
      if (this.searchFilter.name) {
        this.searchButtonClick();
      }
    },
    getChipColor(){
      if(this.primaryEdxActivationCode){
        return 'success';
      }
      return 'secondary';
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
      const payload = {params: {schoolID: this.schoolID}};
      ApiService.apiAxios.get(Routes.edx.EXCHANGE_ACCESS_URL, payload)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        }).finally(() => {
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
      return `${schoolName} (${mincode})`;
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
    backButtonClick() {
      router.push({name: 'exchangeAccess'});
    },
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    },
    updateUserRoles(newValue){
      const eStore = edxStore();
      eStore.setSchoolRoles(newValue);
    },
    closeNewUserModal(){
      const eStore = edxStore();
      eStore.setSchoolRoles(JSON.parse(JSON.stringify(this.schoolRolesCopy)));
      this.newUserInviteSheet = false; // close the modal window.
    },
    getSchoolNameForUserInvite(){
      return this.schoolMap.get(this.schoolID).schoolName;
    }
  },
  computed: {
    ...mapState(appStore, ['schoolMap']),
    ...mapState(edxStore, ['schoolRoles','schoolRolesCopy']),
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
  border-width: medium;
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

.add-new-user {
    min-height: 184px;
}

.card-hint {
  color: #000 !important;
  font-size: 1rem;
}
.v-dialog__content >>> .v-bottom-sheet {
  width: 30% !important;
}

@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}

.containerSetup{
  padding-right: 10em !important;
  padding-left: 10em !important;
}

</style>
