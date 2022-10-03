<template>
  <v-container class="containerSetup" fluid>
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to the List of Districts</a>
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
            <h2 id="districtName">{{ district.districtNumber }} - {{ district.displayName }}</h2>
          </v-col>
          <v-col cols="6" class="d-flex justify-end">
            <PrimaryButton width="6em" icon="mdi-pencil" icon-left text="Edit"></PrimaryButton>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col  lg="2" sm="4">
            <v-icon class="pb-1" :color="getStatusColor()" right dark>
              mdi-circle-medium
            </v-icon>
            <span>{{getStatusText()}}</span>
          </v-col>
          <v-col lg="2" sm="4">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
              mdi-phone-outline
            </v-icon>
            <span>{{ formatPhoneNumber(district.phoneNumber) }}</span>
          </v-col>
          <v-col lg="3" sm="4">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
              mdi-at
            </v-icon>
            <span>{{ district.email }}</span>
          </v-col>
          <v-col lg="2" sm="4">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
              mdi-fax
            </v-icon>
            <span>{{ formatPhoneNumber(district.faxNumber) }}</span>
          </v-col>
          <v-col  lg="3" sm="4">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
              mdi-web
            </v-icon>
            <a v-if="cleanWebsiteUrl" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
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
import {formatPhoneNumber} from '@/utils/format';
import router from '@/router';
import { sanitizeUrl } from '@braintree/sanitize-url';

export default {
  name: 'DistrictDetails',
  mixins: [alertMixin],
  components: {PrimaryButton},
  props: {
    districtID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      district: null,
      loading: false,
      cleanWebsiteUrl: '',
    };
  },
  computed:{
    hasSamePhysicalAddress(){
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    }
  },
  created() {
    this.getDistrict();
  },
  methods: {
    formatPhoneNumber,
    getDistrict() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.institute.DISTRICT_DATA_URL}/${this.districtID}`)
        .then(response => {
          this.district = response.data;
          this.cleanWebsiteUrl = this.district.website ? sanitizeUrl(this.district.website) : '';
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getStatusColor() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'green';
      } else {
        return 'red';
      }
    },
    getStatusText() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'Active';
      } else {
        return 'Inactive';
      }
    },
    hasMailingAddress(){
      return this.district.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    getMailingAddressItem(item){
      let mailingAddress = this.district.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    },
    backButtonClick() {
      router.push({name: 'instituteDistrict'});
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
