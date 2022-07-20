<template>
  <v-container class="containerSetup">
    <v-card color="#F2F2F2">
      <v-card-title>
        <v-row justify="center">
          <v-col class="d-flex justify-center">
            <strong>Search a school below to manage their EDX Access</strong>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-row justify="center">
          <v-col cols="8">
            <v-row justify="center" no-gutters>
             <v-col cols="9">
               <v-autocomplete
                 id='selectSchoolName'
                 class="pt-0 mt-n1"
                 prepend-inner-icon="mdi-account-box-outline"
                 v-model="schoolMincode"
                 :items="schools"
                 color="#003366"
                 label="School"
                 clearable
               ></v-autocomplete>
             </v-col>
              <v-col class="pl-4" cols="3">
                <PrimaryButton id="manageSchoolButton" :to="`/edx/exchange/access/school/${schoolMincode}`" :disabled="!schoolMincode">Manage School Access</PrimaryButton>
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
  name: 'AccessPage',
  components: {
    PrimaryButton,
  },
  data() {
    return {
      schoolMincode: ''
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    schools() {
      return _.sortBy(Array.from(this.mincodeSchoolNames.entries()).map(school => ({ text: `${school[0]} - ${school[1]}`, value: school[0]})), ['value']);
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
