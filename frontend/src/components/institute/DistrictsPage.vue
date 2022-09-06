<template>
  <v-container class="containerSetup" fluid>
    <!--    search filter -->
    <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
      <v-col cols="12" md="4">
        <v-text-field id="name-text-field" label="District Number and Name" v-model="searchFilter.name" clearable></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select id="roleName-select-field" clearable :items="status" v-model="searchFilter.roleName" item-text="label" item-value="districtStatusCode" label="Role"></v-select>
      </v-col>
      <v-col cols="12" md="4" :class="['text-right']">
        <PrimaryButton id="district-clear-button" secondary>Clear</PrimaryButton>
        <PrimaryButton id="district-search-button" class="ml-2">Search</PrimaryButton>
      </v-col>
    </v-row>
    <!--    district list -->
    <v-card v-for="district in districtList" :key="district.districtId">
      <v-card-text>
        <v-row no-gutters>
          <v-col>{{ `${district.districtNumber} - ${district.name}` }}</v-col>
          <v-spacer></v-spacer>
          <v-col lg="2" md="3" sm="4">
            <v-row no-gutters>
              <v-col>
                <v-icon :color="getStatusColor(district.districtStatusCode)">
                  mdi-circle-medium
                </v-icon>
                <span>{{ getStatusText(district.districtStatusCode) }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-icon>
                  mdi-phone-outline
                </v-icon>
                <span>{{ getPhoneNumber(district.phoneNumber) }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col lg="2" md="3" sm="4">
            <v-row class="mb-1" no-gutters>
              <v-col>
                <PrimaryButton width="100%" secondary icon="mdi-domain">District Details</PrimaryButton>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <PrimaryButton width="100%" secondary icon="mdi-account-multiple-outline">District Contacts</PrimaryButton>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>

import {mapGetters} from 'vuex';
import {formatPhoneNumber} from '@/utils/format';

import PrimaryButton from '@/components/util/PrimaryButton';

export default {
  name: 'instituteDistrict',
  components: {PrimaryButton},
  async beforeMount() {
    if (this.districts.size === 0) {
      await this.$store.dispatch('app/getCodes');
    }
  },
  mounted() {
    this.districtList = Array.from(this.districts.values());
  },
  data() {
    return {
      searchFilter: {
        name: '',
        status: ''
      },
      status: [
        {label: 'Open', districtStatusCode: 'ACTIVE'},
        {label: 'Closed', districtStatusCode: 'INACTIVE'}
      ],
      districtList: []
    };
  },
  methods: {
    getStatusColor(districtStatusCode){
      if(districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if(districtStatusCode === 'INACTIVE') {
        return 'red';
      }
    },
    getStatusText(districtStatusCode) {
      if (districtStatusCode === 'ACTIVE') {
        return 'Open';
      } else if (districtStatusCode === 'INACTIVE') {
        return 'Closed';
      }
    },
    getPhoneNumber(phoneNumber) {
      return formatPhoneNumber(phoneNumber);
    }
  },
  computed: {
    ...mapGetters('app', ['districts']),
  }
};

</script>

<style scoped>

.searchBox {
  padding-left: 1em;
  padding-right: 1em;
  margin-left: 0;
  margin-right: 0;
  border-radius: 5px;
  background-color: #F2F2F2;
}

.containerSetup{
  padding-right: 32em !important;
  padding-left: 32em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}
</style>

