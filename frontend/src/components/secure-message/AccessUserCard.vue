<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          <v-row>
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
                  <PrimaryButton :id="`user-save-button-${user.firstName}-${user.lastName}`" :on="{click: clickEditButton}">Save</PrimaryButton>
                </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-chip-group v-if="!editState">
            <v-chip v-for="role in userRoles"
                    :key="role.edxRoleID" disabled>
              {{ role.edxRole.label }}
            </v-chip>
          </v-chip-group>
          <!-- we are in edit state below show all roles and highlight the ones the user has -->
          <v-chip-group v-else v-model="selectedRoles">
            <v-chip v-for="role in roles"
                    :key="role.edxRoleID"
                    filter
            >
              {{ role.label }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton';
import {mapState} from 'vuex';

export default {
  name: 'AccessUserCard',
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
      selectedRoles: []
    };
  },
  methods: {
    clickEditButton() {
      this.editState = !this.editState;
      this.setUserRolesAsSelected();
    },
    setUserRolesAsSelected() {
      let mySelection = [];

      //look through all our roles. If user has this role, then mark the index
      this.roles.forEach((role, index) => {
        let result = this.userRoles.find((userRole) =>
          userRole.edxRole.roleName === role.roleName
        );

        if (result) {
          mySelection.push(index);
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
