<template>
  <v-container>
    <v-card color="#F2F2F2">
      <v-card-title>
        <strong>Search a school below to manage their EDX Access</strong>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="8" class="pt-1">
            <v-autocomplete
                id='selectSchoolName'
                class="pt-0 mt-0"
                prepend-inner-icon="mdi-account-box-outline"
                v-model="schoolMincode"
                :items="schools"
                color="#003366"
                label="School"
                clearable
            ></v-autocomplete>
          </v-col>
          <v-col>
            <PrimaryButton id="manageSchoolButton" :to="`/edx/exchange/access/school/${schoolMincode}`" :disabled="!schoolMincode">Manage School Access</PrimaryButton>
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

