<template>
  <v-container class="containerSetup">
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to Dashboard</a>
      </v-col>
    </v-row>
    <v-card color="#F2F2F2">
      <v-card-title>
        <v-row justify="center">
          <v-col class="d-flex justify-center">
            <strong>Search a {{this.instituteTypeLabel.toLowerCase()}} below to manage their EDX Access</strong>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-row justify="center">
          <v-col cols="8">
            <v-row justify="center" no-gutters>
             <v-col cols="9">
               <v-autocomplete
                 id='selectInstituteName'
                 class="pt-0 mt-n1"
                 prepend-inner-icon="mdi-account-box-outline"
                 v-model="instituteCode"
                 :items="institutes"
                 color="#003366"
                 :label="instituteTypeLabel"
                 clearable
               ></v-autocomplete>
             </v-col>
              <v-col class="pl-4" cols="3">
                <PrimaryButton id="manageInstituteButton" :to="`/edx/exchange/access/${this.instituteTypeLabel.toLowerCase()}/${this.instituteCode}`" :disabled="!instituteCode">Manage {{this.instituteTypeLabel}} Access</PrimaryButton>
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
import router from '@/router';

export default {
  name: 'InstituteAccessPage',
  components: {
    PrimaryButton,
  },
  props: {
    instituteTypeLabel:{
      type:String,
      required:true
    },
    instituteTypeCode:{
      type:String,
      required:true
    }
  },
  data() {
    return {
      instituteCode: ''

    };
  },
  async beforeMount() {
    await this.$store.dispatch('app/getCodes');
  },
  methods:{
    backButtonClick() {
      router.push({name: 'home'});
    },
  },
  computed: {
    ...mapState('app', ['activeSchoolMap','districts']),
    institutes() {
      if(this.instituteTypeCode === 'SCHOOL') {
        return _.sortBy(Array.from(this.activeSchoolMap.entries()).map(school => ({ text: `${school[1]?.schoolName} (${school[1]?.mincode})`, value: school[1]?.schoolID, mincode: school[1].mincode})), ['mincode']);
      }else{
        return _.sortBy(Array.from(this.districts.entries()).map(district => ({ text: `${district[1].name} - ${district[1].districtNumber}`, value: district[0], key:district[1].districtNumber})), ['key']);
      }
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
