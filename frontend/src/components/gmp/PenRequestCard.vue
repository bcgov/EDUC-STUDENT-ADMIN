<template>
  <div>
    <v-row
      no-gutters
      class="pt-2 px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-2">
          Legal:
        </p>
      </v-col>
      <v-col
        cols="12"
        xl="8"
        lg="8"
        md="8"
        sm="8"
      >
        <p class="mb-2">
          <strong>{{ request.legalLastName ? request.legalLastName: '(none)' }}, {{ request.legalFirstName ? request.legalFirstName: '(none)' }}, {{ request.legalMiddleNames ? request.legalMiddleNames: '(none)' }}</strong>
        </p>
      </v-col>
      <v-col
        v-if="isValidStudentSearchUser"
        cols="1"
      >
        <PrimaryButton
          color="#38598A"
          text="Search"
          :short="true"
          :disabled="disableSearchBtn"
          class="mt-1 ml-n3"
          @click-action="searchStudent"
        />
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-2">
          Usual:
        </p>
      </v-col>
      <v-col
        v-if="!request.usualLastName && !request.usualFirstName && !request.usualMiddleName"
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p class="mb-2" />
      </v-col>
      <v-col
        v-else-if="request.usualLastName === request.legalLastName && request.usualFirstName === request.legalFirstName && request.usualMiddleName === request.legalMiddleNames"
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p class="mb-2 grey--text text--darken-1">
          <strong>{{ request.usualLastName ? request.usualLastName: '(none)' }}, {{ request.usualFirstName ? request.usualFirstName: '(none)' }}, {{ request.usualMiddleName ? request.usualMiddleName: '(none)' }}</strong>
        </p>
      </v-col>
      <v-col v-else>
        <p class="mb-2">
          <strong>{{ request.usualLastName ? request.usualLastName: '(none)' }}, {{ request.usualFirstName ? request.usualFirstName: '(none)' }}, {{ request.usualMiddleName ? request.usualMiddleName: '(none)' }}</strong>
        </p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p>Maiden:</p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p><strong>{{ request.maidenName }}</strong></p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-2">
          Past:
        </p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p class="mb-2">
          <strong>{{ request.pastNames }}</strong>
        </p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-2">
          DOB:
        </p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p class="mb-2">
          <strong>{{ getMomentDate(request.dob, 'YYYY/MM/DD') }}</strong>
        </p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-2">
          Current School:
        </p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p class="mb-2">
          <strong>{{ request.currentSchool }}</strong>
        </p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-2">
          Last BC School:
        </p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p class="mb-2">
          <strong>{{ request.lastBCSchool }}</strong>
        </p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p>Student ID:</p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p><strong>{{ request.lastBCSchoolStudentNumber }}</strong></p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-2">
          Email:
        </p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p class="mb-2">
          <strong>{{ request.email }}</strong>
        </p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="pb-2 px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-0">
          ID Type:
        </p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
      >
        <p class="mb-0">
          <strong>{{ request.dataSourceCode }}</strong>
        </p>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import router from '@/router';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import {getMomentDate} from '@/utils/dateHelpers';

export default {
  name: 'PenRequestCard',
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
    ...mapState(authStore, ['isValidStudentSearchUser']),
    disableSearchBtn() {
      return !this.request.legalLastName && !this.request.legalFirstName
          && !this.request.genderCode && !this.request.dob;
    },
  },
  methods: {
    getMomentDate,
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
