<template>
  <div>
    <v-row no-gutters class="pt-2 px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">Legal:</p>
      </v-col>
      <v-col cols="12" xl="8" lg="8" md="8" sm="8">
        <p class="mb-2"><strong>{{ this.request.legalLastName ? this.request.legalLastName: '(none)'}}, {{ this.request.legalFirstName ? this.request.legalFirstName: '(none)'}}, {{ this.request.legalMiddleNames ? this.request.legalMiddleNames: '(none)'}}</strong></p>
      </v-col>
      <v-col cols="1" v-if="isValidStudentSearchUser">
        <PrimaryButton
            color="#38598A"
            text="Search"
            :short="true"
            :disabled="disableSearchBtn"
            class="mt-1 ml-n3"
            @click.native="searchStudent"
        >
        </PrimaryButton>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">Usual:</p>
      </v-col>
      <v-col v-if="!this.request.usualLastName && !this.request.usualFirstName && !this.request.usualMiddleName" cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-2"></p>
      </v-col>
      <v-col v-else-if="this.request.usualLastName === this.request.legalLastName && this.request.usualFirstName === this.request.legalFirstName && this.request.usualMiddleName === this.request.legalMiddleNames" cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-2 grey--text text--darken-1"><strong>{{ this.request.usualLastName ? this.request.usualLastName: '(none)'}}, {{ this.request.usualFirstName ? this.request.usualFirstName: '(none)'}}, {{ this.request.usualMiddleName ? this.request.usualMiddleName: '(none)'}}</strong></p>
      </v-col>
      <v-col v-else>
        <p class="mb-2"><strong>{{ this.request.usualLastName ? this.request.usualLastName: '(none)'}}, {{ this.request.usualFirstName ? this.request.usualFirstName: '(none)'}}, {{ this.request.usualMiddleName ? this.request.usualMiddleName: '(none)'}}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p>Maiden:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p><strong>{{ this.request.maidenName }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">Past:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-2"><strong>{{ this.request.pastNames }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">DOB:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-2"><strong>{{ this.request.dob ? moment(this.request.dob).format('YYYY/MM/DD'):'' }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p>Gender:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p><strong>{{ this.request.genderCode }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">Current Sch:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-2"><strong>{{ this.request.currentSchool }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">Last BC Sch:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-2"><strong>{{ this.request.lastBCSchool }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p>Student ID:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p><strong>{{ this.request.lastBCSchoolStudentNumber }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">Email:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-2"><strong>{{ this.request.email }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="pb-2 px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-0">ID Type:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-0"><strong>{{ this.request.dataSourceCode }}</strong></p>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import router from '@/router';
import PrimaryButton from '@/components/util/PrimaryButton';
import {mapState} from 'vuex';

export default {
  name: 'penRequestCard',
  components: {
    PrimaryButton
  },
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  computed: {
    ...mapState('auth', ['isValidStudentSearchUser']),
    disableSearchBtn() {
      return !this.request.legalLastName && !this.request.legalFirstName
          && !this.request.genderCode && !this.request.dob;
    },
  },
  methods: {
    searchStudent() {
      const searchParams = {
        legalLastName: this.request.legalLastName?? null,
        legalFirstName: this.request.legalFirstName?? null,
        genderCode: this.request.genderCode?? null,
        dob: this.request.dob? this.request.dob.replaceAll('-', '/') : null,
      };

      const route = router.resolve({name: 'basicSearch', query: { ...searchParams }});
      window.open(route.href, '_blank');
    },
  }
};
</script>
