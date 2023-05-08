<template>
  <v-container class="containerSetup">
    <div v-if="instituteArray.length >=1">
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
                 :items="instituteArray"
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
    </div>
    <Spinner v-else/>
  </v-container>
</template>

<script>

import {mapState} from 'vuex';
import PrimaryButton from '../util/PrimaryButton';
import router from '@/router';
import Spinner from '@/components/common/Spinner';

export default {
  name: 'InstituteAccessPage',
  components: {
    Spinner,
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
  computed: {
    ...mapState('app', ['activeSchools','activeDistricts']),
    instituteArray() {
      switch (this.instituteTypeCode) {
      case 'SCHOOL':
        return _.sortBy(this.activeSchools.map(school => ({ text: `${school.schoolName} (${school.mincode})`, value: school.schoolID, mincode: school.mincode})), ['mincode']);
      case 'DISTRICT':
        return _.sortBy(this.activeDistricts.map(district => ({ text: `${district.name} - ${district.districtNumber}`, value: district.districtId, key:district.districtNumber})), ['key']);
      default:
        return [];
      }
    }
  },
  async created() {
    await this.$store.dispatch('app/refreshEntities');
  },
  methods:{
    backButtonClick() {
      router.push({name: 'home'});
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
