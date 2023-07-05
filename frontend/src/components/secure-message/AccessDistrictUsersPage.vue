<template>
  <v-container class="containerSetup">
    <v-row v-if="loadingUsers">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loadingUsers"
        />
      </v-col>
    </v-row>
    <v-row
      v-else
      no-gutters
    >
      <v-col>
        <v-row>
          <v-col class="pb-0">
            <h2>
              <strong>
                {{ districtName + ' (' + districtNumber + ')' }}
              </strong>
            </h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mt-1 mb-2 d-flex justify-start">
            <v-icon
              class="mt-1"
              size="small"
              color="#1976d2"
            >
              mdi-arrow-left
            </v-icon>
            <a
              class="ml-1"
              @click="backButtonClick"
            >Return to EDX District Access</a>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-chip
              id="primaryEdxActivationCode"
              :class="primaryEdxActivationCode != null ? 'primary_color' : 'secondary_color'"
            >
              <v-icon left>
                mdi-shield-key-outline
              </v-icon>
              Primary Activation Code:
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
              :click-action="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility"
            />
          </v-col>
        </v-row>
        <v-expand-transition>
          <v-row
            v-if="doShowGenerateNewPrimaryEdxActivationCodeDialog"
            id="generateNewPrimaryEdxActivationCodeDialog"
            :class="['d-sm-flex', 'align-center', 'searchBox']"
            class="px-2 mb-4"
            style="margin-right: 14em;margin-left: 14em;"
          >
            <v-col>
              <v-row no-gutters>
                <v-col>
                  <span>Generating a new Primary Activation Code for a district will replace the existing code for the district.</span>
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
                    :click-action="closeGenerateNewPrimaryEdxActivationCodeDialog"
                  />
                  <PrimaryButton
                    id="doGeneratePrimaryEdxActivationCodeButton"
                    class="ml-2"
                    text="Yes"
                    :click-action="doGeneratePrimaryEdxActivationCode"
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
              label="Name"
              variant="underlined"
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
              variant="underlined"
              clearable
              :items="districtRoles"
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
              :click-action="clearButtonClick"
            />
            <PrimaryButton
              id="user-search-button"
              class="ml-2"
              text="Search"
              :click-action="searchButtonClick"
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
              The Primary Activation Code will have to be communicated to any new users, as there are no district level administrators.
            </v-alert>
          </v-col>
        </v-row>
        <!-- user info -->
        <Spinner v-if="loadingUsers" />
        <v-row
          v-else
          class="d-flex align-stretch"
        >
          <v-col
            v-for="user in filteredUsers"
            :key="user.digitalID"
            xl="4"
            cols="6"
            class="pb-0"
          >
            <AccessUserCard
              :user-roles="user.edxUserDistricts[0].edxUserDistrictRoles"
              :user="user"
              :institute-code="districtId"
              :institute-roles="districtRoles"
              institute-type-code="DISTRICT"
              institute-type-label="District"
              @refresh="getUsersData"
            />
          </v-col>
          <v-col
            xl="4"
            cols="6"
            class="pb-0"
          >
            <v-row style="height: 100%;">
              <v-col style="min-height: 150px">
                <v-card class="h-100 add-new-user">
                  <v-row
                    class="add-new-user"
                    align="center"
                    justify="center"
                  >
                    <v-col class="d-flex justify-center">
                      <PrimaryButton
                        id="new-user-button"
                        icon="mdi-plus"
                        :large-icon="true"
                        :secondary="!!primaryEdxActivationCode"
                        :disabled="!primaryEdxActivationCode"
                        icon-left
                        text="Add New User"
                        :click-action="openNewUserInviteSheet"
                      />
                    </v-col>
                  </v-row>
                  <v-row v-if="!primaryEdxActivationCode">
                    <v-col class="mx-3 mb-3">
                      <v-alert
                        density="compact"
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
          <InviteUserPage
            :user-roles="districtRoles"
            :institute-code="districtId"
            institute-type-code="DISTRICT"
            institute-type-label="District"
            :district-name="districtName"
            :district-number="districtNumber"
            @access-user:messageSent="messageSent"
            @access-user:updateRoles="updateUserRoles"
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
import alertMixin from '@/mixins/alertMixin';
import InviteUserPage from '@/components/secure-message/InviteUserPage.vue';
import AccessUserCard from '@/components/secure-message/AccessUserCard.vue';
import Spinner from '@/components/common/Spinner.vue';
import router from '@/router';
import ClipboardButton from '@/components/util/ClipboardButton.vue';
import {edxStore} from '@/store/modules/edx';
import { ROLE } from '@/utils/constants/Roles';

export default {
  name: 'AccessDistrictUsersPage',
  components: {
    AccessUserCard,
    ClipboardButton,
    InviteUserPage,
    PrimaryButton,
    Spinner
  },
  mixins: [alertMixin],
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
      district: null,
      districtName: '',
      districtNumber: '',
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
    ...mapState(edxStore, ['districtRoles', 'districtRolesCopy']),
    hasAdminUsers() {
      return this.filteredUsers.filter(user => {
        return user.edxUserDistricts.some(district => district.edxUserDistrictRoles.some(role => role.edxRoleCode === ROLE.EDX_DISTRICT_ADMIN));
      })?.length > 0;
    }
  },
  async beforeMount() {
    if (this.districtRoles.length === 0) {
      await edxStore().getEdxDistrictRoles();
    }
  },
  created() {
    this.getUsersData();
    this.getDistrictName();
    this.getPrimaryEdxActivationCode();
  },
  methods: {
    enterPushed() {
      if (this.searchFilter.name) {
        this.searchButtonClick();
      }
    },
    sortUserData(users) {
      return users.sort((a, b) => {
        if (a.firstName > b.firstName) {
          return 1;
        } else if (a.firstName < b.firstName) {
          return -1;
        }
        return 0;
      });
    },
    getUsersData() {
      this.loadingUsers = true;
      const payload = {params: {districtID: this.districtId}};
      ApiService.apiAxios.get(Routes.edx.EXCHANGE_ACCESS_URL, payload)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        }).finally(() => {
          this.loadingUsers = false;
        });
    },
    getPrimaryEdxActivationCode() {
      ApiService.apiAxios.get(`${Routes.edx.PRIMARY_ACTIVATION_CODE_URL}/district/${this.districtId}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
        }).catch(e => {
          this.primaryEdxActivationCode = null;
          console.log(e);
        });
    },
    generateOrRegeneratePrimaryEdxActivationCode() {
      ApiService.apiAxios.post(`${Routes.edx.PRIMARY_ACTIVATION_CODE_URL}/district/${this.districtId}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
          this.setSuccessAlert(`The new Primary Activation Code is ${this.primaryEdxActivationCode.activationCode}.`);
        }).catch(e => {
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
    getDistrictName() {
      this.district = '';
      ApiService.apiAxios.get(`${Routes.cache.DISTRICT_DATA_URL}/${this.districtId}`)
        .then(response => {
          this.district = response.data;
          this.districtNumber = this.district.districtNumber;
          this.districtName = this.district.name;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
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
        return user.edxUserDistricts[0].edxUserDistrictRoles.some(role => role.edxRoleCode === roleName);
      }

      return true;
    },
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    },
    openNewUserInviteSheet() {
      this.newUserInviteSheet = !this.newUserInviteSheet;
    },
    messageSent() {
      this.newUserInviteSheet = !this.newUserInviteSheet;
    },
    updateUserRoles(newValue) {
      const eStore = edxStore();
      eStore.setDistrictRoles(newValue);
    },
    backButtonClick() {
      router.push({name: 'exchangeDistrictAccess'});
    },
    getChipColor() {
      if (this.primaryEdxActivationCode) {
        return 'success';
      }
      return 'secondary';
    },
    closeNewUserModal() {
      const eStore = edxStore();
      eStore.setDistrictRoles(JSON.parse(JSON.stringify(this.districtRolesCopy)));
      this.newUserInviteSheet = false; // close the modal window.
    },
    getDistrictNameForUserInvite() {
      return this.district.name;
    }
  }
};
</script>

<style scoped>
.sheetHeader {
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

.card-hint {
    color: #000 !important;
    font-size: 1rem;
}

.v-dialog__content >>> .v-bottom-sheet {
    width: 30% !important;
}

@media screen and (max-width: 950px) {
    .v-dialog__content /deep/ .v-bottom-sheet {
        width: 60% !important;
    }
}

.add-new-user {
    min-height: 150px;
}

.containerSetup {
    padding-right: 10em !important;
    padding-left: 10em !important;
}

</style>
