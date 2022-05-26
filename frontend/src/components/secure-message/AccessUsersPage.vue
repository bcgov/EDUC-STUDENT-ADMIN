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
        <div>Primary EDX Code - To be implemented</div>
        <PrimaryButton short secondary icon="mdi-sync" class="ml-2">
          Generate New Code
        </PrimaryButton>
      </v-col>
    </v-row>
<!--    search filter -->
      <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
        <v-col cols="12" md="4">
          <v-text-field label="name" clearable></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select clearable :items="roles" item-text="roleName" item-value="roleName" label="role"></v-select>
        </v-col>
        <v-col cols="12" md="4" :class="['text-right']">
          <PrimaryButton secondary>Clear</PrimaryButton>
          <PrimaryButton class="ml-2">Search</PrimaryButton>
        </v-col>
      </v-row>
    <!--    user info -->
    <v-row v-for="user in users" :key="user.digitalID">
      <v-col>
        <v-card>
          <v-card-title>
            <v-row>
              <v-col :class="['d-flex','justify-space-between']">
                <div :class="['d-flex', 'flex-column']">
                  <strong>{{`${user.firstName} ${user.lastName}`}}</strong>
                  <span>{{user.email}}</span>
                </div>
                <PrimaryButton secondary icon="mdi-pencil">Edit</PrimaryButton>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text v-for="userRole in user.edxUserSchools[0].edxUserSchoolRoles"
                       :key="userRole.edxRoleID">
            <v-chip>
              {{ userRole.edxRole.roleName }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import {mapState} from 'vuex';
import PrimaryButton from '@/components/util/PrimaryButton';

export default {
  name: 'AccessUsersPage',
  components: {PrimaryButton},
  props: {
    mincode: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      users: [],
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
  },
  methods: {
    getUsersData() {
      const payload = {params: {mincode: this.mincode}};
      ApiService.apiAxios.get(Routes.edx.EXCHANGE_ACCESS_URL, payload)
        .then(response => {
          this.users = response.data;
        });
    },
    getSchoolName() {
      const schoolName = this.mincodeSchoolNames.get(this.mincode);
      return `${schoolName} (${this.mincode})`;
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

.searchBox {
  border-radius: 5px;
  background-color: #F2F2F2;
}
.card-hint {
  color: #000 !important;
  font-size: 1rem;
}
</style>
