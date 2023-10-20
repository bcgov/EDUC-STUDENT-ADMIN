<template>
  <span>
    <v-card
      bg
      height="100%"
    >
      <v-card-title class="pb-0 text-wrap">
        <v-row no-gutters>
          <v-col>
            <v-row no-gutters>
              <v-col
                cols="8"
                class="justify-start"
              >
                <v-icon
                  class="pb-1"
                  size="15"
                  :color="getStatusColor(contact)"
                  left
                  dark
                >
                  mdi-circle
                </v-icon>
                <strong class="pl-1">{{
                  formatContactName(contact)
                }}</strong>
              </v-col>
              <v-col
                cols="4"
                class="d-flex justify-end"
              >
                <v-btn
                  v-if="canEditSchoolContact"
                  id="editContactButton"
                  title="Edit"
                  color="white"
                  width="0.5em"
                  min-width="0.5em"
                  variant="flat"
                  small
                  class="mr-2"
                  @click="callDoShowEditSchoolContactForm()"
                >
                  <v-icon
                    size="x-large"
                    color="#003366"
                    dark
                  >mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  v-if="canEditSchoolContact"
                  id="removeContactButton"
                  title="Remove"
                  color="white"
                  width="0.5em"
                  min-width="0.5em"
                  variant="flat"
                  small
                  class="mr-2"
                  @click="callShowRemoveContactConfirmation"
                >
                  <v-icon
                    size="x-large"
                    color="#003366"
                    dark
                  >mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col
                cols="12"
                class="pt-1"
              >
                <strong style="word-break: break-word;">{{
                  contact.jobTitle
                }}</strong>
              </v-col>
              <v-col
                v-if="!contact.email && !contact.phoneNumber"
                cols="12"
                class="pt-1"
              >
                <p class="missing-highlight"><v-icon
                  size="small"
                  color="#ff5252"
                  dark
                >mdi-alert</v-icon> Missing contact details</p>
                <a
                  v-if="canEditSchoolContact"
                  class="editField"
                  @click="callDoShowEditSchoolContactForm()"
                >+ email or phone</a>
              </v-col>
              <v-col
                v-if="contact.email"
                cols="12"
                class="pt-1"
              >
                <span id="contactEmail"> {{
                  contact.email
                }}</span>
              </v-col>
              <v-col
                v-if="contact.phoneNumber"
                cols="12"
                class="pt-1"
              >
                <span id="contactPhoneNumber">{{
                  formatPhoneNumber(contact.phoneNumber)
                }}</span><span v-if="contact.phoneExtension"> ext. {{
                  contact.phoneExtension
                }}</span>
              </v-col>
              <v-col
                v-if="contact.alternatePhoneNumber"
                cols="12"
                class="pt-1"
              >
                <span id="contactAlternatePhoneNumber">{{
                  formatPhoneNumber(contact.alternatePhoneNumber)
                }} (alt.)</span> <span v-if="contact.alternatePhoneExtension"> ext. {{
                  contact.alternatePhoneExtension
                }}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="pt-2">
        <v-row no-gutters>
          <v-col
            v-if="contact.expiryDate"
            cols="12"
            class="pt-1"
          >
            <v-icon aria-hidden="false">
              mdi-calendar-today
            </v-icon>
            <span id="contactEffectiveAndExpiryDate"> {{
              formatDate(contact.effectiveDate)
            }} - {{
              formatDate(contact.expiryDate)
            }}</span>
          </v-col>
          <v-col
            v-else
            cols="12"
            class="pt-1"
          >
            <v-icon aria-hidden="false">
              mdi-calendar-today
            </v-icon>
            <span id="contactEffectiveDate"> {{
              formatDate(contact.effectiveDate)
            }}</span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </span>
</template>

<script>

import {formatPhoneNumber, formatDate, formatContactName} from '@/utils/format';
import {getStatusColor} from '@/utils/institute/status';

export default {
  name: 'SchoolContact',
  props: {
    contact: {
      type: Object,
      required: true
    },
    canEditSchoolContact: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    callDoShowEditSchoolContactForm() {
      this.$emit('editSchoolContact:doShowEditSchoolContactForm');
    },
    callShowRemoveContactConfirmation() {
      this.$emit('removeSchoolContact:showConfirmationPrompt', this.contact.schoolId, this.contact.schoolContactId);
    },
    formatDate,
    formatPhoneNumber,
    getStatusColor,
    formatContactName
  },
};
</script>
<style scoped>
.editField {
    font-size: 16px;
    color: rgb(0, 51, 102);
}

.editField:hover {
    text-decoration: underline;
}

.missing-highlight {
    color: #ff5252;
    word-break: break-word;
    font-size: 16px;
}

</style>
