<template>
  <v-container class="d-flex justify-center">
    <div v-if="instituteArray.length >=1">
      <v-row>
        <v-col class="mb-1">
          <v-icon
            size="small"
            color="#1976d2"
            class="mt-1"
          >
            mdi-arrow-left
          </v-icon>
          <a
            class="ml-1"
            @click="backButtonClick"
          >Return to Dashboard</a>
        </v-col>
      </v-row>
      <v-card
        color="#F2F2F2"
        min-width="55em"
      >
        <v-card-title class="text-center">
          <strong>Search a {{ instituteTypeLabel.toLowerCase() }} below to manage their EDX Access</strong>
        </v-card-title>
        <v-card-text class="d-flex align-center">
          <v-autocomplete
            id="selectInstituteName"
            v-model="instituteCode"
            variant="underlined"
            class="pt-0 mt-n1"
            item-title="text"
            prepend-inner-icon="mdi-account-box-outline"
            :items="instituteArray"
            color="#003366"
            :label="instituteTypeLabel"
            clearable
          />
          <PrimaryButton
            id="manageInstituteButton"
            class="ml-4"
            :to="`/edx/exchange/access/${instituteTypeLabel.toLowerCase()}/${instituteCode}`"
            :disabled="!instituteCode"
            :text="'Manage ' + instituteTypeLabel + ' Access'"
          />
        </v-card-text>
      </v-card>
    </div>
    <Spinner v-else />
  </v-container>
</template>

<script>

import {mapState} from 'pinia';
import PrimaryButton from '../util/PrimaryButton.vue';
import router from '@/router';
import Spinner from '@/components/common/Spinner.vue';
import {appStore} from '@/store/modules/app';
import _ from 'lodash';

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
    ...mapState(appStore, ['notClosedSchools','activeDistricts']),
    instituteArray() {
      switch (this.instituteTypeCode) {
      case 'SCHOOL':
        return _.sortBy(this.notClosedSchools.map(school => ({ text: `${school.schoolName} (${school.mincode})`, value: school.schoolID, mincode: school.mincode})), ['mincode']);
      case 'DISTRICT':
        return _.sortBy(this.activeDistricts.map(district => ({ text: `${district.name} - ${district.districtNumber}`, value: district.districtId, key:district.districtNumber})), ['key']);
      default:
        return [];
      }
    }
  },
  async created() {
    await appStore().refreshEntities();
  },
  methods:{
    backButtonClick() {
      router.push({name: 'home'});
    },
  }
};
</script>
