<template>
  <v-row style="height: 100%">
    <v-col>
      <v-card height="100%">
        <v-card-title class="pb-0">
          <v-row no-gutters>
            <v-col>
              <v-row no-gutters>
                <v-col cols="10">
                  <strong class="name">{{ `${user.firstName} ${user.lastName}` }}</strong>
                </v-col>
                <v-col
                  cols="2"
                  class="d-flex justify-end"
                >
                  <v-btn
                    :id="`user-edit-button-${user.firstName}-${user.lastName}`"
                    title="Edit"
                    color="white"
                    width="0.5em"
                    min-width="0.5em"
                    variant="flat"
                    size="small"
                    class="mr-2"
                    @click="clickEditButton"
                  >
                    <v-icon
                      size="x-large"
                      color="#003366"
                      dark
                    >
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                  <v-btn
                    :id="`user-remove-button-${user.firstName}-${user.lastName}`"
                    title="Remove"
                    color="white"
                    width="0.5em"
                    min-width="0.5em"
                    variant="flat"
                    size="small"
                    class="mr-2"
                    @click="clickDeleteButton"
                  >
                    <v-icon
                      size="x-large"
                      color="#003366"
                      dark
                    >
                      mdi-delete
                    </v-icon>
                  </v-btn>
                  <v-btn
                    :id="`user-relink-button-${user.firstName}-${user.lastName}`"
                    title="Re-Link"
                    color="white"
                    width="0.5em"
                    min-width="0.5em"
                    variant="flat"
                    size="small"
                    @click="clickRelinkButton"
                  >
                    <v-icon
                      size="x-large"
                      color="#003366"
                      dark
                    >
                      mdi-backup-restore
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="12"
                  class="pt-1"
                >
                  <span>{{ user.email }}</span>
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
        <v-card-text
          class="pt-2"
          :style="[editState ? {'background-color': '#e7ebf0'} : {'background-color': 'white'}]"
        >
        <div v-if="!editState">
          <v-chip-group >
            <v-chip
              v-for="role in userRoles"
              :key="role.edxRoleCode"
              disabled
            >
              {{ getRoleLabel(role) }}
            </v-chip>
          </v-chip-group>
          <p 
            v-if="getExpiryDate(user)"
            class="expiry-date"
          >
            <v-icon size="large">
              mdi-delete-clock-outline
            </v-icon>
            {{ formatExpiryDate(getExpiryDate(user)) }}
          </p>
        </div>
          
          <div v-else>
            <v-list
            v-model:selected="selectedRoles"
            lines="two"
            return-object
            select-strategy="classic"
            style="background-color: #e7ebf0"
            @update:selected="selectedRolesChanged"
          >
            <div
              v-for="newrole in instituteRoles"
              :key="newrole.edxRoleCode"
              :value="newrole.edxRoleCode"
            >
              <v-list-item
                :disabled="roleDisabled(newrole)"
                :value="newrole.edxRoleCode"
              >
                <template #prepend="{ isActive }">
                  <v-list-item-action>
                    <v-checkbox-btn :model-value="isActive" />
                  </v-list-item-action>
                </template>

                <v-list-item-title>{{ newrole.label }}</v-list-item-title>

                <v-list-item-subtitle v-if="newrole.edxRoleCode === edxInstituteAdminRole">
                  EDX {{ instituteTypeLabel }} Admin users will be set up with all
                  {{ instituteTypeLabel.toLowerCase() }} roles.
                </v-list-item-subtitle>
                <v-list-item-subtitle v-else>
                  {{ newrole.roleDescription }}
                </v-list-item-subtitle>
              </v-list-item>
            </div>
          </v-list>

          <DatePicker
            id="accessExpiryDate"
            v-model="accessExpiryDate"
            label="Access Expiry Date"
            @clear-date="clearExpiryDate"
          />
          </div>
          
        </v-card-text>
        <Transition name="bounce">
          <v-card-text
            v-if="deleteState"
            style="background-color: #e7ebf0;"
          >
            <v-row no-gutters>
              <v-col class="d-flex justify-center">
                <span style="font-size: medium; font-weight: bold; color: black">Are you sure you want to remove this users access for the {{
                  instituteTypeLabel.toLowerCase()
                }}?</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="mt-0 d-flex justify-end">
                <PrimaryButton
                  :id="`user-cancel-remove-button-${user.firstName}-${user.lastName}`"
                  width="5em"
                  text="Cancel"
                  class="mr-2"
                  secondary
                  @click-action="clickDeleteButton"
                />
                <PrimaryButton
                  :id="`user-remove-action-button-${user.firstName}-${user.lastName}`"
                  text="Remove"
                  @click-action="clickRemoveButton"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </Transition>
        <Transition name="bounce">
          <v-card-text
            v-if="relinkState"
            style="background-color: #e7ebf0;"
          >
            <v-row no-gutters>
              <v-col class="d-flex justify-center">
                <span style="font-size: medium; font-weight: bold; color: black">Re-linking an account will remove the current user and resend the activation code so that the user can set up EDX access with their new credential.</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="pt-3 d-flex justify-start">
                <span style="font-size: medium; font-weight: bold; color: black">Are you sure you want to re-link this account?</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="mt-3 d-flex justify-end">
                <PrimaryButton
                  :id="`user-cancel-relink-button-${user.firstName}-${user.lastName}`"
                  width="5em"
                  text="Cancel"
                  class="mr-2"
                  secondary
                  @click-action="clickRelinkButton"
                  :disabled="isRelinking"
                />
                <PrimaryButton
                  :id="`user-relink-action-button-${user.firstName}-${user.lastName}`"
                  text="Re-Link"
                  @click-action="clickActionRelinkButton"
                  :disabled="isRelinking"
                  :loading="isRelinking"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </Transition>
        <Transition name="bounce">
          <v-card-text
            v-if="editState"
            class="pt-0"
            style="background-color: #e7ebf0;"
          >
            <v-row
              v-if="!minimumRolesSelected"
              no-gutters
            >
              <v-col class="mt-0 mb-5 d-flex justify-start">
                <p style="font-weight: bolder;color: black;">
                  Please select at least one role for {{ user.firstName }}.
                </p>
              </v-col>
            </v-row>
            <v-row no-gutters>
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
        </Transition>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import {EDX_SAGA_REQUEST_DELAY_MILLISECONDS, Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {formatDate} from '../../utils/format';
import DatePicker from '../util/DatePicker.vue';

export default {
  name: 'AccessUserCard',
  components: {PrimaryButton, DatePicker},
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
      editState: false,
      deleteState: false,
      relinkState: false,
      isRelinking: false,
      selectedRoles: [],
      accessExpiryDate: null,
      from: 'uuuu-MM-dd\'T\'HH:mm:ss',
      pickerFormat: 'uuuu-MM-dd'
    };
  },
  computed: {
    isEDXInstituteAdminSelected() {
      return this.selectedRoles.includes(this.edxInstituteAdminRole);
    },
    minimumRolesSelected() {
      return this.selectedRoles.length > 0;
    },
    edxInstituteAdminRole() {
      if (this.instituteTypeCode === 'SCHOOL') {
        return 'EDX_SCHOOL_ADMIN';
      }
      return 'EDX_DISTRICT_ADMIN';
    }
  },
  methods: {
    roleDisabled(role) {
      if (role.edxRoleCode === this.edxInstituteAdminRole) {
        return false;
      }
      return this.isEDXInstituteAdminSelected;
    },
    selectedRolesChanged() {
      if (!this.isEDXInstituteAdminSelected) {
        return;
      }
      this.selectedRoles = [this.edxInstituteAdminRole];
    },
    getButtonWidth() {
      return '7em';
    },
    isDistrictUser(){
      return this.instituteTypeCode === 'DISTRICT';
    },
    getExpiryDate(user){
      if(!this.isDistrictUser()){
        return user.edxUserSchools[0].expiryDate;
      }
      return user.edxUserDistricts[0].expiryDate;
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
      this.editState = !this.editState;
      this.setUserRolesAsSelected();
    },
    clickDeleteButton() {
      this.editState = false;
      this.relinkState = false;
      this.deleteState = !this.deleteState;
    },
    clickRelinkButton() {
      this.editState = false;
      this.deleteState = false;
      this.relinkState = !this.relinkState;
    },
    formatExpiryDate(date) {
      return formatDate(date, this.from, this.pickerFormat);
    },
    clickActionRelinkButton() {
      this.isRelinking = true;
      const payload = {
        params: {
          userToRelink: this.user.edxUserID,
        }
      };
      if (this.instituteTypeCode === 'SCHOOL') {
        const userSchool = this.user.edxUserSchools.find(school => school.schoolID === this.instituteCode);
        payload.params.schoolID = this.instituteCode;
        payload.params.userSchoolID = userSchool.edxUserSchoolID;
      } else {
        const userDistrict = this.user.edxUserDistricts.find(district => district.districtID === this.instituteCode);
        payload.params.districtID = this.instituteCode;
        payload.params.edxUserDistrictID = userDistrict.edxUserDistrictID;
      }
      ApiService.apiAxios.post(Routes.edx.EXCHANGE_RELINK_USER, payload)
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
    clickRemoveButton() {
      const payload = {
        params: {
          userToRemove: this.user.edxUserID,
        }
      };
      if (this.instituteTypeCode === 'SCHOOL') {
        const userSchool = this.user.edxUserSchools.find(school => school.schoolID === this.instituteCode);
        payload.params.userSchoolID = userSchool.edxUserSchoolID;
      } else {
        const userDistrict = this.user.edxUserDistricts.find(district => district.districtID === this.instituteCode);
        payload.params.districtID = this.instituteCode;
        payload.params.edxUserDistrictID = userDistrict.edxUserDistrictID;
      }
      ApiService.apiAxios.post(Routes.edx.EXCHANGE_REMOVE_USER, payload)
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
      this.editState = !this.editState;
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
          this.setSuccessAlert('User roles have been updated.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while updating user roles. Please try again later.');
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
      this.accessExpiryDate = this.formatExpiryDate(this.user.edxUserSchools[0].expiryDate);
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
}

.bounce-enter-active {
    animation: bounce-in 0.2s;
}

.bounce-leave-active {
    animation: bounce-in 0.1s reverse;
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
  text-align: right;
}
</style>

