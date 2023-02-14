<template>
  <v-form ref="authorityForm" v-model="authorityFormValid">
    <v-container class="containerSetup" fluid>
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
          <a class="ml-1" @click="backButtonClick">Return to Authority List</a>
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
              <v-col v-if="!editing" cols="8" class="d-flex justify-start">
                <h2 id="authorityName">{{ authority.authorityNumber }} - {{ authority.displayName }}</h2>
              </v-col>
              <v-col class="d-flex" v-else>
                <h2 id="authorityName">{{ authority.authorityNumber }} - </h2>
                <v-text-field class="mt-n5 ml-3" style="font-size: x-large" :maxlength="255" :rules="[rules.required()]" required v-model="authorityCopy.displayName">
                </v-text-field>
              </v-col>
              <v-col v-if="!editing" cols="4" class="d-flex justify-end">
                <PrimaryButton id="viewAuthorityContactsButton" class="mr-2" secondary icon-left icon="mdi-account-multiple-outline" :to="`/authorityContacts/${authorityID}`" text="View Authority Contacts"></PrimaryButton>
                <PrimaryButton id="editButton" icon-left width="6em" icon="mdi-pencil" text="Edit" v-if="canEditAuthorities()" @click.native="toggleEdit"></PrimaryButton>
              </v-col>
              <v-col v-else cols="4" class="d-flex justify-end">
                <PrimaryButton class="mr-2" secondary id="cancelButton" icon-left width="6em" text="Cancel" @click.native="editing = !editing"></PrimaryButton>
                <PrimaryButton id="saveButton" icon-left width="6em" text="Save" :disabled="!authorityFormValid" @click.native="saveAuthority"></PrimaryButton>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-start">
              <v-col v-if="!editing" class="d-flex">
                <v-icon class="pb-1" :color="getStatusColorAuthorityOrSchool(this.authority.status)" right dark>
                  mdi-circle-medium
                </v-icon>
                <span>{{ this.authority.status }}</span>
              </v-col>
              <v-col v-else class="d-flex justify-start pt-6">
                <PrimaryButton id="editAuthorityStatusButton" @click.native="openAuthorityStatusEdit" :secondary="true" >
                  <v-icon class="ml-n1 pr-3" :color="getStatusColorAuthorityOrSchool(this.authorityCopy.status)" dark>
                    mdi-circle-medium
                  </v-icon>
                  <span>{{ this.authorityCopy.status }}</span>
                </PrimaryButton>
              </v-col>
              <v-col class="d-flex">
                <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-phone-outline
                </v-icon>
                <div v-if="!editing">
                  <span v-if="authority.phoneNumber" class="ml-n1">{{ formatPhoneNumber(authority.phoneNumber) }}</span>
                  <a v-if="showEditLinks(authority.phoneNumber)" class="editField" @click="toggleEdit">+Phone</a>
                </div>
                <v-text-field v-else id="phoneNumberField" class="shrink py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="[rules.required(), rules.phoneNumber()]" v-model="authorityCopy.phoneNumber">
                </v-text-field>
              </v-col>
              <v-col class="d-flex">
                <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-at
                </v-icon>
                <div v-if="!editing">
                  <span v-if="authority.email" class="ml-n1">{{ authority.email }}</span>
                  <a v-if="showEditLinks(authority.email)" class="editField" @click="toggleEdit">+Email</a>
                </div>
                <v-text-field v-else id="emailField" class="py-0" required :rules="[rules.email()]" :maxlength="255" v-model="authorityCopy.email">
                </v-text-field>
              </v-col>
              <v-col class="d-flex">
                <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-fax
                </v-icon>
                <div v-if="!editing">
                  <span v-if="authority.faxNumber" class="ml-n1">{{ formatPhoneNumber(authority.faxNumber) }}</span>
                  <a v-if="showEditLinks(authority.faxNumber)" class="editField" @click="toggleEdit">+Fax</a>
                </div>
                <v-text-field v-else id="faxNumberField" class="shrink py-0" @keypress="isNumber($event)" :rules="[rules.phoneNumber('Fax number must be valid')]" :maxlength="10" v-model="authorityCopy.faxNumber">
                </v-text-field>
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
                    <span v-if="!editing" class="ministryLine" style="color: black">{{ formatDate(authority.openedDate) || '-' }}</span>
                    <span v-else class="ministryLine" style="color: black">{{ formatDate(authorityCopy.openedDate) || '-' }}</span>
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
                    <span v-if="!editing" class="ministryLine" style="color: black">{{ formatDate(authority.closedDate) || '-'}}</span>
                    <span v-else class="ministryLine" style="color: black">{{ formatDate(authorityCopy.closedDate) || '-'}}</span>
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
                    <span v-if="!editing" class="ministryLine" style="color: black">{{ this.authority.type }}</span>
                    <v-select
                      v-else
                      id="authorityTypeSelect"
                      :items="this.authorityTypes"
                      item-text="label"
                      item-value="authorityTypeCode"
                      v-model="authorityCopy.authorityTypeCode"
                      dense
                      outlined
                      class="ministryLine mt-n1"
                      style="color: black">
                    </v-select>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="mt-6 d-flex justify-start">
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
              <v-col cols="3">
                <v-row>
                  <v-col>
                    <v-icon class="pb-1 mr-1" right >
                      mdi-email-outline
                    </v-icon>
                    <span>Mailing Address</span>
                  </v-col>
                </v-row>
                <v-row v-if="!editing" no-gutters>
                  <v-col v-if="hasMailingAddress()">
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
                        <v-text-field id="mailAddressLine1" required :rules="[rules.required()]" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].addressLine1">
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
                        <v-text-field id="mailAddressLine2" class="shrink mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].addressLine2">
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
                        <v-text-field id="mailAddressCity" required :rules="[rules.required()]" class="shrink mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].city">
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
              <v-col cols="3" v-if="showPhysicalAddress">
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
                                        <v-text-field id="physicalAddressLine1" required :rules="[rules.required()]" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine1">
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
                                        <v-text-field id="physicalAddressLine2" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine2">
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
                                        <v-text-field id="physicalAddressCity" required :rules="[rules.required()]" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].city">
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
                <v-row class="mt-6">
                  <v-col class="d-flex justify-start">
                    <h2>Ministry Notes</h2>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton id="addNewNoteButton" width="9em" icon="mdi-plus" icon-left text="New Note" v-if="canEditAuthorities()" @click.native="newNoteSheet = !newNoteSheet"></PrimaryButton>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="d-flex justify-start">
                    <v-timeline id="authorityNotesTimeline" dense v-if="authority.notes.length > 0">
                      <div v-for="(activity) in authority.notes"
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
                    <v-timeline id="authorityNotesTimeline" dense v-else>
                      <v-timeline-item right icon="mdi-message-bulleted" icon-color="#003366" large color="white" >
                        <v-card width="40em">
                          <v-card-text class="activityContent">No notes have been recorded for this authority</v-card-text>
                        </v-card>
                      </v-timeline-item>
                    </v-timeline>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
      </v-row>

      <v-bottom-sheet
        v-model="newNoteSheet"
        inset
        no-click-animation
        scrollable
        persistent
        width="30%"
      >
        <v-card
          v-if="newNoteSheet"
          id="newNoteSheet"
          class="information-window-v-card">
          <v-card-title class="sheetHeader pt-1 pb-1">New Note</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row>
              <v-col>
                <v-textarea
                  id="newNoteTextArea"
                  v-model="newNoteText"
                  rows="8"
                  label="Note"
                  autofocus
                  no-resize
                  maxlength="4000"
                  class="pt-0"
                  ref="newNoteTextArea"
                  hide-details="auto">
                </v-textarea>
              </v-col>
            </v-row>
            <v-row class="py-4 pr-2 justify-end">
              <PrimaryButton id="cancelNote" secondary text="Cancel" class="mr-2" @click.native="newNoteSheet = !newNoteSheet"></PrimaryButton>
              <PrimaryButton id="saveNote" text="Save" width="7rem" :loading="loading" @click.native="saveNewAuthorityNote" :disabled="newNoteText === ''"></PrimaryButton>
            </v-row>
          </v-card-text>
        </v-card>
      </v-bottom-sheet>
    </v-container>
    <v-dialog
        v-model="openAuthorityStatusEditCard"
        inset
        no-click-animation
        scrollable
        persistent
        max-width="40%"
    >
      <AuthorityStatus v-if="openAuthorityStatusEditCard"  @updateAuthorityDates="handleUpdatesToAuthorityStatus"
                    @authorityStatus:closeEditAuthorityStatusPage="openAuthorityStatusEditCard = !openAuthorityStatusEditCard"
                    :authority-open-date="authorityCopy.openedDate" :authority-close-date="authorityCopy.closedDate" :authority-status="authorityCopy.status" :authority-has-open-schools="authorityHasOpenSchools" :date-of-last-school-closure="closedDateOfLastClosingSchool" :listOfOpenSchools="listOfOpenSchools" :listOfClosingSchools="listOfClosingSchools"></AuthorityStatus>
    </v-dialog>
  </v-form>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '@/utils/institute/status';
import {mapGetters, mapState} from 'vuex';
import router from '@/router';
import {deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';
import AuthorityStatus from '@/components/institute/AuthorityStatus.vue';
import {isEmpty, omitBy} from 'lodash';

export default {
  name: 'AuthorityDetailsPage',
  mixins: [alertMixin],
  components: {
    AuthorityStatus,
    PrimaryButton
  },
  props: {
    authorityID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      sameAsMailingCheckbox: true,
      editing: false,
      newNoteSheet: false,
      newNoteText: '',
      authority: null,
      authorityFormValid: false,
      authorityCopy: null,
      loading: false,
      openAuthorityStatusEditCard: false,
      authorityHasOpenSchools: false,
      closedDateOfLastClosingSchool: null,
      rules: Rules,
      authorityTypes: [],
      provinceCodeValues: [],
      countryCodeValues: [],
      listOfOpenSchools: [],
      listOfClosingSchools: [],
      excludeShowingPhysicalAddressesForAuthoritiesOfType: [
        'OFFSHORE',
      ],
    };
  },
  computed:{
    ...mapState('institute', ['authorityTypeCodes', 'provinceCodes', 'countryCodes']),
    ...mapGetters('auth', ['INDEPENDENT_AUTHORITY_ADMIN_ROLE']),
    hasSamePhysicalAddress() {
      return !this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    showPhysicalAddress() {
      if (this.editing) {
        return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.authorityCopy.authorityTypeCode);
      }
      return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.authority.authorityTypeCode);
    }
  },
  created() {
    this.$store.dispatch('institute/getAllProvinceCodes').then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    this.$store.dispatch('institute/getAllCountryCodes').then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    this.$store.dispatch('institute/getAllAuthorityTypeCodes').then(() => {
      this.authorityTypes = this.authorityTypeCodes;
    });
    this.getAuthority();
    this.determineIfAuthorityHasAnyOpenSchools();
    this.findClosedDateOfLastClosingSchool();
  },
  methods: {
    formatPhoneNumber,
    formatDate,
    getStatusColorAuthorityOrSchool,
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      authority.type = this.getAuthorityType(authority);
    },
    isNumber: function(evt) {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    saveNewAuthorityNote() {
      this.loading = true;
      const payload = {
        authorityID: this.authorityID,
        noteContent: this.newNoteText
      };
      ApiService.apiAxios.post(`${Routes.institute.AUTHORITY_NOTE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the authority.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the authority note. Please try again later.');
        })
        .finally(() => {
          this.getAuthority();
          this.newNoteSheet = false;
          this.newNoteText = '';
        });
    },
    getAuthority() {
      this.loading = true;

      ApiService.apiAxios.get(Routes.institute.AUTHORITY_DATA_URL + '/' + this.authorityID, {
      }).then(response => {
        this.authority = response.data;
        this.populateExtraAuthorityFields(this.authority);
        this.sortNotes();
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.setHasSamePhysicalFlag();
        this.loading = false;
      });
    },
    determineIfAuthorityHasAnyOpenSchools() {
      this.loading = true;
      ApiService.apiAxios.get(Routes.institute.SCHOOL_PAGINATED_DATA_URL, {
        params: {
          pageNumber: 0,
          pageSize: 100,
          searchParams: omitBy({
            status: 'isOpenOrOpening',
            authorityID: this.authorityID,
          }, isEmpty),
        }
      }).then(response => {
        this.listOfOpenSchools = response.data.content;
        this.authorityHasOpenSchools = response.data.content.length > 0;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to determine if the authority has any open schools. Please try again later.');
      }).finally(() => {
        this.loading = false;
      });
    },
    findClosedDateOfLastClosingSchool() {
      this.loading = true;
      ApiService.apiAxios.get(Routes.institute.SCHOOL_PAGINATED_DATA_URL, {
        params: {
          pageNumber: 0,
          pageSize: 100,
          sort: {
            closedDate: 'DESC'
          },
          searchParams: omitBy({
            authorityID: this.authorityID,
            status: 'Closing'
          }, isEmpty),
        }
      }).then(response => {
        this.listOfClosingSchools = response.data.content;
        this.closedDateOfLastClosingSchool = response.data.content[0] ? response.data.content[0].closedDate.substring(0, 10) : null;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to find the closed date of the last closing school. Please try again later.');
      }).finally(() => {
        this.loading = false;
      });
    },
    sortNotes(){
      this.authority.notes = this.authority.notes.sort(function(a, b) {
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
    backButtonClick() {
      router.push({name: 'instituteAuthoritiesList'});
    },
    deepCloneObject,
    addAddressesIfRequired(authority){
      let addresses = authority.addresses;
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
    canEditAuthorities(){
      return this.INDEPENDENT_AUTHORITY_ADMIN_ROLE;
    },
    setHasSamePhysicalFlag(){
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async clickSameAsAddressButton(){
      await this.$nextTick();
      this.$refs.authorityForm.validate();
    },
    showEditLinks(fieldValue) {
      return this.canEditAuthorities() && !fieldValue;
    },
    saveAuthority() {
      this.loading = true;

      if(this.sameAsMailingCheckbox){
        this.authorityCopy.addresses = this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }

      const payload = this.authorityCopy;
      ApiService.apiAxios.post(`${Routes.institute.AUTHORITY_DATA_URL}` + '/' + this.authorityCopy.independentAuthorityId, payload)
        .then(() => {
          this.setSuccessAlert('Success! The authority details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the authority information. Please try again later.');
        })
        .finally(() => {
          this.toggleEdit();
          this.getAuthority();
        });
    },
    async toggleEdit(){
      this.authorityCopy = this.deepCloneObject(this.authority);
      this.addAddressesIfRequired(this.authorityCopy);
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.authorityForm.validate();
    },
    getAuthorityType(authority){
      return this.authorityTypes.find((autorityType) => autorityType.authorityTypeCode === authority.authorityTypeCode).label;
    },
    hasMailingAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    getMailingAddressCopy(){
      return this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy(){
      return this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
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
    },
    openAuthorityStatusEdit(){
      this.openAuthorityStatusEditCard = true;
    },
    async handleUpdatesToAuthorityStatus(updatedDatesForAuthority){
      await this.$nextTick();
      if (updatedDatesForAuthority.openedDate) {
        this.authorityCopy.openedDate = updatedDatesForAuthority.openedDate?.replaceAll('/','-').concat('T00:00:00');
      } else {
        this.authorityCopy.openedDate = null;
      }
      if (updatedDatesForAuthority.closedDate) {
        this.authorityCopy.closedDate = updatedDatesForAuthority.closedDate?.replaceAll('/','-').concat('T00:00:00');
      } else {
        this.authorityCopy.closedDate = null;
      }
      this.authorityCopy.status = getStatusAuthorityOrSchool(this.authorityCopy);
      this.$refs.authorityForm.validate();
    }
  }
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: medium;
}

.activityContent {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  font-size: medium;
}

.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
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
