<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title class="pb-0">
          <v-row no-gutters>
            <v-col>
              <v-row no-gutters>
                <v-col cols="10">
                  <strong>{{`${user.firstName} ${user.lastName}`}}</strong>
                </v-col>
                <v-col cols="2" class="d-flex justify-end">
                  <v-btn :id="`user-edit-button-${user.firstName}-${user.lastName}`"
                         title="Edit"
                         color="white"
                         width="0.5em"
                         min-width="0.5em"
                         depressed
                         @click="clickEditButton"
                         small
                         class="mr-2"
                  >
                    <v-icon size="x-large" color="#003366" dark>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn :id="`user-remove-button-${user.firstName}-${user.lastName}`"
                         title="Remove"
                         color="white"
                         width="0.5em"
                         min-width="0.5em"
                         depressed
                         @click="clickDeleteButton"
                         small
                         class="mr-2"
                  >
                    <v-icon size="x-large" color="#003366" dark>mdi-delete</v-icon>
                  </v-btn>
                  <v-btn :id="`user-relink-button-${user.firstName}-${user.lastName}`"
                         title="Re-Link"
                         color="white"
                         width="0.5em"
                         min-width="0.5em"
                         depressed
                         @click="clickRelinkButton"
                         small
                  >
                    <v-icon size="x-large" color="#003366" dark>mdi-backup-restore</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" class="pt-1">
                  <span>{{user.email}}</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" class="pt-1">
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text class="pt-2" :style="[editState ? {'background-color': '#e7ebf0'} : {'background-color': 'white'}]" >
          <v-chip-group v-if="!editState">
            <v-chip v-for="role in userRoles"
                    :key="role.edxRoleCode" disabled>
              {{ getRoleLabel(role) }}
            </v-chip>
          </v-chip-group>
          <v-list-item-group
            v-model="selectedRoles"
            v-else
            multiple
          >
            <v-list-item :disabled="roleDisabled(newrole)" @input="disableRoles" v-for="newrole in schoolRoles" :key="newrole.edxRoleCode" :value="newrole.edxRoleCode">
              <template v-slot:default="{ active, }">
                <v-list-item-action class="mt-0 mb-2 mr-3">
                  <v-checkbox
                    :disabled="roleDisabled(newrole)"
                    :input-value="active"
                    color="primary"
                  ></v-checkbox>
                </v-list-item-action>

                <v-list-item-content>
                  <v-list-item-title>{{ newrole.label }}</v-list-item-title>
                  <div style="color: black; font-weight: bold" v-if="isSelectedAdmin && newrole.edxRoleCode === 'EDX_SCHOOL_ADMIN'">EDX School Admin users will be set up with all school Roles</div>
                </v-list-item-content>
              </template>
            </v-list-item>
          </v-list-item-group>
        </v-card-text>
        <Transition name="bounce">
          <v-card-text style="background-color: #e7ebf0;" v-if="deleteState">
            <v-row no-gutters>
              <v-col class="d-flex justify-center">
                <span style="font-size: medium; font-weight: bold; color: black" >Are you sure you want to remove this users access for the school?</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="mt-0 d-flex justify-end">
                <PrimaryButton width="5em" :id="`user-cancel-remove-button-${user.firstName}-${user.lastName}`" text="Cancel" class="mr-2" secondary :on="{click: clickDeleteButton}"></PrimaryButton>
                <PrimaryButton :id="`user-remove-action-button-${user.firstName}-${user.lastName}`" text="Remove" @click.native="clickRemoveButton(user)" ></PrimaryButton>
              </v-col>
            </v-row>
          </v-card-text>
        </Transition>
        <Transition name="bounce">
          <v-card-text style="background-color: #e7ebf0;" v-if="relinkState">
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
                <PrimaryButton width="5em" :id="`user-cancel-relink-button-${user.firstName}-${user.lastName}`" text="Cancel" class="mr-2" secondary :on="{click: clickRelinkButton}"></PrimaryButton>
                <PrimaryButton :id="`user-relink-action-button-${user.firstName}-${user.lastName}`" text="Re-Link" @click.native="clickActionRelinkButton(user)" ></PrimaryButton>
              </v-col>
            </v-row>
          </v-card-text>
        </Transition>
        <Transition name="bounce">
          <v-card-text class="pt-0" style="background-color: #e7ebf0;" v-if="editState">
            <v-row no-gutters>
              <v-col class="mt-0 d-flex justify-end">
                <PrimaryButton width="5em" :id="`user-cancel-edit-button-${user.firstName}-${user.lastName}`" text="Cancel" class="mr-2" secondary :on="{click: clickEditButton}"></PrimaryButton>
                <PrimaryButton :id="`user-save-action-button-${user.firstName}-${user.lastName}`" text="Save" :on="{click: clickSaveButton}"></PrimaryButton>
              </v-col>
            </v-row>
          </v-card-text>
        </Transition>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton';
import {mapState} from 'vuex';
import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'AccessUserCard',
  mixins: [alertMixin],
  components: {PrimaryButton},
  props: {
    user: {
      type: Object,
      required: true
    },
    userRoles: {
      type: Array,
      required: true
    },
    mincode: {
      type: String,
      required: true
    },
    type: {
      validator(value) {
        return ['district', 'school'].includes(value);
      },
      type: String,
      required: true
    }
  },
  data() {
    return {
      editState: false,
      deleteState: false,
      relinkState: false,
      selectedRoles: [],
      isSelectedAdmin: false
    };
  },
  methods: {
    isSelectedEDXSchoolAdmin(){
      return this.selectedRoles.filter((role) => role === 'EDX_SCHOOL_ADMIN').length > 0;
    },
    roleDisabled(role){
      if(this.isSelectedEDXSchoolAdmin() && role.edxRoleCode !== 'EDX_SCHOOL_ADMIN'){
        this.isSelectedAdmin = true;
        return true;
      }
      return false;
    },
    getButtonWidth() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
      case 'sm':
      case 'md':
        return '2em';
      case 'lg':
      case 'xl':
      default:
        return '7em';
      }
    },
    disableRoles() {
      this.isSelectedAdmin = false;
      if(this.isSelectedEDXSchoolAdmin()){
        this.selectedRoles = this.selectedRoles.filter((role) => role === 'EDX_SCHOOL_ADMIN');
      }
    },
    getRoleLabel(curRole){
      if(this.schoolRoles.length > 0) {
        return this.schoolRoles.find((role) => role.edxRoleCode === curRole.edxRoleCode).label;
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
    clickActionRelinkButton(userToRelink) {
      let userSchool = userToRelink.edxUserSchools.find(school => school.mincode === this.mincode);
      const payload = {params:
          {
            userToRelink: userToRelink.edxUserID,
            mincode: this.mincode,
            userSchoolID: userSchool.edxUserSchoolID
          }
      };
      ApiService.apiAxios.post(Routes.edx.EXCHANGE_RELINK_USER, payload)
        .then(()=> {
          this.setSuccessAlert('User has been removed, email sent with instructions to re-link.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while re-linking a user. Please try again later.');
          console.log(error);
        }).finally(() => {
          this.$emit('refresh');
        });
    },
    clickRemoveButton(userToRemove) {
      let userSchool = userToRemove.edxUserSchools.find(school => school.mincode === this.mincode);
      const payload = {params:
          {
            userToRemove: userToRemove.edxUserID,
            mincode: this.mincode,
            userSchoolID: userSchool.edxUserSchoolID
          }
      };
      ApiService.apiAxios.post(Routes.edx.EXCHANGE_REMOVE_USER, payload)
        .then(()=> {
          this.setSuccessAlert('User has been removed.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while removing a user. Please try again later.');
          console.log(error);
        }).finally(() => {
          this.$emit('refresh');
        });
    },
    clickSaveButton() {
      this.editState = !this.editState;
      const payload = {params:
          {
            edxUserID: this.user.edxUserID,
            mincode: this.mincode,
            selectedRoles: this.selectedRoles
          }
      };
      ApiService.apiAxios.post(Routes.edx.EXCHANGE_ACCESS_ROLES_URL, payload)
        .then(()=> {
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
      this.schoolRoles.forEach((role) => {
        let result = this.userRoles.find((userRole) =>
          userRole.edxRoleCode === role.edxRoleCode
        );

        if (result) {
          mySelection.push(role.edxRoleCode);
        }
      });

      this.selectedRoles = [...mySelection];
    }
  },
  computed: {
    ...mapState('edx', ['schoolRoles'])
  }
};
</script>

<style scoped>
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
</style>

