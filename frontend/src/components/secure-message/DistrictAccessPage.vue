<template>
  <v-container class="containerSetup">
    <v-card color="#F2F2F2">
      <v-card-title>
        <v-row justify="center">
          <v-col class="d-flex justify-center">
            <strong>Search a district below to manage their EDX Access</strong>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-row justify="center">
          <v-col cols="8">
            <v-row justify="center" no-gutters>
              <v-col cols="9">
                <v-autocomplete
                    id='selectDistrictName'
                    class="pt-0 mt-n1"
                    prepend-inner-icon="mdi-account-box-outline"
                    v-model="districtId"
                    :items="districtCombo"
                    color="#003366"
                    label="District"
                    clearable
                ></v-autocomplete>
              </v-col>
              <v-col class="pl-4" cols="3">
                <PrimaryButton id="manageDistrictButton" :to="`/edx/exchange/access/district/${districtId}`" :disabled="!districtId">Manage District Access</PrimaryButton>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from 'vuex';
import PrimaryButton from '../util/PrimaryButton';

export default {
  name: 'DistrictAccessPage',
  components: {
    PrimaryButton,
  },
  data() {
    return {
      districtId: ''
    };
  },
  computed: {
    ...mapState('app', ['districts']),
    districtCombo() {
      return _.sortBy(Array.from(this.districts.entries()).map(district => ({ text: `${district[1].name} - ${district[1].districtNumber}`, value: district[0], key:district[1].districtNumber})), ['key']);
    },
  }
};
</script>

<style scoped>
.containerSetup{
  padding-right: 20em !important;
  padding-left: 20em !important;
}

</style>
