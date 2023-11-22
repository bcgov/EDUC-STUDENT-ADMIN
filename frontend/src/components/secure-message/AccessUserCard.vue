<template>
  <v-row style="height: 100%; margin-bottom: 1.5em">
    <v-col>
      <v-card
        class="d-flex flex-column h-100"
      >
        <v-card-title class="pb-0">
          <v-row no-gutters>
            <v-col>
              <v-row no-gutters>
                <v-col cols="10">
                  <strong class="name">{{ `${user.firstName} ${user.lastName}` }}</strong>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="12"
                  class="pt-1"
                />
              </v-row>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-subtitle>
          <p
            v-if="getExpiryDate(user)"
            class="expiry-date"
          >
            {{ formatExpiryDate(getExpiryDate(user)) }}
          </p>
        </v-card-subtitle>
        <v-card-text class="pb-0">
          <v-list class="pt-0">
            <v-list-item
              v-if="user.email"
              class="pl-0"
            >
              <v-icon
                icon="mdi-email"
                style="margin-bottom: 3px;"
                start
              />
              <span id="user-email"> {{ user.email }}</span>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-text
          class="pt-0"
        >
          <div>
            <v-chip-group>
              <v-chip
                v-for="role in userRoles"
                :key="role.edxRoleCode"
                disabled
                class="ma-1"
              >
                {{ getRoleLabel(role) }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-card-text>
        <ConfirmationDialog ref="confirmRemoveUser">
          <template #message>
            <p>Are you sure you want to remove this user's access for the {{ instituteTypeLabel.toLowerCase() }}?</p>
          </template>
        </ConfirmationDialog>
        <ConfirmationDialog ref="confirmRelinkUser">
          <template #message>
            <p class="mb-4">Re-linking an account will remove the current user and resend the activation code so
              that the user can set up EDX access with their new credentials.</p>
            <p class="font-weight-bold">Are you sure you want to re-link this account?</p>
          </template>
        </ConfirmationDialog>
        <v-spacer />
        <v-card-actions
          v-if="!editState && !relinkState && !deleteState"
          class="justify-start"
        >
          <v-btn
            color="#003366"
            variant="text"
            @click="clickEditButton"
          >
            Edit
          </v-btn>
          <v-btn
            color="red"
            variant="text"
            @click="clickDeleteButton"
          >
            Remove
          </v-btn>
          <v-btn
            color="#003366"
            variant="text"
            @click="clickRelinkButton"
          >
            Re-link
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <v-bottom-sheet
    v-model="editUserSheet"
    :no-click-animation="true"
    :inset="true"
    :persistent="true"
  >
    <v-card
      v-if="editUserSheet"
      id="editUserVCard"
      class="information-window-v-card"
    >
      <v-card-title
        id="editUserInviteVCardTitle"
        class="header pt-1 pb-1"
      >
        Edit {{user.firstName}} {{user.lastName}}
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-alert
            v-if="!minimumRolesSelected"
            id="logoutAlert"
            class="mt-4"
            color="#003366"
            density="compact"
            type="info"
            variant="tonal"
        >
          <span>Please select at least one role for {{ user.firstName }}.</span>
        </v-alert>
        <v-list
            v-model:selected="selectedRoles"
            lines="two"
            return-object
            select-strategy="classic"
        >
          <div
              v-for="newrole in instituteRoles"
              :key="newrole.edxRoleCode"
              :value="newrole.edxRoleCode"
          >
            <v-list-item
                :value="newrole.edxRoleCode"
            >
              <template #prepend="{ isActive }">
                <v-list-item-action>
                  <v-checkbox-btn :model-value="isActive" />
                </v-list-item-action>
              </template>

              <v-list-item-title>{{ newrole.label }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ newrole.roleDescription }}
              </v-list-item-subtitle>
            </v-list-item>
          </div>
        </v-list>

        <DatePicker
            id="accessExpiryDate"
            v-model="accessExpiryDate"
            class="pl-7"
            label="Access Expiry Date"
            model-type="yyyy-MM-dd'T'00:00:00"
            :min-date="minExpiryDate"
            @clear-date="clearExpiryDate"
        />
        <v-row no-gutters class="py-4 justify-end">
          <v-col class="mt-0 d-flex justify-end">
            <PrimaryButton
                :id="`user-cancel-edit-button-${user.firstName}-${user.lastName}`"
                width="5em"
                text="Cancel"
                class="mr-2"
                secondary
                @click-action="clickEditButton"
            />
            <PrimaryButton
                :id="`user-save-action-button-${user.firstName}-${user.lastName}`"
                text="Save"
                :disabled="!minimumRolesSelected"
                @click-action="clickSaveButton"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import {EDX_SAGA_REQUEST_DELAY_MILLISECONDS, Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {formatDate} from '@/utils/format';
import DatePicker from '../util/DatePicker.vue';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import ConfirmationDialog from "@/components/util/ConfirmationDialog.vue";

export default {
  name: 'AccessUserCard',
  components: {ConfirmationDialog, PrimaryButton, DatePicker},
  mixins: [alertMixin],
  props: {
    user: {
      type: Object,
      required: true
    },
    userRoles: {
      type: Array,
      required: true
    },
    instituteRoles: {
      type: Array,
      required: true
    },
    instituteCode: {
      type: String,
      required: true
    },
    instituteTypeLabel: {
      type: String,
      required: true
    },
    instituteTypeCode: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      editUserSheet: false,
      deleteState: false,
      relinkState: false,
      isRelinking: false,
      selectedRoles: [],
      accessExpiryDate: null,
      from: 'uuuu-MM-dd\'T\'HH:mm:ss',
      pickerFormat: 'uuuu-MM-dd',
      minExpiryDate: LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString()
    };
  },
  computed: {
    minimumRolesSelected() {
      return this.selectedRoles.length > 0;
    }
  },
  methods: {
    isDistrictUser(){
      return this.instituteTypeCode === 'DISTRICT';
    },
    getExpiryDate(user){
      if(!this.isDistrictUser()){
        return user?.edxUserSchools[0]?.expiryDate;
      }
      return user?.edxUserDistricts[0]?.expiryDate;
    },
    getRoleLabel(curRole) {
      if (this.instituteRoles.length > 0) {
        return this.instituteRoles.find((role) => role.edxRoleCode === curRole.edxRoleCode).label;
      }
      return '';
    },
    clickEditButton() {
      this.relinkState = false;
      this.deleteState = false;
      this.editUserSheet = !this.editUserSheet;
      this.setUserRolesAsSelected();
    },
    async clickDeleteButton() {
      const confirmation = await this.$refs.confirmRemoveUser.open('Confirm Removal of User', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      this.loading = true;

      if (this.instituteTypeCode === 'SCHOOL') {
        this.removeSchoolUser();
      } else {
        this.removeDistrictUser();
      }
    },
    async clickRelinkButton() {
      const confirmation = await this.$refs.confirmRelinkUser.open('Confirm Re-link of User', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Re-link', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      this.loading = true;

      this.isRelinking = true;
      if (this.instituteTypeCode === 'SCHOOL') {
        this.relinkSchoolUser();
      } else {
        this.relinkDistrictUser();
      }
    },
    formatExpiryDate(date) {
      return formatDate(date, this.from, this.pickerFormat);
    },
    relinkSchoolUser() {
      const payload = {
        params: {
          userToRelink: this.user.edxUserID,
          edxUserExpiryDate: this.getExpiryDate(this.user)
        }
      };
      const userSchool = this.user.edxUserSchools.find(school => school.schoolID === this.instituteCode);
      payload.params.schoolID = this.instituteCode;
      payload.params.userSchoolID = userSchool.edxUserSchoolID;
      ApiService.apiAxios.post(Routes.edx.EDX_RELINK_SCHOOL_USER, payload)
        .then(() => {
          this.setSuccessAlert('User has been removed, email sent with instructions to re-link.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while re-linking a user. Please try again later.');
          console.log(error);
        }).finally(() => {
          setTimeout(() => {
            this.$emit('refresh');
          }, EDX_SAGA_REQUEST_DELAY_MILLISECONDS);
        });
    },
    relinkDistrictUser() {
      const payload = {
        params: {
          userToRelink: this.user.edxUserID,
          edxUserExpiryDate: this.getExpiryDate(this.user)
        }
      };
      const userDistrict = this.user.edxUserDistricts.find(district => district.districtID === this.instituteCode);
      payload.params.districtID = this.instituteCode;
      payload.params.edxUserDistrictID = userDistrict.edxUserDistrictID;
      ApiService.apiAxios.post(Routes.edx.EDX_RELINK_DISTRICT_USER, payload)
        .then(() => {
          this.setSuccessAlert('User has been removed, email sent with instructions to re-link.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while re-linking a user. Please try again later.');
          console.log(error);
        }).finally(() => {
          setTimeout(() => {
            this.$emit('refresh');
          }, EDX_SAGA_REQUEST_DELAY_MILLISECONDS);
        });

    },
    removeSchoolUser() {
      const payload = {
        params: {
          userToRemove: this.user.edxUserID,
        }
      };
      const userSchool = this.user.edxUserSchools.find(school => school.schoolID === this.instituteCode);
      payload.params.userSchoolID = userSchool.edxUserSchoolID;
      ApiService.apiAxios.post(Routes.edx.EDX_REMOVE_SCHOOL_USER, payload)
        .then(() => {
          this.setSuccessAlert('User has been removed.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while removing a user. Please try again later.');
          console.log(error);
        }).finally(() => {
          this.$emit('refresh');
        });
    },
    removeDistrictUser() {
      const payload = {
        params: {
          userToRemove: this.user.edxUserID,
        }
      };
      const userDistrict = this.user.edxUserDistricts.find(district => district.districtID === this.instituteCode);
      payload.params.districtID = this.instituteCode;
      payload.params.edxUserDistrictID = userDistrict.edxUserDistrictID;
      ApiService.apiAxios.post(Routes.edx.EDX_REMOVE_DISTRICT_USER, payload)
        .then(() => {
          this.setSuccessAlert('User has been removed.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while removing a user. Please try again later.');
          console.log(error);
        }).finally(() => {
          this.$emit('refresh');
        });
    },
    clickSaveButton() {
      if (!this.minimumRolesSelected) {
        this.setFailureAlert(`Please select at least one role for ${this.user.firstName}.`);
        return;
      }
      this.editUserSheet = !this.editUserSheet;
      const payload = {
        params: {
          edxUserID: this.user.edxUserID,
          selectedRoles: this.selectedRoles,
          expiryDate: this.accessExpiryDate
        }
      };
      let url = Routes.edx.EXCHANGE_ACCESS_ROLES_URL;
      if (this.instituteTypeCode === 'SCHOOL') {
        payload.params.schoolID = this.instituteCode;
        url = `${url}/school`;
      } else {
        payload.params.districtId = this.instituteCode;
        url = `${url}/district`;
      }
      ApiService.apiAxios.post(url, payload)
        .then(() => {
          this.setSuccessAlert('User has been updated.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while updating the user. Please try again later.');
          console.log(error);
        }).finally(() => {
          this.$emit('refresh');
        });
    },
    setUserRolesAsSelected() {
      let mySelection = [];
      //look through all our roles. If user has this role, then mark the index
      this.instituteRoles.forEach((role) => {
        let result = this.userRoles.find((userRole) =>
          userRole.edxRoleCode === role.edxRoleCode
        );

        if (result) {
          mySelection.push(role.edxRoleCode);
        }
      });

      this.selectedRoles = [...mySelection];
      this.accessExpiryDate = this.getExpiryDate(this.user);
    },
    clearExpiryDate(){
      this.accessExpiryDate = null;
    },
  }
};
</script>

<style scoped>

.name {
    word-break: break-word;
    font-size: 0.85em
}

.header {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

@keyframes bounce-in {
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

.expiry-date {
  color: grey;
  font-style: italic;
  font-size: 0.95em
}
</style>

