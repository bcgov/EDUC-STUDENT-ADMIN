<template>
  <v-row>
    <v-col cols="12" md="4" class="pt-0">
      <v-autocomplete
          id='schoolName'
          class="pt-0 mt-0"
          prepend-inner-icon="mdi-account-box-outline"
          v-model="schoolMincode"
          :items="schools"
          color="#003366"
          label="Contact"
          clearable
      ></v-autocomplete>
    </v-col>
    <v-col>
      <PrimaryButton :to="`/edx/exchange/access/school/${schoolMincode}`" :disabled="!schoolMincode">Manage School Access</PrimaryButton>
    </v-col>
  </v-row>
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
.card-hint {
  color: #000 !important;
  font-size: 1rem;
}
</style>
