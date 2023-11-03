<template>
  <v-container
    fluid
    class="full-height px-0 pt-0"
  >
    <v-form
      ref="newUserForm"
      v-model="isValidForm"
    >
      <v-row class="d-flex justify-center">
        <v-col
          class="pt-0"
          cols="11"
        >
          <v-row>
            <v-col class="pr-0 pb-0">
              <v-row>
                <v-col>
                  <v-card
                    id="newUserCard"
                    flat
                    outlined
                  >
                    <v-row>
                      <v-col class="pb-0 mb-5">
                        <v-card-text
                          id="newUserCardText"
                          class="pb-0 pt-0"
                        >
                          <v-text-field
                            id="newUserFirstName"
                            v-model.trim="firstName"
                            label="First Name"
                            class="mt-1"
                            variant="underlined"
                            maxlength="255"
                          />
                          <v-text-field
                            id="newUserLastName"
                            v-model.trim="lastName"
                            label="Last Name"
                            class="mt-1"
                            variant="underlined"
                            maxlength="255"
                            :rules="requiredRules"
                          />
                          <v-text-field
                            id="newUserEmail"
                            v-model.trim="email"
                            label="Email"
                            class="mt-1"
                            variant="underlined"
                            :rules="emailRules"
                            maxlength="255"
                            :hint="emailHint"
                          />
                          <v-text-field
                            id="newUserInstituteType"
                            v-model="instituteNameAndCode"
                            :label="instituteTypeLabel"
                            variant="underlined"
                            class="mt-1"
                            readonly
                            :rules="requiredRules"
                          />
                          <v-select
                            id="instituteNewUserRolesSelect"
                            v-model="edxActivationRoleCodes"
                            variant="underlined"
                            density="compact"
                            label="Role(s)"
                            :hint="rolesHint"
                            persistent-hint
                            required
                            :rules="requireRoleRules"
                            class="pb-3 mt-0 pt-0"
                          >
                            <template #no-data />
                            <template #selection="{item, index}">
                              {{ getRoleNameFromCode(item, index) }}
                            </template>
                            <template #append-item>
                              <v-list
                                id="instituteNewUserRolesListBox"
                                v-model:selected="edxActivationRoleCodes"
                                lines="two"
                                return-object
                                select-strategy="classic"
                              >
                                <div
                                  v-for="newrole in userRoles"
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
                            </template>
                          </v-select>
                          
                          <DatePicker
                            id="accessExpiryDate"
                            v-model="accessExpiryDate"
                            class="pb-3 mt-0 pt-0"
                            label="Access Expiry Date"
                            model-type="yyyy-MM-dd'T'00:00:00"
                            :min-date="minExpiryDate"
                            @clear-date="clearExpiryDate"
                          />
                        </v-card-text>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <v-row class="py-4 justify-end">
                <PrimaryButton
                  id="cancelMessage"
                  secondary
                  text="Cancel"
                  class="mr-2"
                  @click-action="navigateToList"
                />
                <PrimaryButton
                  id="newUserInvitePostBtn"
                  text="Invite"
                  width="8rem"
                  :disabled="!isValidForm"
                  :loading="processing"
                  @click-action="sendNewUserInvite"
                />
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <ConfirmationDialog ref="confirmationDialog" />
    </v-form>
  </v-container>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import DatePicker from '../util/DatePicker.vue';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

export default {
  name: 'InviteUserPage',
  components: {
    PrimaryButton,
    ConfirmationDialog,
    DatePicker
  },
  mixins: [alertMixin],
  props: {
    userRoles: {
      type: Array,
      required: true
    },
    instituteCode: {
      type: String,
      required: true
    },
    schoolName: {
      type: String,
      required: false
    },
    districtName: {
      type: String,
      required: false
    },
    districtNumber: {
      type: String,
      required: false
    },
    instituteTypeLabel: {
      type: String,
      required: true
    },
    instituteTypeCode: {
      type: String,
      required: true
    }
  },
  data() {

    return {
      firstName: '',
      lastName: '',
      email: '',
      instituteNameAndCode: '',
      edxActivationRoleCodes: [],
      requiredRules: [v => !!v || 'Required'],
      requireRoleRules: [(v) => v.length > 0 || 'Role Selection is required'],
      isValidForm: false,
      processing: false,
      edxAdminUserCode: '',
      rolesHint: 'Pick the roles to be assigned to the new user',
      emailHint: 'Valid Email Required',
      accessExpiryDate: null,
      minExpiryDate: LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString()
    };
  },
  mounted() {
    this.validateForm();
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['schoolMap']),
    emailRules() {
      return [
        v => !!v || this.emailHint,
        v => /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v) || this.emailHint,
      ];
    },
    edxAdminUserCodeSelected() {
      return this.edxActivationRoleCodes.includes(this.edxAdminUserCode);
    }
  },
  created() {
    if (!this.instituteNameAndCode) {
      if (this.instituteTypeCode === 'SCHOOL') {
        this.instituteNameAndCode = this.schoolName + ' (' + this.schoolMap.get(this.instituteCode)?.mincode + ')';
      } else {
        this.instituteNameAndCode = this.districtName + ' (' + this.districtNumber + ')';
      }
    }
  },
  methods: {
    navigateToList() {
      this.$emit('access-user:cancelMessage');
    },
    getRoleNameFromCode(role, index){
      if(index != 0){
        return ', ' + this.userRoles.filter(userRole => userRole.edxRoleCode === role.value)[0].label;
      }
      return this.userRoles.filter(userRole => userRole.edxRoleCode === role.value)[0].label;
    },
    disableRoles() {
      if (this.edxAdminUserCode === '') {
        for (const element of this.userRoles) {
          if ((this.instituteTypeCode === 'SCHOOL' && element.edxRoleCode === 'EDX_SCHOOL_ADMIN')
            || (this.instituteTypeCode === 'DISTRICT' && element.edxRoleCode === 'EDX_DISTRICT_ADMIN')) {
            this.edxAdminUserCode = element.edxRoleCode;
            break;
          }
        }
      }
      let newRoles = [];
      if (this.edxAdminUserCodeSelected) {
        newRoles = this.userRoles.map(el => {
          el.disabled = el.edxRoleCode !== this.edxAdminUserCode;
          if (el.disabled) {
            el.selected = false;
          }
          return el;
        });
        this.edxActivationRoleCodes.length = 0;
        this.edxActivationRoleCodes.push(this.edxAdminUserCode);
        this.rolesHint = `EDX ${this.instituteTypeLabel} Admin users will be set up with all ${this.instituteTypeLabel.toLowerCase()} roles`;
      } else {
        newRoles = this.userRoles.map(el => {
          el.disabled = false;
          return el;
        });
        this.rolesHint = 'Pick the roles to be assigned to the new user';
      }
      this.$emit('access-user:updateRoles', newRoles);
    },
    messageSent() {
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.$emit('access-user:messageSent');
    },
    sendNewUserInvite() {
      this.processing = true;
      const payload = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        edxActivationRoleCodes: this.edxActivationRoleCodes,
        edxUserExpiryDate: this.accessExpiryDate
      };
      let url = null;
      if (this.instituteTypeCode === 'SCHOOL') {
        payload.schoolID = this.instituteCode;
        payload.schoolName = this.schoolName;
        url = `${Routes.edx.NEW_SCHOOL_USER_ACTIVATION_INVITE}`;
      } else {
        payload.districtName = this.districtName;
        payload.districtCode = this.districtNumber;
        payload.districtID = this.instituteCode;
        url = `${Routes.edx.NEW_DISTRICT_USER_ACTIVATION_INVITE}`;
      }
      ApiService.apiAxios.post(url, payload)
        .then(() => {
          this.setSuccessAlert('Success! The request is being processed.');
          this.messageSent();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while inviting the user. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    validateForm() {
      const isValid = this.$refs.newUserForm.validate();
      this.isValidForm = isValid.valid;
    },
    clearExpiryDate(){
      this.accessExpiryDate = null;
    },
  }
};
</script>

<style scoped>
.addButton.v-btn--outlined {
    border: thin solid #FFFFFF;
    text-transform: none;
    font-weight: bolder;
}

</style>
