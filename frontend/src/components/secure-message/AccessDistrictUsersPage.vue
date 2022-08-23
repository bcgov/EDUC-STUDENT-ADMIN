<template>
  <v-container class="containerSetup">
    <v-row>
      <v-col>
        <h2>
          <strong>
            {{ getDistrictName() }}
          </strong>
        </h2>
      </v-col>
    </v-row>
    <v-divider class="divider"></v-divider>
    <v-row>
      <v-col :class="['d-sm-flex', 'align-center']">
        <div>Primary EDX Code - <span id="primaryEdxActivationCode">{{ this.primaryEdxActivationCode ? this.primaryEdxActivationCode.activationCode : `Code Not Found` }}</span></div>
        <PrimaryButton id="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibilityButton" short secondary icon="mdi-sync" class="ml-2 pl-2 pr-2" @click.native="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility">Generate New Code</PrimaryButton>
      </v-col>
    </v-row>
    <v-row no-gutters id="generateNewPrimaryEdxActivationCodeDialog" :class="['d-sm-flex', 'my-1', 'align-center']" v-if="this.doShowGenerateNewPrimaryEdxActivationCodeDialog">
      <v-col class="pa-3">
        <p>Generating a new Primary EDX Activation Code for a district will replace the existing code for the district. The new code will have to be communicated to the district administrator.</p>
        <p>Are you sure that you want to generate a new Primary EDX Activation Code?</p>
        <PrimaryButton id="doGeneratePrimaryEdxActivationCodeButton" short class="ml-2" @click.native="doGeneratePrimaryEdxActivationCode">Yes</PrimaryButton>
        <PrimaryButton id="closeGenerateNewPrimaryEdxActivationCodeDialogButton" short secondary class="ml-2" @click.native="closeGenerateNewPrimaryEdxActivationCodeDialog">No</PrimaryButton>
      </v-col>
    </v-row>
    <!--    search filter -->
    <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
      <v-col cols="12" md="4">
        <v-text-field id="name-text-field" label="Name" v-model="searchFilter.name" clearable></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select id="roleName-select-field" clearable :items="districtRoles" v-model="searchFilter.roleName" item-text="label" item-value="edxRoleCode" label="Role"></v-select>
      </v-col>
      <v-col cols="12" md="4" :class="['text-right']">
        <PrimaryButton id="user-clear-button" secondary @click.native="clearButtonClick">Clear</PrimaryButton>
        <PrimaryButton id="user-search-button" class="ml-2" @click.native="searchButtonClick" :disabled="searchEnabled()">Search</PrimaryButton>
      </v-col>
    </v-row>
    <!--    user info -->
    <Spinner v-if="loadingUsers"/>
    <v-row v-else>
      <v-col xl="4" cols="6" class="pb-0" v-for="user in filteredUsers" :key="user.digitalID">
        <AccessUserCard @refresh="getUsersData" :userRoles="user.edxUserSchools[0].edxUserSchoolRoles" :user="user" :institute-code="districtId" :institute-roles="districtRoles" institute-type-code="DISTRICT" institute-type-label="District"></AccessUserCard>
      </v-col>
      <v-col xl="4" cols="6" >
        <v-row>
          <v-col style="height: 184px">
            <v-card height="100%">
              <v-card-title>
                <v-row no-gutters>
                  <v-col class="d-flex justify-center mt-12">
                    <PrimaryButton icon="mdi-plus"
                                   :large-icon=true
                                   id="new-user-button"
                                   secondary
                                   text="Add New User"
                                   @click.native="newUserInviteSheet = !newUserInviteSheet"/>
                  </v-col>
                </v-row>
              </v-card-title>
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
              :userRoles="districtRoles"
              :institute-code="districtId"
               institute-type-code="DISTRICT"
              instituteTypeLabel="District"
              :districtName='getDistrictNameForUserInvite()'
              @access-user:messageSent="messageSent"
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
import {mapState} from 'vuex';
import PrimaryButton from '@/components/util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner';
import InviteUserPage from '@/components/secure-message/InviteUserPage';
import AccessUserCard from '@/components/secure-message/AccessUserCard';

export default {
  name: 'AccessDistrictUsersPage',
  mixins: [ alertMixin ],
  components: { InviteUserPage, PrimaryButton, AccessUserCard, Spinner },
  props: {
    districtId: {
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
    if (this.districtRoles.length === 0) {
      await this.$store.dispatch('edx/getEdxDistrictRoles');
    }
    if (this.districts.size === 0) {
      await this.$store.dispatch('app/getCodes');
    }
  },
  created() {
    this.getUsersData();
    this.getPrimaryEdxActivationCode();
  },
  methods: {
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
      const payload = {params: {districtId: this.districtId}};
      ApiService.apiAxios.get(Routes.edx.EXCHANGE_ACCESS_URL, payload)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        }).finally(() => {
          this.loadingUsers = false;
        });
    },
    getPrimaryEdxActivationCode() {
      ApiService.apiAxios.get(Routes.edx.PRIMARY_ACTIVATION_CODE_URL + `/${this.districtId}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
        }).catch(e => {
          this.primaryEdxActivationCode = null;
          console.log(e);
        });
    },
    generateOrRegeneratePrimaryEdxActivationCode() {
      ApiService.apiAxios.post(Routes.edx.PRIMARY_ACTIVATION_CODE_URL + `/${this.districtId}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
          this.setSuccessAlert(`The new Primary EDX Activation Code is ${ this.primaryEdxActivationCode.activationCode }.`);
        }).catch (e => {
          this.primaryEdxActivationCode = null;
          this.setFailureAlert('There was an error generating the Primary EDX Activation code. Please try again.',);
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
    getDistrictName() {
      const district = this.districts.get(this.districtId);
      return `${district.name} (${district.districtNumber})`;
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
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    },
    messageSent() {
      this.newUserInviteSheet = !this.newUserInviteSheet;
    },
    updateUserRoles(newValue){
      this.$store.commit('edx/setDistrictRoles', newValue);
    },
    closeNewUserModal(){
      this.$store.commit('edx/setDistrictRoles', JSON.parse(JSON.stringify(this.districtRolesCopy)));
      this.newUserInviteSheet = false; // close the modal window.
    },
    getDistrictNameForUserInvite(){
      return this.districts.get(this.districtId).name;
    }
  },
  computed: {
    ...mapState('app', ['districts']),
    ...mapState('edx', ['districtRoles','districtRolesCopy']),
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
