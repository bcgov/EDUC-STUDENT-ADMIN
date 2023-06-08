<template>
  <v-form ref="districtDetailsForm" v-model="districtDetailsFormValid">
    <v-container class="containerSetup" fluid>
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
          <a class="ml-1" @click="backButtonClick">Return to District List</a>
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
            <v-col v-if="!editing" cols="6" class="d-flex justify-start">
              <h2 id="districtName">{{ district.districtNumber }} - {{ district.displayName }}</h2>
            </v-col>
            <v-col class="d-flex" v-else>
              <h2 id="districtNumber">{{ district.districtNumber }} - </h2>
              <v-text-field class="mt-n5 ml-3" style="font-size: x-large" :maxlength="255" :rules="[rules.required()]" required v-model="districtDetailsCopy.displayName">
              </v-text-field>
            </v-col>
            <v-col v-if="!editing" cols="6" class="d-flex justify-end">
              <PrimaryButton id="viewDistrictContactsButton" class="mr-2" secondary icon-left
                             icon="mdi-account-multiple-outline" :to="`/institute/districtContacts/${districtID}`"
                             text="View District Contacts"></PrimaryButton>
              <PrimaryButton id="districtDetailsEditButton" icon-left width="6em" icon="mdi-pencil" text="Edit"
                             v-if="canEditDistrictDetails()" @click.native="toggleEdit"></PrimaryButton>
            </v-col>
            <v-col v-else cols="6" class="d-flex justify-end">
              <PrimaryButton class="mr-2" secondary id="cancelButton" icon-left width="6em" text="Cancel"
                             @click.native="cancelClicked"></PrimaryButton>
              <PrimaryButton id="saveButton" icon-left width="6em" text="Save" :disabled="!districtDetailsFormValid"
                             @click.native="updateDistrictDetails"></PrimaryButton>
            </v-col>
          </v-row>
          <v-row cols="1">
            <v-col lg="2" sm="4" class="mt-1">
              <v-icon class="pb-1" :color="getStatusColor()" right dark>
                mdi-circle-medium
              </v-icon>
              <span>{{getStatusText()}}</span>
            </v-col>
            <v-col cols="2" class="pt-0 pb-0">
              <div v-if="!editing" class="mt-4">
                <v-icon class="mb-1 mr-1" :class="showEditLinks(district.phoneNumber) ? 'mt-n2' : ''">
                  mdi-phone-outline
                </v-icon>
                <span v-if="district.phoneNumber" class="ml-n1">{{ formatPhoneNumber(district.phoneNumber) }}</span>
                <a v-if="showEditLinks(district.phoneNumber)" class="editField" @click="toggleEdit">+Phone</a>
              </div>
              <v-text-field prepend-inner-icon="mdi-phone-outline" id="districtDetailsPhoneNumber" v-else class="shrink py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="[rules.required(), rules.phoneNumber()]" v-model="districtDetailsCopy.phoneNumber"/>
            </v-col>
            <v-col cols="2" class="pt-0 pb-0">
              <div v-if="!editing" class="mt-4">
                <v-icon class="mb-1 mr-1" :class="showEditLinks(district.faxNumber) ? 'mt-n2' : ''">
                  mdi-fax
                </v-icon>
                <span v-if="district.faxNumber" class="ml-n1">{{ formatPhoneNumber(district.faxNumber) }}</span>
                <a v-if="showEditLinks(district.faxNumber)" class="editField" @click="toggleEdit">+Fax</a>
              </div>
              <v-text-field prepend-inner-icon="mdi-fax" id="districtDetailsFaxNumber" v-else class="shrink py-0" @keypress="isNumber($event)" :rules="[rules.phoneNumber('Fax number must be valid')]" :maxlength="10" v-model="districtDetailsCopy.faxNumber"/>
            </v-col>
            <v-col cols="3" class="pt-0 pb-0">
              <div v-if="!editing" class="mt-4">
                <v-icon class="mb-1 mr-1" :class="showEditLinks(district.email) ? 'mt-n2' : ''">
                  mdi-at
                </v-icon>
                <span v-if="district.email" style="word-break: break-all;" class="ml-n1">{{ district.email }}</span>
                <a v-if="showEditLinks(district.email)" class="editField" @click="toggleEdit">+Email</a>
              </div>
              <v-text-field id="districtDetailsEmail" v-else class="py-0" prepend-inner-icon="mdi-at" required :rules="[rules.email()]" :maxlength="255" v-model="districtDetailsCopy.email"/>
            </v-col>
            <v-col cols="3" class="pt-0 pb-0">
              <div v-if="!editing" class="mt-4">
                <v-icon class="mb-1 mr-1" :class="showEditLinks(cleanWebsiteUrl) ? 'mt-n2' : ''">
                  mdi-web
                </v-icon>
                <a style="word-break: break-all;" v-if="cleanWebsiteUrl" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
                <a v-if="showEditLinks(cleanWebsiteUrl)" class="editField" @click="toggleEdit">+Website</a>
              </div>
              <v-text-field v-if="editing" prepend-inner-icon="mdi-web" class="py-0" :rules="[rules.website()]" :maxlength="255" v-model="districtDetailsCopy.website"/>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-divider class="divider"></v-divider>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start">
            <v-col cols="12" class="d-flex justify-start">
              <h2>Addresses</h2>
            </v-col>
          </v-row>
          <v-row v-if="!hasMailingAddress() && !editing" no-gutters class="d-flex justify-start">
           <v-col>
            <a class="editField" @click="toggleEdit">+Address</a>
           </v-col>
          </v-row>
          <v-row v-else no-gutters class="d-flex justify-start">
            <v-col v-if="editing || hasMailingAddress()" cols="3">
              <v-row>
                <v-col>
                  <v-icon class="pb-1 mr-1" right >
                    mdi-email-outline
                  </v-icon>
                  <span>Mailing Address</span>
                </v-col>
              </v-row>
              <v-row v-if="!editing" no-gutters>
                <v-col>
                  <v-row class="ml-9" no-gutters>
                    <v-col>
                      <span style="word-break: break-all;">{{ getMailingAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode')  + ', ' + getMailingAddressItem('countryCode') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('postal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row v-else no-gutters>
                <v-col>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Line 1
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressLine1"
                        required
                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        class="shrink mt-n5 mb-3"
                        v-model="getMailingAddressCopy()[0].addressLine1">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Line 2
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressLine2"
                        class="shrink mt-n5 mb-3"
                        :rules="[rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        v-model="getMailingAddressCopy()[0].addressLine2">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      City
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressCity"
                        required
                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        class="shrink mt-n5 mb-3"
                        v-model="getMailingAddressCopy()[0].city">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Province
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8" class="d-flex">
                      <v-select
                        id="mailAddressProvince"
                        :items="this.provinceCodeValues"
                        item-text="label"
                        item-value="provinceCode"
                        v-model="getMailingAddressCopy()[0].provinceCode"
                        dense
                        outlined
                        :rules="[rules.required()]"
                        required
                        class="mt-2"
                        style="color: black">
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Country
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8" class="d-flex">
                      <v-select
                        id="mailAddressCountry"
                        :items="this.countryCodeValues"
                        item-text="label"
                        item-value="countryCode"
                        :rules="[rules.required()]"
                        v-model="getMailingAddressCopy()[0].countryCode"
                        dense
                        outlined
                        class="mt-2 mb-2"
                        style="color: black">
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Postal Code
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field :maxlength="6" required :rules="[rules.required(), rules.postalCode()]"  id="mailAddressPostal" class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].postal">
                      </v-text-field>
                    </v-col>
                  </v-row>
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
              <v-row v-if="!hasSamePhysicalAddress && !editing" no-gutters>
                <v-col>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode')  + ', ' + getPhysicalAddressItem('countryCode') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('postal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row v-else no-gutters>
                <v-col>
                  <v-row class="ml-9" no-gutters>
                    <v-col v-if="sameAsMailingCheckbox && !editing" class="fontItalic">
                      <span>Same as Mailing Address</span>
                    </v-col>
                    <v-col v-else>
                      <v-row no-gutters>
                        <v-col>
                          <v-row no-gutters>
                            <v-col>
                              <v-row v-if="!sameAsMailingCheckbox" no-gutters>
                                <v-col>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Line 1
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressLine1"
                                        required
                                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        class="shrink mt-n5 mb-3"
                                        v-model="getPhysicalAddressCopy()[0].addressLine1">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Line 2
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressLine2"
                                        :rules="[rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        class="shrink mt-n5 mb-3"
                                        v-model="getPhysicalAddressCopy()[0].addressLine2">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      City
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressCity"
                                        required :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        class="shrink mt-n5 mb-3"
                                        v-model="getPhysicalAddressCopy()[0].city">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Province
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressProvince"
                                        :items="this.provinceCodeValues"
                                        item-text="label"
                                        item-value="provinceCode"
                                        v-model="getPhysicalAddressCopy()[0].provinceCode"
                                        dense
                                        required
                                        :rules="[rules.required()]"
                                        outlined
                                        class="mt-2"
                                        style="color: black">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Country
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressCountry"
                                        :items="this.countryCodeValues"
                                        item-text="label"
                                        item-value="countryCode"
                                        v-model="getPhysicalAddressCopy()[0].countryCode"
                                        dense
                                        :rules="[rules.required()]"
                                        required
                                        outlined
                                        class="mt-2 mb-2"
                                        style="color: black">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Postal Code
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressPostal" required :rules="[rules.required(), rules.postalCode()]" :maxlength="6" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].postal">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col>
                                  <v-checkbox
                                    dense
                                    id="sameAsMailingCheckbox"
                                    @click.native="clickSameAsAddressButton"
                                    v-model="sameAsMailingCheckbox"
                                    label="Same as Mailing Address"
                                    class="mt-n3 pt-0"
                                  ></v-checkbox>
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-row>
                <v-col class="d-flex justify-start">
                  <h2>Ministry Notes</h2>
                </v-col>
                <v-col class="d-flex justify-end">
                  <PrimaryButton id="addNewDistrictNoteButton" width="9em" icon="mdi-plus" icon-left text="New Note"
                    v-if="canEditDistrictDetails()" @click.native="newNoteSheet = !newNoteSheet"></PrimaryButton>
                </v-col>
              </v-row>
              <v-row>
              <v-col class="d-flex justify-start">
                <v-timeline id="districtNotesTimeline" dense v-if="district.notes.length > 0">
                  <div v-for="(activity) in district.notes"
                       :key="activity.noteId">
                    <v-timeline-item right icon="mdi-message-bulleted" icon-color="#003366" large color="white" >
                      <v-card width="40em">
                        <v-card-title>
                          <div class="activityTitle">{{ activity.createUser }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ formatDate(activity.createDate.substring(0,19),'uuuu-MM-dd\'T\'HH:mm:ss', to='uuuu/MM/dd') }}</div>
                        </v-card-title>
                        <v-card-text class="activityContent">{{ activity.content }}</v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </div>
                </v-timeline>
                <v-timeline id="districtNotesTimeline" dense v-else >
                  <v-timeline-item right icon="mdi-message-bulleted" icon-color="#003366" large color="white" >
                    <v-card width="40em">
                      <v-card-text class="activityContent">No notes have been recorded for this school</v-card-text>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
            </v-row>
            </v-col>
          </v-row>

          <v-bottom-sheet v-model="newNoteSheet" inset no-click-animation scrollable persistent width="30%">
            <v-card v-if="newNoteSheet" id="newDistrictNoteSheet" class="information-window-v-card">
              <v-card-title class="sheetHeader pt-1 pb-1">New Note</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-textarea id="newDistrictNoteTextArea" v-model="newNoteText" rows="8" label="Note" autofocus no-resize
                      maxlength="4000" class="pt-0" ref="newDistrictNoteTextArea" hide-details="auto">
                    </v-textarea>
                  </v-col>
                </v-row>
                <v-row class="py-4 pr-2 justify-end">
                  <PrimaryButton id="cancelNote" secondary text="Cancel" class="mr-2"
                    @click.native="newNoteSheet = !newNoteSheet; newNoteText = ''"></PrimaryButton>
                  <PrimaryButton id="saveNote" text="Save" width="7rem" :disabled="newNoteText === ''" :loading="loading" @click.native="saveNewDistrictNote"></PrimaryButton>
                </v-row>
              </v-card-text>
            </v-card>
          </v-bottom-sheet>

        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import router from '@/router';
import { sanitizeUrl } from '@braintree/sanitize-url';
import {mapGetters, mapState} from 'vuex';
import {deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';

export default {
  name: 'DistrictDetails',
  mixins: [alertMixin],
  components: {
    PrimaryButton
  },
  props: {
    districtID: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      district: null,
      rules: Rules,
      loading: false,
      cleanWebsiteUrl: '',
      editing: false,
      districtDetailsFormValid: true,
      districtDetailsCopy: {},
      provinceCodeValues: [],
      countryCodeValues: [],
      sameAsMailingCheckbox: true,
      newNoteSheet: false,
      newNoteText: '',
    };
  },
  computed:{
    ...mapGetters('auth', ['DISTRICT_ADMIN_ROLE']),
    ...mapState('institute', ['provinceCodes']),
    ...mapState('institute', ['countryCodes']),
    hasSamePhysicalAddress(){
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
  },
  created() {
    this.getDistrict();
    this.$store.dispatch('institute/getAllProvinceCodes').then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    this.$store.dispatch('institute/getAllCountryCodes').then(() => {
      this.countryCodeValues = this.countryCodes;
    });
  },
  methods: {
    formatPhoneNumber,
    saveNewDistrictNote() {
      this.loading = false;

      const payload = {
        districtID: this.district.districtId,
        noteContent: this.newNoteText
      };
      ApiService.apiAxios.post(`${Routes.institute.DISTRICT_NOTE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the district.');
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the district note. Please try again later.');
        })
        .finally(() => {
          this.getDistrict();
          this.newNoteSheet = false;
          this.newNoteText = '';
        });
    },
    getDistrict() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.institute.DISTRICT_DATA_URL}/${this.districtID}`)
        .then(response => {
          this.district = response.data;
          this.cleanWebsiteUrl = this.district.website ? sanitizeUrl(this.district.website) : '';
          this.sortNotes();
          this.setHasSamePhysicalFlag();
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    async clickSameAsAddressButton(){
      await this.$nextTick();
      this.$refs.districtDetailsForm.validate();
    },
    cancelClicked(){
      this.editing = false;
      this.setHasSamePhysicalFlag();
    },
    showEditLinks(fieldValue) {
      return this.canEditDistrictDetails() && !fieldValue;
    },
    setHasSamePhysicalFlag(){
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async toggleEdit(){
      this.districtDetailsCopy = this.deepCloneObject(this.district);
      this.addAddressesIfRequired(this.districtDetailsCopy);
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.districtDetailsForm.validate();
    },
    getStatusColor() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'green';
      } else {
        return 'red';
      }
    },
    sortNotes(){
      this.district.notes = this.district.notes.sort(function(a, b) {
        const aCreateDate = new LocalDateTime.parse(a.createDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        const bCreateDate = new LocalDateTime.parse(b.createDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        if ( aCreateDate < bCreateDate ){
          return 1;
        }
        if ( aCreateDate > bCreateDate ){
          return -1;
        }
        return 0;
      });
    },
    canEditDistrictDetails(){
      return this.DISTRICT_ADMIN_ROLE;
    },
    addAddressesIfRequired(district){
      let addresses = district.addresses;
      if(!this.hasMailingAddress()){
        addresses.push({
          'createUser': null,
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'addressId': null,
          'schoolId': null,
          'districtId': null,
          'independentAuthorityId': null,
          'phoneNumber': null,
          'email': null,
          'addressLine1': null,
          'addressLine2': null,
          'city': null,
          'postal': null,
          'addressTypeCode': 'MAILING',
          'provinceCode': null,
          'countryCode': null
        });
      }
      if(!this.hasPhysicalAddress()){
        addresses.push({
          'createUser': null,
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'addressId': null,
          'schoolId': null,
          'districtId': null,
          'independentAuthorityId': null,
          'phoneNumber': null,
          'email': null,
          'addressLine1': null,
          'addressLine2': null,
          'city': null,
          'postal': null,
          'addressTypeCode': 'PHYSICAL',
          'provinceCode': null,
          'countryCode': null
        });
      }
    },
    async updateDistrictDetails() {
      this.loading = true;

      if(this.sameAsMailingCheckbox){
        this.districtDetailsCopy.addresses = this.districtDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }
      ApiService.apiAxios.put(`${Routes.institute.DISTRICT_DATA_URL}` + '/' + this.districtDetailsCopy.districtId, this.districtDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The district details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the district information. Please try again later.');
        })
        .finally(() => {
          this.toggleEdit();
          this.getDistrict();
        });
    },
    deepCloneObject,
    isNumber,
    formatDate,
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
    hasPhysicalAddress(){
      return this.district.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressCopy(){
      return this.districtDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy(){
      return this.districtDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL');
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

.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.activityDisplayDate{
  font-size: smaller;
}

.activityContent {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  font-size: medium;
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

.editField {
  font-size: 14px;
  color: rgb(0, 51, 102);
  vertical-align: super;
}

.editField:hover {
  text-decoration: underline;
}

</style>
