<template>
  <v-container>
    <v-row>
      <v-col>
        <h2>
          <strong>
            {{getSchoolName()}}
          </strong>
        </h2>
      </v-col>
      <v-col class="text-right">
        <PrimaryButton icon="mdi-plus">
          New User
        </PrimaryButton>
      </v-col>
    </v-row>
    <v-divider class="divider"></v-divider>
    <v-row>
      <v-col :class="['d-sm-flex', 'align-center']">
        <div>Primary EDX Code - <span id="primaryEdxActivationCode" v-if="this.primaryEdxActivationCode === null">code not found</span><span id="primaryEdxActivationCode" v-else>{{ this.primaryEdxActivationCode.activationCode }}</span></div>
        <PrimaryButton short secondary icon="mdi-sync" class="ml-2 pl-2 pr-2" @click.native="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility">Generate New Code</PrimaryButton>
      </v-col>
    </v-row>
    <v-row no-gutters id="generateNewPrimaryEdxActivationCodeDialog" :class="['d-sm-flex', 'my-1', 'align-center']" v-if="this.doShowGenerateNewPrimaryEdxActivationCodeDialog">
      <v-col class="pa-3">
        <p>Generating a new Primary EDX Activation Code for a school will replace the existing code for the school. The new code will have to be communicated to the school administrator.</p>
        <p>Are you sure that you want to generate a new Primary EDX Activation Code?</p>
        <PrimaryButton short class="ml-2" @click.native="doGeneratePrimaryEdxActivationCode">Yes</PrimaryButton>
        <PrimaryButton short secondary class="ml-2" @click.native="closeGenerateNewPrimaryEdxActivationCodeDialog">No</PrimaryButton>
      </v-col>
    </v-row>
    <!--    search filter -->
    <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
      <v-col cols="12" md="4">
        <v-text-field id="name-text-field" label="Name" v-model="searchFilter.name" clearable></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select id="roleName-select-field" clearable :items="roles" v-model="searchFilter.roleName" item-text="label" item-value="edxRoleCode" label="Role"></v-select>
      </v-col>
      <v-col cols="12" md="4" :class="['text-right']">
        <PrimaryButton id="user-clear-button" secondary @click.native="clearButtonClick">Clear</PrimaryButton>
        <PrimaryButton id="user-search-button" class="ml-2" @click.native="searchButtonClick" :disabled="searchEnabled()">Search</PrimaryButton>
      </v-col>
    </v-row>
    <!--    user info -->
    <Spinner v-if="loadingUsers"/>
    <v-row no-gutters v-else-if="filteredUsers.length">
      <v-col v-for="user in filteredUsers" :key="user.digitalID" cols="12">
        <AccessUserCard @refresh="getUsersData" :mincode="mincode" type="school" :userRoles="user.edxUserSchools[0].edxUserSchoolRoles" :user="user"></AccessUserCard>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        No users found
      </v-col>
    </v-row>
  </v-container>

</template>

<script>

import ApiService from '../../common/apiService';
import {setEmptyInputParams} from '@/utils/common';
import {isNotEmptyInputParams} from '@/utils/validation';
import {Routes} from '@/utils/constants';
import {mapState} from 'vuex';
import PrimaryButton from '@/components/util/PrimaryButton';
import AccessUserCard from './AccessUserCard';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner';

export default {
  name: 'AccessUsersPage',
  mixins: [ alertMixin ],
  components: { PrimaryButton, AccessUserCard, Spinner },
  props: {
    mincode: {
      type: String,
      required: true
    },
  },
  data() {
    return {
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
  beforeMount() {
    if (this.mincodeSchoolNames.size === 0) {
      this.$store.dispatch('app/getCodes');
    }

    if (this.roles.length === 0) {
      this.$store.dispatch('edx/getExchangeRoles');
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
      const payload = {params: {mincode: this.mincode}};
      ApiService.apiAxios.get(Routes.edx.EXCHANGE_ACCESS_URL, payload)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        }).finally(() => {
          this.loadingUsers = false;
        });
    },
    getPrimaryEdxActivationCode() {
      ApiService.apiAxios.get(Routes.edx.PRIMARY_ACTIVATION_CODE_URL + `/${this.mincode}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
        }).catch(e => {
          this.primaryEdxActivationCode = null;
          console.log(e);
        });
    },
    generateOrRegeneratePrimaryEdxActivationCode() {
      ApiService.apiAxios.post(Routes.edx.PRIMARY_ACTIVATION_CODE_URL + `/${this.mincode}`)
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
    getSchoolName() {
      const schoolName = this.mincodeSchoolNames.get(this.mincode);
      return `${schoolName} (${this.mincode})`;
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
        return user.edxUserSchools[0].edxUserSchoolRoles.some(role => role.edxRole.roleName === roleName);
      }

      return true;
    },
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    }
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('edx', ['roles'])
  }
};
</script>

<style scoped>
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

</style>
