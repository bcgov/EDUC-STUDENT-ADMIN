<template>
  <v-form
    ref="districtDetailsForm"
    v-model="districtDetailsFormValid"
  >
    <v-container
      class="containerSetup"
      fluid
    >
      <v-row>
        <v-col class="mt-1 mb-4 d-flex justify-start">
          <v-icon
            small
            color="#1976d2"
          >
            mdi-arrow-left
          </v-icon>
          <a
            class="ml-1"
            @click="backButtonClick"
          >Return to District List</a>
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
          />
        </v-col>
      </v-row>
      <v-row
        v-else
        no-gutters
      >
        <v-col>
          <v-row class="d-flex justify-start">
            <v-col
              v-if="!editing"
              cols="6"
              class="d-flex justify-start"
            >
              <h2 id="districtName">
                {{
                  district.districtNumber
                }} - {{
                  district.displayName
                }}
              </h2>
            </v-col>
            <v-col
              v-else
              class="d-flex"
            >
              <h2 id="districtNumber">
                {{
                  district.districtNumber
                }} -
              </h2>
              <v-text-field
                v-model="districtDetailsCopy.displayName"
                class="mt-n5 ml-3"
                style="font-size: x-large"
                :maxlength="255"
                :rules="[rules.required(), rules.noSpecialCharactersSchDisAuthName()]"
                required
                variant="underlined"
              />
            </v-col>
            <v-col
              v-if="!editing"
              cols="6"
              class="d-flex justify-end"
            >
              <PrimaryButton
                id="viewDistrictContactsButton"
                class="mr-2"
                secondary
                icon-left
                icon="mdi-account-multiple-outline"
                :to="`/institute/districtContacts/${districtID}`"
                text="View District Contacts"
              />
              <PrimaryButton
                v-if="canEditDistrictDetails()"
                id="districtDetailsEditButton"
                icon-left
                width="6em"
                icon="mdi-pencil"
                text="Edit"
                :click-action="toggleEdit"
              />
            </v-col>
            <v-col
              v-else
              cols="6"
              class="d-flex justify-end"
            >
              <PrimaryButton
                id="cancelButton"
                class="mr-2"
                secondary
                icon-left
                width="6em"
                text="Cancel"
                :click-action="cancelClicked"
              />
              <PrimaryButton
                id="saveButton"
                icon-left
                width="6em"
                text="Save"
                :disabled="!districtDetailsFormValid"
                :click-action="updateDistrictDetails"
              />
            </v-col>
          </v-row>
          <v-row cols="1">
            <v-col
              lg="2"
              sm="4"
              class="mt-1"
            >
              <v-icon
                class="pb-1"
                :color="getStatusColor()"
                right
                dark
              >
                mdi-circle-medium
              </v-icon>
              <span>{{
                getStatusText()
              }}</span>
            </v-col>
            <v-col
              cols="2"
              class="pt-0 pb-0"
            >
              <div
                v-if="!editing"
                class="mt-4"
              >
                <v-icon
                  class="mb-1 mr-1"
                  :class="showEditLinks(district.phoneNumber) ? 'mt-n2' : ''"
                >
                  mdi-phone-outline
                </v-icon>
                <span
                  v-if="district.phoneNumber"
                  class="ml-n1"
                >{{
                  formatPhoneNumber(district.phoneNumber)
                }}</span>
                <a
                  v-if="showEditLinks(district.phoneNumber)"
                  class="editField"
                  @click="toggleEdit"
                >+Phone</a>
              </div>
              <v-text-field
                v-else
                id="districtDetailsPhoneNumber"
                v-model="districtDetailsCopy.phoneNumber"
                prepend-inner-icon="mdi-phone-outline"
                class="shrink py-0"
                required
                :maxlength="10"
                variant="underlined"
                :rules="[rules.required(), rules.phoneNumber()]"
                @keypress="isNumber($event)"
              />
            </v-col>
            <v-col
              cols="2"
              class="pt-0 pb-0"
            >
              <div
                v-if="!editing"
                class="mt-4"
              >
                <v-icon
                  class="mb-1 mr-1"
                  :class="showEditLinks(district.faxNumber) ? 'mt-n2' : ''"
                >
                  mdi-fax
                </v-icon>
                <span
                  v-if="district.faxNumber"
                  class="ml-n1"
                >{{
                  formatPhoneNumber(district.faxNumber)
                }}</span>
                <a
                  v-if="showEditLinks(district.faxNumber)"
                  class="editField"
                  @click="toggleEdit"
                >+Fax</a>
              </div>
              <v-text-field
                v-else
                id="districtDetailsFaxNumber"
                v-model="districtDetailsCopy.faxNumber"
                prepend-inner-icon="mdi-fax"
                class="shrink py-0"
                variant="underlined"
                :rules="[rules.phoneNumber('Fax number must be valid')]"
                :maxlength="10"
                @keypress="isNumber($event)"
              />
            </v-col>
            <v-col
              cols="3"
              class="pt-0 pb-0"
            >
              <div
                v-if="!editing"
                class="mt-4"
              >
                <v-icon
                  class="mb-1 mr-1"
                  :class="showEditLinks(district.email) ? 'mt-n2' : ''"
                >
                  mdi-at
                </v-icon>
                <span
                  v-if="district.email"
                  style="word-break: break-all;"
                  class="ml-n1"
                >{{
                  district.email
                }}</span>
                <a
                  v-if="showEditLinks(district.email)"
                  class="editField"
                  @click="toggleEdit"
                >+Email</a>
              </div>
              <v-text-field
                v-else
                id="districtDetailsEmail"
                v-model="districtDetailsCopy.email"
                class="py-0"
                prepend-inner-icon="mdi-at"
                required
                variant="underlined"
                :rules="[rules.email()]"
                :maxlength="255"
              />
            </v-col>
            <v-col
              cols="3"
              class="pt-0 pb-0"
            >
              <div
                v-if="!editing"
                class="mt-4"
              >
                <v-icon
                  class="mb-1 mr-1"
                  :class="showEditLinks(cleanWebsiteUrl) ? 'mt-n2' : ''"
                >
                  mdi-web
                </v-icon>
                <a
                  v-if="cleanWebsiteUrl"
                  style="word-break: break-all;"
                  :href="cleanWebsiteUrl"
                  target="_blank"
                >{{
                  cleanWebsiteUrl
                }}</a>
                <a
                  v-if="showEditLinks(cleanWebsiteUrl)"
                  class="editField"
                  @click="toggleEdit"
                >+Website</a>
              </div>
              <v-text-field
                v-if="editing"
                v-model="districtDetailsCopy.website"
                prepend-inner-icon="mdi-web"
                class="py-0"
                :rules="[rules.website()]"
                variant="underlined"
                :maxlength="255"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-divider class="divider" />
            </v-col>
          </v-row>
          <v-row class="d-flex mb-2 justify-start">
            <v-col
              cols="12"
              class="d-flex justify-start"
            >
              <h2>Addresses</h2>
            </v-col>
          </v-row>
          <v-row
            v-if="!hasMailingAddress() && !editing"
            no-gutters
            class="d-flex justify-start"
          >
            <v-col>
              <a
                class="editField"
                @click="toggleEdit"
              >+Address</a>
            </v-col>
          </v-row>
          <v-row
            v-else
            no-gutters
            class="d-flex justify-start"
          >
            <v-col
              v-if="editing || hasMailingAddress()"
              cols="3"
            >
              <v-row>
                <v-col>
                  <v-icon
                    class="pb-1 mr-1"
                    right
                  >
                    mdi-email-outline
                  </v-icon>
                  <span>Mailing Address</span>
                </v-col>
              </v-row>
              <v-row
                v-if="!editing"
                no-gutters
              >
                <v-col>
                  <v-row
                    class="ml-9"
                    no-gutters
                  >
                    <v-col>
                      <span style="word-break: break-all;">{{
                        getMailingAddressItem('addressLine1')
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{
                        getMailingAddressItem('addressLine2')
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{
                        getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode') + ', ' + getMailingAddressItem('countryCode')
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{
                        getMailingAddressItem('postal')
                      }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row
                v-else
                no-gutters
              >
                <v-col>
                  <v-row
                    class="ml-9"
                    no-gutters
                  >
                    <v-col cols="8">
                      <v-text-field
                        id="mailAddressLine1"
                        v-model="getMailingAddressCopy()[0].addressLine1"
                        required
                        label="Line 1"
                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        variant="underlined"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-9"
                    no-gutters
                  >
                    <v-col cols="8">
                      <v-text-field
                        id="mailAddressLine2"
                        v-model="getMailingAddressCopy()[0].addressLine2"
                        label="Line 2"
                        :rules="[rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        variant="underlined"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-9"
                    no-gutters
                  >
                    <v-col cols="8">
                      <v-text-field
                        id="mailAddressCity"
                        v-model="getMailingAddressCopy()[0].city"
                        required
                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        variant="underlined"
                        label="City"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-9"
                    no-gutters
                  >
                    <v-col
                      cols="8"
                      class="d-flex"
                    >
                      <v-select
                        id="mailAddressProvince"
                        v-model="getMailingAddressCopy()[0].provinceCode"
                        :items="provinceCodeValues"
                        item-title="label"
                        item-value="provinceCode"
                        variant="underlined"
                        dense
                        :rules="[rules.required()]"
                        required
                        label="Province"
                        style="color: black"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-9"
                    no-gutters
                  >
                    <v-col
                      cols="8"
                      class="d-flex"
                    >
                      <v-select
                        id="mailAddressCountry"
                        v-model="getMailingAddressCopy()[0].countryCode"
                        :items="countryCodeValues"
                        item-title="label"
                        item-value="countryCode"
                        variant="underlined"
                        :rules="[rules.required()]"
                        dense
                        label="Country"
                        style="color: black"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-9"
                    no-gutters
                  >
                    <v-col cols="8">
                      <v-text-field
                        id="mailAddressPostal"
                        v-model="getMailingAddressCopy()[0].postal"
                        :maxlength="6"
                        required
                        :rules="[rules.required(), rules.postalCode()]"
                        label="Postal Code"
                        variant="underlined"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="3">
              <v-row>
                <v-col>
                  <v-icon
                    class="pb-1 mr-1"
                    right
                  >
                    mdi-home-outline
                  </v-icon>
                  <span>Physical Address</span>
                </v-col>
              </v-row>
              <v-row
                v-if="!hasSamePhysicalAddress && !editing"
                no-gutters
              >
                <v-col>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{
                        getPhysicalAddressItem('addressLine1')
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{
                        getPhysicalAddressItem('addressLine2')
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{
                        getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode') + ', ' + getPhysicalAddressItem('countryCode')
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{
                        getPhysicalAddressItem('postal')
                      }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row
                v-else
                no-gutters
              >
                <v-col>
                  <v-row
                    class="ml-9"
                    no-gutters
                  >
                    <v-col
                      v-if="sameAsMailingCheckbox && !editing"
                      class="fontItalic"
                    >
                      <span>Same as Mailing Address</span>
                    </v-col>
                    <v-col v-else>
                      <v-row no-gutters>
                        <v-col>
                          <v-row no-gutters>
                            <v-col>
                              <v-row
                                v-if="!sameAsMailingCheckbox"
                                no-gutters
                              >
                                <v-col>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field
                                        id="physicalAddressLine1"
                                        v-model="getPhysicalAddressCopy()[0].addressLine1"
                                        required
                                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        variant="underlined"
                                        label="Line 1"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field
                                        id="physicalAddressLine2"
                                        v-model="getPhysicalAddressCopy()[0].addressLine2"
                                        :rules="[rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        variant="underlined"
                                        label="Line 2"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field
                                        id="physicalAddressCity"
                                        v-model="getPhysicalAddressCopy()[0].city"
                                        required
                                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        variant="underlined"
                                        label="City"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressProvince"
                                        v-model="getPhysicalAddressCopy()[0].provinceCode"
                                        :items="provinceCodeValues"
                                        item-title="label"
                                        item-value="provinceCode"
                                        dense
                                        required
                                        :rules="[rules.required()]"
                                        variant="underlined"
                                        label="Province"
                                        style="color: black"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressCountry"
                                        v-model="getPhysicalAddressCopy()[0].countryCode"
                                        :items="countryCodeValues"
                                        item-title="label"
                                        item-value="countryCode"
                                        dense
                                        :rules="[rules.required()]"
                                        required
                                        variant="underlined"
                                        label="Country"
                                        style="color: black"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field
                                        id="physicalAddressPostal"
                                        v-model="getPhysicalAddressCopy()[0].postal"
                                        required
                                        :rules="[rules.required(), rules.postalCode()]"
                                        :maxlength="6"
                                        label="Postal Code"
                                        variant="underlined"
                                      />
                                    </v-col>
                                  </v-row>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col>
                                  <v-checkbox
                                    id="sameAsMailingCheckbox"
                                    v-model="sameAsMailingCheckbox"
                                    dense
                                    label="Same as Mailing Address"
                                    class="mt-n3 pt-0"
                                    @update:model-value="clickSameAsAddressButton"
                                  />
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
                  <PrimaryButton
                    v-if="canEditDistrictDetails()"
                    id="addNewDistrictNoteButton"
                    width="9em"
                    icon="mdi-plus"
                    icon-left
                    text="New Note"
                    :click-action="openNoteSheet"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col class="d-flex justify-start">
                  <v-timeline
                    id="districtNotesTimeline"
                    density="compact"
                    direction="vertical"
                    side="end"
                    truncate-line="both"
                  >
                    <v-timeline-item
                      v-for="(note) in sortedNotes"
                      :key="note.noteId"
                      icon="mdi-message-bulleted"
                      dot-color="white"
                      fill-dot
                      elevation="1"
                      icon-color="#003366"
                      size="large"
                      width="100%"
                    >
                      <v-card width="40em">
                        <v-card-title>
                          <v-row>
                            <v-col>
                              <div>
                                {{
                                  note.createUser
                                }}
                              </div>
                              <div
                                class="mt-n2"
                                style="font-size: xx-small;"
                              >
                                Last modified by {{
                                  note.updateUser
                                }} on {{
                                  formatDate(note.updateDate.substring(0, 19), 'uuuu-MM-dd\'T\'HH:mm:ss', to = 'uuuu/MM/dd')
                                }}
                              </div>
                            </v-col>
                            <v-col class="d-flex justify-end">
                              <span class="activityDisplayDate mr-2">{{
                                formatDate(note.createDate.substring(0, 19), 'uuuu-MM-dd\'T\'HH:mm:ss', to = 'uuuu/MM/dd')
                              }}</span>
                              <v-btn
                                v-if="canEditDistrictDetails()"
                                class="mr-2"
                                width="0.5em"
                                min-width="0.5em"
                                title="Edit"
                                color="white"
                                variant="flat"
                                small
                                @click="showDistrictNoteEditForm(note)"
                              >
                                <v-icon
                                  size="x-large"
                                  color="#003366"
                                  dark
                                >
                                  mdi-pencil
                                </v-icon>
                              </v-btn>
                              <v-btn
                                v-if="canEditDistrictDetails()"
                                width="0.5em"
                                min-width="0.5em"
                                title="Remove"
                                color="white"
                                variant="flat"
                                small
                                @click="removeDistrictNote(note)"
                              >
                                <v-icon
                                  size="x-large"
                                  color="#003366"
                                  dark
                                >
                                  mdi-delete
                                </v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card-title>
                        <v-card-text class="activityContent">
                          {{
                            note.content
                          }}
                        </v-card-text>
                      </v-card>
                    </v-timeline-item>
                    <v-timeline-item
                      v-if="sortedNotes.length === 0"
                      icon="mdi-message-bulleted"
                      dot-color="white"
                      fill-dot
                      elevation="1"
                      icon-color="#003366"
                      size="large"
                      width="100%"
                    >
                      <v-card>
                        <v-card-text class="activityContent">
                          No notes have been recorded for this school.
                        </v-card-text>
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
          >
            <v-card
              v-if="newNoteSheet"
              id="newDistrictNoteSheet"
              class="information-window-v-card"
            >
              <v-card-title class="sheetHeader pt-1 pb-1">
                New Note
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-textarea
                      id="newDistrictNoteTextArea"
                      ref="newDistrictNoteTextArea"
                      v-model="newNoteText"
                      rows="8"
                      label="Note"
                      autofocus
                      no-resize
                      variant="underlined"
                      maxlength="4000"
                      class="pt-0"
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>
                <v-row class="py-4 pr-2 justify-end">
                  <PrimaryButton
                    id="cancelNote"
                    secondary
                    text="Cancel"
                    class="mr-2"
                    :click-action="flipNoteSheet"
                  />
                  <PrimaryButton
                    id="saveNote"
                    text="Save"
                    width="7rem"
                    :disabled="newNoteText === ''"
                    :loading="loading"
                    :click-action="saveNewDistrictNote"
                  />
                </v-row>
              </v-card-text>
            </v-card>
          </v-bottom-sheet>
          <v-bottom-sheet
            v-model="editNoteSheet"
            inset
            no-click-animation
            scrollable
            persistent
          >
            <v-card
              v-if="editNoteSheet"
              id="editDistrictNoteSheet"
              class="information-window-v-card"
            >
              <v-card-title class="sheetHeader pt-1 pb-1">
                Edit Note
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-textarea
                      id="editDistrictNoteTextArea"
                      ref="editDistrictNoteTextArea"
                      v-model="editDistrictNote.content"
                      rows="8"
                      label="Note"
                      autofocus
                      no-resize
                      variant="underlined"
                      maxlength="4000"
                      class="pt-0"
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>
                <v-row class="py-4 pr-2 justify-end">
                  <PrimaryButton
                    id="cancelNote"
                    secondary
                    text="Cancel"
                    class="mr-2"
                    :click-action="cancelEditDistrictNote"
                  />
                  <PrimaryButton
                    id="saveNote"
                    text="Save"
                    width="7rem"
                    :disabled="editDistrictNote.content === ''"
                    :loading="loading"
                    :click-action="saveChangesToDistrictNote"
                  />
                </v-row>
              </v-card-text>
            </v-card>
          </v-bottom-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
  <ConfirmationDialog ref="confirmationDialog" />
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import router from '@/router';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {mapState} from 'pinia';
import {deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import _ from 'lodash';

export default {
  name: 'DistrictDetails',
  components: {
    ConfirmationDialog,
    PrimaryButton
  },
  mixins: [alertMixin],
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
      editNoteSheet: false,
      editDistrictNote: null,
    };
  },
  computed: {
    ...mapState(authStore, ['DISTRICT_ADMIN_ROLE']),
    ...mapState(instituteStore, ['provinceCodes', 'countryCodes']),
    hasSamePhysicalAddress() {
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    sortedNotes() {
      if (!this.district?.notes) {
        return [];
      }
      let notes = this.district.notes.slice();
      return notes.sort(function (a, b) {
        const aCreateDate = new LocalDateTime.parse(a.createDate.substring(0, 19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        const bCreateDate = new LocalDateTime.parse(b.createDate.substring(0, 19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        if (aCreateDate.isBefore(bCreateDate)) {
          return 1;
        }
        if (aCreateDate.isAfter(bCreateDate)) {
          return -1;
        }
        return 0;
      });
    }
  },
  created() {
    this.getDistrict();

    instituteStore().getAllProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province => province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instituteStore().getAllCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
  },
  methods: {
    formatPhoneNumber,
    getDistrict() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.institute.DISTRICT_DATA_URL}/${this.districtID}`)
        .then(response => {
          this.district = response.data;
          this.cleanWebsiteUrl = this.district.website ? sanitizeUrl(this.district.website) : '';
          this.setHasSamePhysicalFlag();
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    async clickSameAsAddressButton() {
      await this.$nextTick();
      await this.$refs.districtDetailsForm.validate();
    },
    cancelClicked() {
      this.editing = false;
      this.setHasSamePhysicalFlag();
    },
    showEditLinks(fieldValue) {
      return this.canEditDistrictDetails() && !fieldValue;
    },
    setHasSamePhysicalFlag() {
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async toggleEdit() {
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
    canEditDistrictDetails() {
      return this.DISTRICT_ADMIN_ROLE;
    },
    addAddressesIfRequired(district) {
      let addresses = district.addresses;
      if (!this.hasMailingAddress()) {
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
      if (!this.hasPhysicalAddress()) {
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
    openNoteSheet() {
      this.newNoteSheet = !this.newNoteSheet;
    },
    flipNoteSheet() {
      this.newNoteSheet = !this.newNoteSheet;
      this.newNoteText = '';
    },
    showDistrictNoteEditForm(districtNote) {
      this.editDistrictNote = _.cloneDeep(districtNote);
      this.editNoteSheet = true;
    },
    cancelEditDistrictNote() {
      this.editDistrictNote = null;
      this.editNoteSheet = false;
    },
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
    saveChangesToDistrictNote() {
      this.loading = true;
      let payload = {
        noteId: this.editDistrictNote.noteId,
        districtId: this.editDistrictNote.districtId,
        content: this.editDistrictNote.content
      };
      ApiService.apiAxios.put(`${Routes.institute.DISTRICT_NOTE_URL}/${this.editDistrictNote.noteId}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been saved.');
          this.editDistrictNote = null;
          this.editNoteSheet = false;
          this.getDistrict();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the changes to the district note. Please try again later.');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    removeDistrictNote(districtNote) {
      const opts = {
        color: '#003366',
        dense: false,
        width: 400,
        dark: true,
        titleBold: true,
        resolveText: 'Remove'
      };
      this.$refs.confirmationDialog.open('Please Confirm', 'Are you sure you want to remove this note?', opts)
        .then((result) => {
          if (!result) {
            return;
          }
          this.loading = true;
          ApiService.apiAxios.delete(`${Routes.institute.DISTRICT_NOTE_URL}/${districtNote.districtId}/${districtNote.noteId}`).then(() => {
            this.setSuccessAlert('The district note has successfully been removed!');
            this.getDistrict();
          }).catch(error => {
            console.log(error);
            this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while removing the district note. Please try again later.');
          }).finally(() => {
            this.loading = false;
          });
        });
    },
    async updateDistrictDetails() {
      this.loading = true;

      if (this.sameAsMailingCheckbox) {
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
    hasMailingAddress() {
      return this.district.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress() {
      return this.district.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressCopy() {
      return this.districtDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy() {
      return this.districtDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    getMailingAddressItem(item) {
      let mailingAddress = this.district.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if (x === item) {
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item) {
      let physicalAddress = this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if (x === item) {
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
    border-width: 3px;
    opacity: unset;
}

.sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
}

.activityTitle {
  line-height: 1rem;
}

.activityDisplayDate {
    font-size: smaller;
}

.activityContent {
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    font-size: medium;
}

.fontItalic {
    font-style: italic;
}

.containerSetup {
    padding-right: 24em !important;
    padding-left: 24em !important;
}

.editField {
    font-size: 14px;
    color: rgb(0, 51, 102);
}

.editField:hover {
    text-decoration: underline;
}

</style>
