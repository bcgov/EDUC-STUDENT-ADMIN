<template>
  <div>
    <v-row no-gutters class="pen py-2 px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">PEN:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9" class="d-flex">
        <p id="penContainer" class="mb-2"><strong>{{ this.request.recordedPen || ''}}</strong></p>
        <v-tooltip class="mb-2" v-model="clipboard" right v-if="request.recordedPen">
          <template v-slot:activator="{ }">
            <v-btn id="copy-pen" small depressed color="#38598a" dark class="ml-2" @click="copyPen" >Copy</v-btn>
          </template>
          <span>PEN Copied to Clipboard!</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row no-gutters class="request-data pt-2 px-2">
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <v-row no-gutters class="request-title justify-center pb-4">
          <strong>Current</strong>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
            <p class="mb-2">First:</p>
          </v-col>
          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
            <p class="mb-2">{{ this.request.recordedLegalFirstName || ' '}}</p>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
            <p class="mb-2">Middle:</p>
          </v-col>
          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
            <p class="mb-2">{{ this.request.recordedLegalMiddleNames || ' '}}</p>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
            <p class="mb-2">Last:</p>
          </v-col>
          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
            <p class="mb-2">{{ this.request.recordedLegalLastName || ' '}}</p>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
            <p class="mb-2">DOB:</p>
          </v-col>
          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
            <p class="mb-2">{{ this.request.recordedDob ? moment(this.request.recordedDob).format('YYYY-MM-DD'):'' }}</p>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
            <p>Gender:</p>
          </v-col>
          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
            <p>{{ this.request.recordedGenderCode }}</p>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6" class="requested-updates pl-4">
        <v-row no-gutters class="request-title justify-center pb-4">
          <strong>Requested Updates</strong>
        </v-row>
        <v-row no-gutters>
          <p class="update-data mb-2">{{ this.request.legalFirstName || ' '}}</p>
        </v-row>
        <v-row no-gutters>
          <p class="update-data mb-2">{{ this.request.legalMiddleNames || ' '}}</p>
        </v-row>
        <v-row no-gutters>
          <p class="update-data mb-2">{{ this.request.legalLastName || ' '}}</p>
        </v-row>
        <v-row no-gutters>
          <p class="update-data mb-2">{{ this.request.dob ? moment(this.request.dob).format('YYYY-MM-DD'):'' }}</p>
        </v-row>
        <v-row no-gutters>
          <p>{{ this.request.genderCode }}</p>
        </v-row>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2 pt-4">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-2">Email:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-2">{{ this.request.email }}</p>
      </v-col>
    </v-row>
    <v-row no-gutters class="pb-2 px-2">
      <v-col cols="12" xl="3" lg="3" md="3" sm="3">
        <p class="mb-0">ID Type:</p>
      </v-col>
      <v-col cols="12" xl="9" lg="9" md="9" sm="9">
        <p class="mb-0">{{ this.request.dataSourceCode }}</p>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'studentRequestCard',
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      clipboard: false,
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
    }
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
    text-decoration: underline;
    font-size: 1.1rem;
  }

  .update-data {
    min-height: 1.5rem;
  }
</style>
