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
              <PrimaryButton :id="`user-edit-button-${user.firstName}-${user.lastName}`" secondary icon="mdi-pencil">Edit</PrimaryButton>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text v-for="role in roles"
                     :key="role.edxRoleID">
          <v-chip>
            {{ role.edxRole.label }}
          </v-chip>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton';

export default {
  name: 'AccessUserCard',
  components: {PrimaryButton},
  props: {
    user: {
      type: Object,
      required: true
    },
    roles: {
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
  }
};
</script>
