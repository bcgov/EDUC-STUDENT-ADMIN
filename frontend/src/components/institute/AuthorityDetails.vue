<template>
  <v-container class="containerSetup" fluid>
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to Authorities List</a>
      </v-col>
    </v-row>
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
    <v-row v-else no-gutters>
      <v-col>
        <v-row  class="d-flex justify-start">
          <v-col cols="6" class="d-flex justify-start">
            <h2 id="authorityName">{{ authority.authorityNumber }} - {{ authority.displayName }}</h2>
          </v-col>
          <v-col cols="6" class="d-flex justify-end">
            <PrimaryButton icon-left width="6em" icon="mdi-pencil-outline" text="Edit"></PrimaryButton>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex">
            <v-icon class="pb-1" :color="getStatusColor()" right dark>
              mdi-circle-medium
            </v-icon>
            <span>{{getStatusText()}}</span>
          </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
              mdi-phone-outline
            </v-icon>
            <span>{{ formatPhoneNumber(authority.phoneNumber) }}</span>
          </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
              mdi-at
            </v-icon>
            <span>{{ authority.email }}</span>
          </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
              mdi-fax
            </v-icon>
            <span>{{ formatPhoneNumber(authority.faxNumber) }}</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <h2 class="subjectHeading pt-4">Authority Details</h2>
          </v-col>
        </v-row>
        <v-row class="pl-3">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">Open Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ formatDate(authority.openedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class=" pt-2 pr-0">
                <span style="color: grey">Close Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ formatDate(authority.closedDate) || '-'}}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="10" class="pt-2 pr-0">
                <span style="color: grey">Authority Type</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span class="ministryLine" style="color: black">{{ getAuthorityType(authority) }}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="mt-6 d-flex justify-start">
          <v-col cols="12" class="d-flex justify-start">
            <h2>Addresses</h2>
          </v-col>
        </v-row>
        <v-row no-gutters class="d-flex justify-start">
          <v-col v-if="hasMailingAddress()" cols="3">
            <v-row>
              <v-col>
                <v-icon class="pb-1 mr-1" right >
                  mdi-email-outline
                </v-icon>
                <span>Mailing Address</span>
              </v-col>
            </v-row>
            <v-row class="ml-9" no-gutters>
              <v-col>
                <span>{{ getMailingAddressItem('addressLine1') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('addressLine2') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode')  + ', ' + getMailingAddressItem('countryCode') }}</span>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-9">
                <span>{{ getMailingAddressItem('postal') }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3">
            <v-row>
              <v-col>
                <v-icon class="pb-1 mr-1" right >
                  mdi-home-outline
                </v-icon>
                <span>Physical Address</span>
              </v-col>
            </v-row>
            <v-row v-if="!hasSamePhysicalAddress" no-gutters>
              <v-col>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('addressLine1') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('addressLine2') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode')  + ', ' + getPhysicalAddressItem('countryCode') }}</span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="ml-9">
                    <span>{{ getPhysicalAddressItem('postal') }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row v-else no-gutters>
              <v-col>
                <v-row class="ml-9" no-gutters>
                  <v-col class="fontItalic">
                    <span>Same as Mailing Address</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import {mapState} from 'vuex';
import router from '@/router';

export default {
  name: 'AuthorityDetailsPage',
  mixins: [alertMixin],
  components: {PrimaryButton},
  props: {
    authorityID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      authority: null,
      loading: false,
      authorityTypes: []
    };
  },
  computed:{
    ...mapState('institute', ['authorityTypeCodes']),
    hasSamePhysicalAddress(){
      return !this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    }
  },
  created() {
    this.$store.dispatch('institute/getAuthorityTypeCodes').then(() => {
      this.authorityTypes = this.authorityTypeCodes;
    });
    this.getAuthority();
  },
  methods: {
    formatPhoneNumber,
    formatDate,
    getAuthority() {
      this.loading = true;

      ApiService.apiAxios.get(Routes.institute.AUTHORITY_BY_ID_URL + '/' + this.authorityID, {
      }).then(response => {
        this.authority = response.data;
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.loading = false;
      });
    },
    getStatusColor() {
      let status = this.getStatusText();
      if (status === 'Open') {
        return 'green';
      } else if (status === 'Opening'){
        return 'blue';
      } else if (status === 'Closing'){
        return 'orange';
      } else if (status === 'Closed') {
        return 'red';
      }
    },
    getStatusText() {
      const currentDate = LocalDate.now();
      let openedDate = this.authority.openedDate;
      let closedDate = this.authority.closedDate;

      const parsedOpenDate = new LocalDate.parse(openedDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));

      let parsedCloseDate = null;
      if(closedDate){
        parsedCloseDate = new LocalDate.parse(closedDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
      }

      if (parsedOpenDate <= currentDate && parsedCloseDate === null) {
        return 'Open';
      } else if (parsedOpenDate <= currentDate && parsedCloseDate > currentDate) {
        return 'Closing';
      }

      return 'Closed';
    },
    backButtonClick() {
      router.push({name: 'instituteAuthoritiesList'});
    },
    getAuthorityType(authority){
      return this.authorityTypes.find((autorityType) => autorityType.authorityTypeCode === authority.authorityTypeCode).label;
    },
    hasMailingAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    getMailingAddressItem(item){
      let mailingAddress = this.authority.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    }
  }
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: medium;
}

.fontBolder{
  font-weight: bolder;
}

.fontItalic{
  font-style: italic;
}

.containerSetup{
  padding-right: 24em !important;
  padding-left: 24em !important;
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
