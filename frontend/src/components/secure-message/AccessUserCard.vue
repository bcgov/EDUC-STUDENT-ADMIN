<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          <v-row no-gutters>
            <v-col :class="['d-flex','justify-space-between']">
              <div :class="['d-flex', 'flex-column']">
                <strong>{{`${user.firstName} ${user.lastName}`}}</strong>
                <span>{{user.email}}</span>
              </div>
                <div v-if="!editState">
                  <PrimaryButton :id="`user-edit-button-${user.firstName}-${user.lastName}`" secondary icon="mdi-pencil" :on="{click: clickEditButton}">Edit</PrimaryButton>
                </div>
              <!-- we are in edit state below show save and cancel options-->
                <div v-else>
                  <PrimaryButton :id="`user-cancel-button-${user.firstName}-${user.lastName}`" class="mr-2" secondary :on="{click: clickEditButton}">Cancel</PrimaryButton>
                  <PrimaryButton :id="`user-save-button-${user.firstName}-${user.lastName}`" :on="{click: clickSaveButton}">Save</PrimaryButton>
                </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
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
            <v-list-item :disabled="roleDisabled(newrole)" @input="disableRoles" v-for="newrole in roles" :key="newrole.edxRoleCode" :value="newrole.edxRoleCode">
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
                  <v-list-item-subtitle style="color: black; font-weight: bold" v-if="isSelectedAdmin && newrole.edxRoleCode === 'EDX_ADMIN'">EDX School Admin users will be set up with all EDX school roles</v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-list-item>
          </v-list-item-group>
        </v-card-text>
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
      selectedRoles: [],
      isSelectedAdmin: false
    };
  },
  methods: {
    isSelectedEDXAdmin(){
      return this.selectedRoles.filter((role) => role === 'EDX_ADMIN').length > 0;
    },
    roleDisabled(role){
      if(this.isSelectedEDXAdmin() && role.edxRoleCode !== 'EDX_ADMIN'){
        this.isSelectedAdmin = true;
        return true;
      }
      return false;
    },
    disableRoles() {
      this.isSelectedAdmin = false;
      if(this.isSelectedEDXAdmin()){
        this.selectedRoles = this.selectedRoles.filter((role) => role === 'EDX_ADMIN');
      }
    },
    getRoleLabel(curRole){
      if(this.roles.length > 0) {
        return this.roles.find((role) => role.edxRoleCode === curRole.edxRoleCode).label;
      }
      return '';
    },
    clickEditButton() {
      this.editState = !this.editState;
      this.setUserRolesAsSelected();
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
      this.roles.forEach((role) => {
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
    ...mapState('edx', ['roles'])
  }
};
</script>
