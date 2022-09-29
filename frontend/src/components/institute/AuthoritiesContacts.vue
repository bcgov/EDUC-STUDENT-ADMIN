<template>
  <v-container class="containerSetup" fluid>
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
            class="mt-16"
            :size="70"
            :width="7"
            color="primary"
            indeterminate
            :active="loading"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <template v-if="!loading">
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon class="mt-1" small color="#1976d2">mdi-arrow-left</v-icon>
          <a class="ml-1 mt-1" @click="backButtonClick">Return to Authority List</a>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="d-flex justify-start">
          <v-row no-gutters>
            <v-col cols="12">
              <h2 class="subjectHeading">{{authority.authorityNumber}} - {{authority.displayName}}</h2>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row cols="2">
        <v-col class="d-flex justify-start">
          <v-chip class="mr-3" color="#A9D18E">Active</v-chip>
          <v-chip class="mr-3" color="#9DC3E6">Pending Start Date</v-chip>
          <v-chip color="#F4B183">Pending End Date</v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton icon-left width="11em" icon="mdi-plus-thick" text="New Contact"></PrimaryButton>
        </v-col>
      </v-row>
      <div v-for="authorityContactType in authorityContactTypes" :key="authorityContactType.code">
        <v-row>
          <v-col>
            <h2 style="color:#1A5A96">{{authorityContactType.label}}</h2>
          </v-col>
        </v-row>
        <v-row cols="2" v-if="authorityContacts.has(authorityContactType.authorityContactTypeCode)">
          <v-col cols="5" lg="4" v-for="contact in authorityContacts.get(authorityContactType.authorityContactTypeCode)" :key="contact.independentAuthorityId">
            <v-card>
              <v-card-title class="pb-0">
                <v-row no-gutters>
                  <v-col>
                    <v-row no-gutters>
                      <v-col cols="9">
                        <v-icon class="pb-1" :color="getStatusColor(contact)" left dark>
                          mdi-circle-medium
                        </v-icon>
                        <strong>{{ `${contact.firstName} ${contact.lastName}` }}</strong>
                      </v-col>
                      <v-col cols="3" class="d-flex justify-end">
                        <PrimaryButton icon-left width="100%" secondary icon="mdi-pencil" text="Edit"></PrimaryButton>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="12" class="pt-1">
                        <span>{{ contact.email }}</span>
                      </v-col>
                      <v-col cols="12" class="pt-1">
                        <span>{{ formatPhoneNumber(contact.phoneNumber) }}</span><span v-if="contact.phoneExtension"> ext. {{contact.phoneExtension}}</span>
                      </v-col>
                      <v-col cols="12" class="pt-1" v-if="contact.alternatePhoneNumber">
                        <span>{{ formatPhoneNumber(contact.alternatePhoneNumber) }} (alt.)</span> <span v-if="contact.alternatePhoneExtension"> ext. {{contact.alternatePhoneExtension}}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-text class="pt-2">
                <v-row no-gutters>
                  <v-col cols="12" class="pt-1" v-if="contact.expiryDate">
                    <v-icon aria-hidden="false">
                      mdi-calendar-today
                    </v-icon>
                    <span> {{ formatDate(contact.effectiveDate) }} - {{ formatDate(contact.expiryDate)}}</span>
                  </v-col>
                  <v-col cols="12" class="pt-1" v-else>
                    <v-icon aria-hidden="false">
                      mdi-calendar-today
                    </v-icon>
                    <span> {{ formatDate(contact.effectiveDate) }}</span>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row cols="2" v-else>
          <v-col>
            <p>No contacts of this type have been listed.</p>
          </v-col>
        </v-row>
      </div>
    </template>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber} from '@/utils/format';
import {getStatusColor} from '@/utils/institute/status';

export default {
  name: 'AuthorityContactPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  data() {
    return {
      loadingCount: 0,
      authorityContactTypes: [],
      authorityContacts: new Map(),
      authority: {},
    };
  },
  created() {
    this.getThisAuthorityContacts();
    this.getAuthorityContactTypeCodes();
  },
  computed: {
    loading() {
      return this.loadingCount !== 0;
    }
  },
  methods: {
    getThisAuthorityContacts() {
      this.loadingCount += 1;

      ApiService.apiAxios.get(`${Routes.institute.AUTHORITY_BY_ID_URL}/${this.$route.params.authorityID}`)
        .then(response => {
          this.authorityContacts = new Map();
          this.authority = response.data;
          response.data.contacts.forEach(contact => {
            if (!this.authorityContacts.has(contact.authorityContactTypeCode)) {
              this.authorityContacts.set(contact.authorityContactTypeCode, [contact]);
              return;
            }
            this.schoolContacts.get(contact.authorityContactTypeCode).push(contact);
          });
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get Authority by ID. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    getAuthorityContactTypeCodes() {
      this.loadingCount += 1;

      ApiService.apiAxios.get(Routes.institute.AUTHORITY_CONTACT_TYPES_URL)
        .then(response => {
          this.authorityContactTypes = response.data;
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get the details of available Authority Contact Type Codes. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    backButtonClick() {
      this.$router.push({name: 'instituteAuthoritiesList'});
    },
    formatDate(rawDate){
      return new Date(rawDate).toISOString().slice(0,10).replace(/-/g,'/');
    },
    formatPhoneNumber,
    getStatusColor
  }
};

</script>
<style scoped>
@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}
.containerSetup{
  padding-right: 32em !important;
  padding-left: 32em !important;
}
@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}
@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}
</style>
