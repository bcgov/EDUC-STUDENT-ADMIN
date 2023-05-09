<template>
  <v-container fluid class="full-height px-0 pt-0">
    <v-form ref="newUserForm" v-model="isValidForm">
      <v-row class="d-flex justify-center">

        <v-col class="pt-0" cols="11">
          <v-row>
            <v-col class="pr-0 pb-0">
              <v-row>
                <v-col>
                  <v-card id="newUserCard" flat outlined>
                    <v-row>
                      <v-col class="pb-0">
                        <v-card-text id="newUserCardText" class="pb-0 pt-0">

                          <v-text-field id="newUserFirstName"
                                        label="First Name"
                                        v-model.trim="firstName"
                                        class="pt-0"
                                        maxlength="255"
                                        :rules="requiredRules"
                          ></v-text-field>
                          <v-text-field id="newUserLastName"
                                        label="Last Name"
                                        v-model.trim="lastName"
                                        maxlength="255"
                                        :rules="requiredRules"
                          ></v-text-field>
                          <v-text-field id="newUserEmail"
                                        label="Email"
                                        v-model.trim="email"
                                        class="pt-0"
                                        :rules="emailRules"
                                        maxlength="255"
                                        :hint="emailHint"
                          ></v-text-field>
                          <v-text-field id="newUserInstituteType"
                                        :label="instituteTypeLabel"
                                        v-model="instituteNameAndCode"
                                        :disabled=true
                                        class="pt-0"
                                        :rules="requiredRules"
                          ></v-text-field>
                          <v-select
                              id="instituteNewUserRolesSelect"
                              :items="userRoles"
                              item-value='edxRoleCode'
                              item-text='label'
                              item-disabled="disabled"
                              v-model='edxActivationRoleCodes'
                              :menu-props="{ maxHeight: '400' }"
                              label="Roles"
                              multiple
                              :hint="rolesHint"
                              persistent-hint
                              class="pt-0"
                              @input="disableRoles"
                              required
                              :rules="requireRoleRules"
                          >
                            <template v-slot:message="{ message, key }">
                              <span :style="edxAdminUserCodeSelected ? 'color: black; font-weight: bold' : ''">{{ message }}</span>
                            </template>
                            <template v-slot:item="{ item, on, attrs }">
                              <v-list-item :disabled="item.disabled" @input="disableRoles" :value="item.edxRoleCode" v-bind="attrs" v-on="on">
                                <template v-slot:default="{ active }">
                                  <v-list-item-action class="mt-0 mb-2 mr-3">
                                    <v-checkbox
                                        :disabled="item.disabled"
                                        :input-value="active"
                                        color="primary"
                                    ></v-checkbox>
                                  </v-list-item-action>
                                  <v-list-item-content>
                                    <v-list-item-title>{{ item.label }}</v-list-item-title>
                                  </v-list-item-content>
                                </template>
                              </v-list-item>
                            </template>
                          </v-select>
                        </v-card-text>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <v-row class="py-4 justify-end">
                <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-2"
                               @click.native="navigateToList"></PrimaryButton>
                <PrimaryButton id="newUserInvitePostBtn" text="Invite" width="8rem" :disabled="!isValidForm"
                               :loading="processing"
                               @click.native="sendNewUserInvite"></PrimaryButton>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
    </v-form>
  </v-container>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';

import {Routes} from '@/utils/constants';
import {mapGetters, mapState} from 'vuex';

export default {
  name: 'InviteUserPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    ConfirmationDialog,
  },
  props: {
    userRoles: {
      type: Array,
      required: true
    },
    instituteCode:{
      type: String,
      required:true
    },
    schoolName:{
      type:String,
      required:false
    },
    districtName:{
      type:String,
      required:false
    },
    districtNumber:{
      type:String,
      required:false
    },
    instituteTypeLabel:{
      type:String,
      required:true
    },
    instituteTypeCode:{
      type:String,
      required:true
    }
  },
  mounted() {
    this.validateForm();
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
      emailHint: 'Valid Email Required'
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapState('app', ['schoolMap']),
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
      if(this.instituteTypeCode=== 'SCHOOL'){
        this.instituteNameAndCode = this.schoolName + ' (' + this.schoolMap.get(this.instituteCode)?.mincode + ')';
      }else{
        this.instituteNameAndCode = this.districtName + ' (' + this.districtNumber + ')';
      }
    }
  },
  methods: {
    navigateToList() {
      this.$emit('access-user:cancelMessage');
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
        edxActivationRoleCodes: this.edxActivationRoleCodes
      };
      let url = null;
      if(this.instituteTypeCode === 'SCHOOL') {
        payload.schoolID = this.instituteCode;
        payload.schoolName = this.schoolName;
        url = `${Routes.edx.NEW_SCHOOL_USER_ACTIVATION_INVITE}`;
      }else {
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
      this.isValidForm = this.$refs.newUserForm.validate();
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
