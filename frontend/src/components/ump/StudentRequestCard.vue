<template>
  <div>
    <v-row
      no-gutters
      class="pen py-2 px-2"
    >
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
        sm="3"
      >
        <p class="mb-2">
          PEN:
        </p>
      </v-col>
      <v-col
        cols="12"
        xl="9"
        lg="9"
        md="9"
        sm="9"
        class="d-flex"
      >
        <p
          id="penContainer"
          class="mb-2"
        >
          <strong>{{ request.recordedPen || '' }}</strong>
        </p>
        <v-tooltip
          v-if="request.recordedPen"
          v-model="clipboard"
          class="mb-2"
          right
        >
          <template #activator="{ }">
            <PrimaryButton
              id="copy-pen"
              class="ml-2"
              text="Copy"
              :short="true"
              @click-action="copyPen"
            />
          </template>
          <span>PEN Copied to Clipboard!</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="request-data pt-2 px-2"
    >
      <v-col
        cols="12"
        xl="6"
        lg="6"
        md="6"
        sm="6"
      >
        <v-row
          no-gutters
          class="request-title justify-center pb-4"
        >
          <strong>Current</strong>
          <PrimaryButton
            id="search"
            class="request-title-btn ml-4"
            text="Open Details"
            :short="true"
            :disabled="!request.recordedPen"
            :loading="loading"
            @click-action="searchStudent"
          />
        </v-row>
        <v-row no-gutters>
          <v-col
            cols="12"
            xl="3"
            lg="3"
            md="3"
            sm="3"
          >
            <p class="mb-2">
              First:
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
              {{ request.recordedLegalFirstName || ' ' }}
            </p>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col
            cols="12"
            xl="3"
            lg="3"
            md="3"
            sm="3"
          >
            <p class="mb-2">
              Middle:
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
              {{ request.recordedLegalMiddleNames || ' ' }}
            </p>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col
            cols="12"
            xl="3"
            lg="3"
            md="3"
            sm="3"
          >
            <p class="mb-2">
              Last:
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
              {{ request.recordedLegalLastName || ' ' }}
            </p>
          </v-col>
        </v-row>
        <v-row no-gutters>
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
              {{ getMomentDate(request.recordedDob,'YYYY/MM/DD') }}
            </p>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="12"
        xl="6"
        lg="6"
        md="6"
        sm="6"
        class="requested-updates pl-4"
      >
        <v-row
          no-gutters
          class="request-title justify-center pb-4"
        >
          <strong>Requested Updates</strong>
        </v-row>
        <v-row no-gutters>
          <p class="update-data mb-2">
            {{ request.legalFirstName || ' ' }}
          </p>
        </v-row>
        <v-row no-gutters>
          <p class="update-data mb-2">
            {{ request.legalMiddleNames || ' ' }}
          </p>
        </v-row>
        <v-row no-gutters>
          <p class="update-data mb-2">
            {{ request.legalLastName || ' ' }}
          </p>
        </v-row>
        <v-row no-gutters>
          <p class="update-data mb-2">
            {{ getMomentDate(request.dob,'YYYY/MM/DD') }}
          </p>
        </v-row>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="px-2 pt-4"
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
          {{ request.email }}
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
          {{ request.dataSourceCode }}
        </p>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import router from '@/router';
import {Routes, REQUEST_TYPES} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {getMomentDate} from '@/utils/dateHelpers';

export default {
  name: 'StudentRequestCard',
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      clipboard: false,
      loading: false,
    };
  },
  methods: {
    copyPen() {
      navigator.clipboard.writeText(this.request.recordedPen).then(() => {
        this.clipboard = true;
        setTimeout(() => this.clipboard = false, 3000);
      });
    },
    copyToClipBoard(str) {
      const el = document.createElement('textarea');
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },
    getMomentDate,
    searchStudent() {
      this.loading = true;
      ApiService.apiAxios
        .get(Routes.student.ROOT_ENDPOINT, {params: {pen: this.request.recordedPen}})
        .then(response => {
          const studentID = response.data.studentID;
          const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
          window.open(route.href, '_blank', 'location=yes'); //add location to open in new window
        })
        .catch(error => {
          console.log(error);
          if (error?.response?.status === 404 && error?.response?.data?.message) {
            this.setFailureAlert(`No demographic data was found for pen :: ${this.request.recordedPen}`);
          } else {
            this.setFailureAlert('An error occurred while loading the demographic data. Please try again later.');
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  }
};
</script>

<style scoped>
  .pen {
    background-color: #E0E0E0;
    /* border: solid #757575; */
  }

  .requested-updates {
    border-left: thin solid #E0E0E0;
  }

  .request-data {
    border-bottom: thin solid #E0E0E0;
  }

  .request-title {
    position: relative;
    text-decoration: underline;
    font-size: 1.1rem;
  }

  .update-data {
    min-height: 1.5rem;
  }

  .request-title-btn {
    position: absolute;
    right: 4px;
  }
</style>
