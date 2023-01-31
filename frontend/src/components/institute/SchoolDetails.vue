<template>
  <v-form ref="schoolDetailsForm" v-model="schoolDetailsFormValid">
  <v-container class="containerSetup" fluid>
      <v-col class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="backButtonClick">Return to School List</a>
      </v-col>
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
        <v-row class="d-flex justify-start">
            <v-col v-if="!editing" cols="6" class="d-flex justify-start">
              <h2 class="subjectHeading">{{ school.mincode }} - {{ school.displayName }}</h2>
            </v-col>
            <v-col class="d-flex" v-else>
              <h2 id="schoolMincode">{{ school.mincode }} - </h2>
              <v-text-field class="mt-n5 ml-3" style="font-size: x-large" :maxlength="255" :rules="[rules.required()]" required v-model="schoolDetailsCopy.displayName">
              </v-text-field>
            </v-col>
            <v-col v-if="!editing" cols="6" class="d-flex justify-end">
              <PrimaryButton id="viewSchoolContactsButton" class="mr-2" secondary icon-left
                             icon="mdi-account-multiple-outline" :to="`/schoolContacts/${schoolID}`"
                             text="View School Contacts"></PrimaryButton>
              <PrimaryButton id="viewHistoryButton" class="mr-2" secondary icon-left
                             icon="mdi-history" @click.native="openHistory"
                             text="Show History"></PrimaryButton>
              <PrimaryButton id="schoolDetailsEditButton" icon-left width="6em" icon="mdi-pencil" text="Edit"
                             v-if="canEditSchoolDetails()" @click.native="toggleEdit"></PrimaryButton>
            </v-col>
            <v-col v-else cols="6" class="d-flex justify-end">
              <PrimaryButton class="mr-2" secondary id="cancelButton" icon-left width="6em" text="Cancel"
                             @click.native="cancelClicked"></PrimaryButton>
              <PrimaryButton id="saveButton" icon-left width="6em" text="Save" :disabled="!schoolDetailsFormValid"
                             @click.native="updateSchoolDetails"></PrimaryButton>
            </v-col>
          </v-row>
          <v-row v-if="school.schoolCategoryCode !== 'INDEPEND'" class="d-flex justify-start">
              <v-col class="d-flex">
                <div class="ministryOwnershipTeamName"  style="color: black">{{district.districtNumber}} - {{district.name}}</div>
              </v-col>
            </v-row>
            <v-row v-else class="d-flex justify-start">
              <v-col class="d-flex">
                <div class="ministryOwnershipTeamName"  style="color: black">{{authority.authorityNumber}} - {{authority.displayName}}</div>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-start">
              <v-col v-if="!editing" class="d-flex">
                <v-icon class="ml-n1 pr-3" :color="getStatusColorAuthorityOrSchool(school.status)" dark>
                  mdi-circle-medium
                </v-icon>
                <span>{{ school.status }}</span>
              </v-col>
              <v-col v-else class="d-flex justify-start pt-6">
                <PrimaryButton id="editSchoolStatusButton" @click.native="openSchoolStatusEdit" :secondary="true" >
                <v-icon class="ml-n1 pr-3" :color="getStatusColorAuthorityOrSchool(schoolDetailsCopy.status)" dark>
                  mdi-circle-medium
                </v-icon>
                <span>{{ schoolDetailsCopy.status }}</span>
                </PrimaryButton>
              </v-col>
              <v-col class="d-flex">
                <v-icon aria-hidden="false" class="mb-1 mr-1">
                  mdi-phone-outline
                </v-icon>
                <div v-if="!editing">
                  <span v-if="school.phoneNumber" class="ml-n1">{{ formatPhoneNumber(school.phoneNumber) }}</span>
                  <a v-if="showEditLinks(school.phoneNumber)" class="editField" @click="toggleEdit">+phone</a>
                </div>
                <v-text-field id="schoolDetailsPhoneNumber" v-else class="shrink py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="[rules.required(), rules.phoneNumber()]" v-model="schoolDetailsCopy.phoneNumber"/>
              </v-col>
              <v-col class="d-flex">
                <v-icon aria-hidden="false" class="mb-1 mr-1">
                  mdi-at
                </v-icon>
                <div v-if="!editing">
                  <span v-if="school.email" class="ml-n1">{{ school.email }}</span>
                  <a v-if="showEditLinks(school.email)" class="editField" @click="toggleEdit">+email</a>
                </div>
                <v-text-field id="schoolDetailsEmail" v-else class="py-0" required :rules="[rules.required(), rules.email()]" :maxlength="255" v-model="schoolDetailsCopy.email"/>
              </v-col>
              <v-col class="d-flex">
                <v-icon aria-hidden="false" class="mb-1 mr-1">
                  mdi-fax
                </v-icon>
                <div v-if="!editing">
                  <span v-if="school.faxNumber" class="ml-n1">{{ formatPhoneNumber(school.faxNumber) }}</span>
                  <a v-if="showEditLinks(school.faxNumber)" class="editField" @click="toggleEdit">+fax</a>
                </div>
                <v-text-field id="schoolDetailsFaxNumber" v-else class="shrink py-0" @keypress="isNumber($event)" :rules="[rules.phoneNumber('Fax number must be valid')]" :maxlength="10" v-model="schoolDetailsCopy.faxNumber"/>
              </v-col>
              <v-col class="d-flex">
                <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-web
                </v-icon>
                <div v-if="!editing">
                  <a v-if="cleanWebsiteUrl" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
                  <a v-if="showEditLinks(cleanWebsiteUrl)" class="editField" @click="toggleEdit">+website</a>
                </div>
                <v-text-field v-if="editing" class="py-0" :rules="[rules.website()]" :maxlength="255" v-model="schoolDetailsCopy.website"/>
              </v-col>
            </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="12" class="d-flex justify-start">
            <h2 class="subjectHeading pt-4">School Details</h2>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">Open Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span v-if="!editing" class="ministryLine" style="color: black">{{ formatDate(school.openedDate) || '-' }}</span>
                <span v-else class="ministryLine" style="color: black">{{ formatDate(schoolDetailsCopy.openedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">Close Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span v-if="!editing" class="ministryLine" style="color: black">{{ formatDate(school.closedDate) || '-' }}</span>
                <span v-else class="ministryLine" style="color: black">{{ formatDate(schoolDetailsCopy.closedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">School Category</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span v-if="!editing" class="ministryLine" style="color: black">{{ school.schoolCategory }}</span>
                <v-select v-else :items="activeSchoolCategoryTypes"
                          item-value="schoolCategoryCode"
                          item-text="label"
                          v-model="schoolDetailsCopy.schoolCategoryCode"
                          single
                          required
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">Facility Type</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span v-if="!editing" class="ministryLine" style="color: black">{{school.facilityType}}</span>
                <v-select v-else :items="allowedFacilityTypeCodesForSchoolCategoryCode"
                          item-value="facilityTypeCode"
                          item-text="label"
                          v-model="schoolDetailsCopy.facilityTypeCode"
                          single
                          required
                          :rules="[rules.required()]"
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">Grades Offered</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span v-if="!editing" class="ministryLine" style="color: black">{{ getGradesOffered(school.grades) }}</span>
                <v-select v-else :items="gradeCodes"
                          item-value="schoolGradeCode"
                          item-text="label"
                          v-model="schoolDetailsCopy.grades"
                          @input="sortGrades"
                          return-object
                          multiple
                          required
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">School Organization</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span  v-if="!editing" class="ministryLine" style="color: black">{{ getSchoolOrganization(school) }}</span>
                <v-select v-else :items="schoolOrganizationTypeCodes"
                          item-value="schoolOrganizationCode"
                          item-text="label"
                          v-model="schoolDetailsCopy.schoolOrganizationCode"
                          single
                          required
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">NLC Activity</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pb-1 pr-0">
                <span v-if="!editing" class="ministryLine" style="color: black">{{ getNLCActivity(school) }}</span>
                <v-select v-else :items="schoolNeighborhoodLearningTypes"
                          item-value="neighborhoodLearningTypeCode"
                          item-text="label"
                          @input="sortNLC"
                          return-object
                          v-model="schoolDetailsCopy.neighborhoodLearning"
                          multiple
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="mt-6 d-flex justify-start">
          <v-col cols="12" class="d-flex justify-start">
            <h2 class="subjectHeading pt-4">Addresses</h2>
          </v-col>
        </v-row>
        <v-row v-if="!hasMailingAddress() && !editing" no-gutters class="d-flex justify-start">
          <v-col>
            <a class="editField" @click="toggleEdit">+ address</a>
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
          <v-col v-if="displayPhysicalAddress()" cols="3">
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
            <v-row>
              <v-col class="d-flex justify-start">
                <h2>Ministry Notes</h2>
              </v-col>
              <v-col class="d-flex justify-end">
                <PrimaryButton id="addNewNoteButton" width="9em" icon="mdi-plus" icon-left text="New Note"
                               v-if="canEditSchoolDetails()" @click.native="newNoteSheet = !newNoteSheet">
                </PrimaryButton>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="d-flex justify-start">
                <v-timeline id="schoolNotesTimeline" dense v-if="school.notes.length > 0">
                  <div v-for="(activity) in school.notes"
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
                <v-timeline id="schoolNotesTimeline" dense v-else>
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
            <PrimaryButton id="saveNote" text="Save" width="7rem" :loading="loading" @click.native="saveNewSchoolNote" :disabled="newNoteText === ''"></PrimaryButton>
          </v-row>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
    </v-col>
    </v-row>
  </v-container>
    <!--    new contact sheet -->
    <v-dialog
        v-model="openSchoolStatusEditCard"
        inset
        no-click-animation
        scrollable
        persistent
        max-width="30%"
    >
      <SchoolStatus v-if="openSchoolStatusEditCard"  @updateSchoolDates="handleUpdatesToSchoolStatus"
                    @schoolStatus:closeEditSchoolStatusPage="openSchoolStatusEditCard = !openSchoolStatusEditCard"
                    :school-open-date="schoolDetailsCopy.openedDate" :school-close-date="schoolDetailsCopy.closedDate" :school-status="schoolDetailsCopy.status" :isSchoolStatusUpdateAllowed="isSchoolStatusUpdateAllowed"></SchoolStatus>
    </v-dialog>
  </v-form>
</template>

<script>

import PrimaryButton from '../util/PrimaryButton';
import {mapGetters, mapState} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '@/utils/institute/status';
import router from '@/router';
import { sanitizeUrl } from '@braintree/sanitize-url';
import {deepCloneObject} from '@/utils/common';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import SchoolStatus from '@/components/institute/SchoolStatus';
import { sortBy } from 'lodash';

export default {
  name: 'SchoolDetailsPage',
  mixins: [alertMixin],
  components: {
    SchoolStatus,
    PrimaryButton
  },
  props: {
    schoolID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      independentArray: ['INDEPEND', 'INDP_FNS'],
      newNoteSheet: false,
      newNoteText: '',
      school: '',
      district: '',
      authority: '',
      cleanWebsiteUrl: '',
      schoolFacilityTypes: [],
      activeSchoolCategoryTypes: [],
      schoolCategoryTypes:[],
      schoolOrganizationTypes: [],
      schoolNeighborhoodLearningTypes: [],
      schoolGradeTypes: [],
      loading: true,
      schoolDetailsFormValid:true,
      editing: false,
      schoolDetailsCopy: {},
      sameAsMailingCheckbox: true,
      provinceCodeValues: [],
      countryCodeValues: [],
      rules: Rules,
      openSchoolStatusEditCard: false,
      isSchoolStatusUpdateAllowed: true
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo','SCHOOL_ADMIN_ROLE','SCHOOL_INDEPENDENT_ADMIN_ROLE']),
    ...mapState('institute', ['facilityTypeCodes']),
    ...mapState('institute', ['schoolCategoryTypeCodes']),
    ...mapState('institute', ['activeSchoolCategoryTypeCodes']),
    ...mapState('institute', ['schoolOrganizationTypeCodes']),
    ...mapState('institute', ['schoolNeighborhoodLearningCodes']),
    ...mapState('institute', ['gradeCodes']),
    ...mapState('institute', ['provinceCodes']),
    ...mapState('institute', ['countryCodes']),
    ...mapState('institute', ['schoolCategoryFacilityTypesMap']),
    dataReady: function () {
      return this.userInfo;
    },
    hasSamePhysicalAddress(){
      return !this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    isOffshoreSchool(){
      return this.school.schoolCategoryCode === 'OFFSHORE';
    },
    allowedFacilityTypeCodesForSchoolCategoryCode(){
      if(this.schoolDetailsCopy?.schoolCategoryCode) {
        let resultingFacilityTypes = this.schoolCategoryFacilityTypesMap[this.schoolDetailsCopy?.schoolCategoryCode]?.map(schoolCatFacilityTypeCode => this.facilityTypeCodes.find(facTypCode => facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));

        if (resultingFacilityTypes !== undefined) {
          let result = Array.from(resultingFacilityTypes.values()).filter(facType => facType.facilityTypeCode === this.schoolDetailsCopy.facilityTypeCode);
          if(result.length === 0){
            this.resetSchoolDetailsCopyFacilityType();
          }
        }
        return  sortBy(  resultingFacilityTypes,['displayOrder']);
      }else {
        this.resetSchoolDetailsCopyFacilityType();
        return [];
      }
    },
  },
  created() {
    this.$store.dispatch('institute/getAllFacilityTypeCodes').then(() => {
      this.schoolFacilityTypes = sortBy(this.facilityTypeCodes,['displayOrder']);
    });
    this.$store.dispatch('institute/getAllActiveSchoolCategoryTypeCodes').then(() => {
      this.activeSchoolCategoryTypes = sortBy(this.activeSchoolCategoryTypeCodes,['displayOrder']);
    });
    this.$store.dispatch('institute/getAllSchoolCategoryTypeCodes').then(() => {
      this.schoolCategoryTypes = sortBy(this.schoolCategoryTypeCodes,['displayOrder']);
    });
    this.$store.dispatch('institute/getAllSchoolOrganizationTypeCodes').then(() => {
      this.schoolOrganizationTypes = this.schoolOrganizationTypeCodes;
    });
    this.$store.dispatch('institute/getAllSchoolNeighborhoodLearningCodes').then(() => {
      this.schoolNeighborhoodLearningTypes = sortBy(this.schoolNeighborhoodLearningCodes,['neighborhoodLearningTypeCode']);
    });
    this.$store.dispatch('institute/getAllGradeCodes').then(() => {
      this.schoolGradeTypes = sortBy(this.gradeCodes,['displayOrder']);
    });
    this.$store.dispatch('institute/getAllProvinceCodes').then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    this.$store.dispatch('institute/getAllCountryCodes').then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    this.$store.dispatch('institute/getSchoolCategoryFacilityTypesMap');
    this.getThisSchoolsDetails();
  },
  methods: {
    isOffshoreSchoolSelected(){
      return this.schoolDetailsCopy?.schoolCategoryCode === 'OFFSHORE';
    },
    getThisSchoolsDetails(){
      this.loading = true;
      this.school = '';

      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.school = response.data;
          this.cleanWebsiteUrl = this.school.website ? sanitizeUrl(this.school.website) : '';
          this.populateExtraSchoolFields(this.school);
          this.getDistrictDetails(this.school.districtId);
          if(this.school.independentAuthorityId){
            this.getAuthorityDetails(this.school.independentAuthorityId);
          }
          this.sortNotes();
          this.setHasSamePhysicalFlag();
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    sortGrades() {
      const gradeList = [];
      for (const grade of this.schoolGradeTypes) {
        let schoolGradeType = this.schoolDetailsCopy.grades.find((rawGrade) => rawGrade.schoolGradeCode === grade.schoolGradeCode);
        if (schoolGradeType) {
          gradeList.push(schoolGradeType);
        }
      }
      this.schoolDetailsCopy.grades = gradeList;
    },
    sortNLC() {
      this.schoolDetailsCopy.neighborhoodLearning = sortBy(this.schoolDetailsCopy.neighborhoodLearning,['neighborhoodLearningTypeCode']);
    },
    sortNotes(){
      this.school.notes = this.school.notes.sort(function(a, b) {
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
    saveNewSchoolNote() {
      this.loading = true;
      const payload = {
        schoolID: this.schoolID,
        noteContent: this.newNoteText
      };
      ApiService.apiAxios.post(`${Routes.institute.SCHOOL_NOTE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the school.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the school note. Please try again later.');
        })
        .finally(() => {
          this.getThisSchoolsDetails();
          this.newNoteSheet = false;
          this.newNoteText = '';
        });
    },
    getDistrictDetails(districtId){
      this.district = '';
      ApiService.apiAxios.get(`${Routes.cache.DISTRICT_DATA_URL}/${districtId}`)
        .then(response => {
          this.district = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getAuthorityDetails(authorityId){
      this.authority = '';
      ApiService.apiAxios.get(`${Routes.institute.AUTHORITY_DATA_URL}/${authorityId}`)
        .then(response => {
          this.authority = response.data;
          this.populateExtraAuthorityFields(this.authority);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      if(authority.status === 'Closed' || authority.status === 'Closing') {
        this.isSchoolStatusUpdateAllowed = false;
      }
    },
    populateExtraSchoolFields(school){
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
    },
    getMailingAddressItem(item){
      let mailingAddress = this.school.addresses?.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    },
    getGradesOffered(rawGrades) {
      let gradeList = [];

      for (const grade of this.schoolGradeTypes) {
        let schoolGradeType = rawGrades.find((rawGrade) => rawGrade.schoolGradeCode === grade.schoolGradeCode);
        if (schoolGradeType) {
          gradeList.push(grade.label.replaceAll('Grade ', ''));
        }
      }

      return gradeList.toString().replace(/,/g, ', ');
    },
    getSchoolOrganization(school) {
      return this.schoolOrganizationTypes.find((facility) => facility.schoolOrganizationCode === school.schoolOrganizationCode)?.label;
    },
    getNLCActivity(school) {
      let nLCActivityList = [];
      for (const nl of this.schoolNeighborhoodLearningTypes) {
        let schoolNeighborhoodLearningType = school.neighborhoodLearning.find((facility) => facility.neighborhoodLearningTypeCode === nl.neighborhoodLearningTypeCode);
        if (schoolNeighborhoodLearningType) {
          nLCActivityList.push(nl.label);
        }
      }
      nLCActivityList.sort();
      return nLCActivityList.toString().replace(/,/g, ', ');
    },
    getFacilityType(school) {
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode)?.label;
    },
    getSchoolCategory(school) {
      return this.schoolCategoryTypes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode)?.label;
    },
    getStatusColorAuthorityOrSchool,
    formatDate,
    formatPhoneNumber,
    deepCloneObject,
    isNumber,
    backButtonClick() {
      router.push({name: 'instituteSchoolList'});
    },
    openHistory() {
      router.push({name: 'schoolHistory', params: {schoolID: this.schoolID}});
    },
    async toggleEdit(){
      this.schoolDetailsCopy = this.deepCloneObject(this.school);
      this.addAddressesIfRequired(this.schoolDetailsCopy);
      this.sortGrades();
      this.sortNLC();
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    showEditLinks(fieldValue) {
      return this.canEditSchoolDetails() && !fieldValue;
    },
    cancelClicked(){
      this.editing = false;
      this.setHasSamePhysicalFlag();
    },
    setHasSamePhysicalFlag(){
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async updateSchoolDetails() {
      this.loading = true;

      if(this.sameAsMailingCheckbox){
        this.schoolDetailsCopy.addresses = this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }
      ApiService.apiAxios.put(`${Routes.institute.SCHOOL_DATA_URL}` + '/' + this.schoolDetailsCopy.schoolId, this.schoolDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The school details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the school information. Please try again later.');
        })
        .finally(() => {
          this.toggleEdit();
          this.getThisSchoolsDetails();
        });
    },
    hasMailingAddress(){
      return this.school.addresses?.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress(){
      return this.school.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressCopy(){
      return this.schoolDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy(){
      return this.schoolDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    addAddressesIfRequired(school){
      let addresses = school.addresses;
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
    canEditSchoolDetails(){
      if(this.school.schoolCategoryCode && this.independentArray.includes(this.school.schoolCategoryCode)){
        return this.SCHOOL_INDEPENDENT_ADMIN_ROLE || this.SCHOOL_ADMIN_ROLE;
      }
      return this.SCHOOL_ADMIN_ROLE;
    },
    async clickSameAsAddressButton(){
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    displayPhysicalAddress(){
      return (this.editing && !this.isOffshoreSchoolSelected()) || (!this.editing && !this.isOffshoreSchool);
    },
    async handleUpdatesToSchoolStatus(updatedDatesForSchool){
      await this.$nextTick();
      if(updatedDatesForSchool.openedDate){
        this.schoolDetailsCopy.openedDate = updatedDatesForSchool.openedDate?.replaceAll('/','-').concat('T00:00:00');
      }else{
        this.schoolDetailsCopy.openedDate = null;
      }
      if(updatedDatesForSchool.closedDate){
        this.schoolDetailsCopy.closedDate = updatedDatesForSchool.closedDate?.replaceAll('/','-').concat('T00:00:00');
      }else{
        this.schoolDetailsCopy.closedDate = null;
      }

      this.schoolDetailsCopy.status = getStatusAuthorityOrSchool(this.schoolDetailsCopy);
      this.$refs.schoolDetailsForm.validate();
    },
    openSchoolStatusEdit(){
      this.openSchoolStatusEditCard = true;
    },
    resetSchoolDetailsCopyFacilityType(){
      this.schoolDetailsCopy.facilityType = null;
      this.schoolDetailsCopy.facilityTypeCode = null;
    },
  },
};
</script>

<style scoped>

.fontItalic{
  font-style: italic;
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

.divider {
  border-color: #FCBA19;
  border-width: unset;
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

.v-dialog__content /deep/ .v-bottom-sheet {
  width: 30% !important;
}
@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
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
