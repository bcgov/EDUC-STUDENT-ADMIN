<template>
  <span>
    <v-card height="100%">
      <v-card-title class="pb-0 text-wrap">
        <v-row no-gutters>
          <v-col>
            <v-row no-gutters>
              <v-col cols="10">
                <v-icon
                  class="pb-1"
                  size="x-small"
                  :color="getStatusColor(contact)"
                  left
                  dark
                >
                  mdi-circle
                </v-icon>
                <strong
                  id="authorityContactName"
                >{{
                  formatContactName(contact)
                }}</strong>
              </v-col>
              <v-col
                cols="2"
                class="d-flex justify-end"
              >
                <v-btn
                  v-if="canEditAuthorityContact"
                  id="editContactButton"
                  title="Edit"
                  color="white"
                  width="0.5em"
                  variant="flat"
                  min-width="0.5em"
                  small
                  class="mr-2"
                  @click="callDoShowEditAuthorityContactForm()"
                >
                  <v-icon
                    size="x-large"
                    color="#003366"
                    dark
                  >mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  v-if="canEditAuthorityContact"
                  id="removeContactButton"
                  title="Remove"
                  color="white"
                  width="0.5em"
                  variant="flat"
                  min-width="0.5em"
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
                  v-if="canEditAuthorityContact"
                  class="editField"
                  @click="callDoShowEditAuthorityContactForm()"
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
  name: 'AuthorityContact',
  props: {
    contact: {
      type: Object,
      required: true
    },
    canEditAuthorityContact: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    callDoShowEditAuthorityContactForm() {
      this.$emit('editAuthorityContact:doShowEditAuthorityContactForm');
    },
    callShowRemoveContactConfirmation() {
      this.$emit('removeAuthorityContact:showConfirmationPrompt', this.contact.independentAuthorityId, this.contact.authorityContactId);
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
