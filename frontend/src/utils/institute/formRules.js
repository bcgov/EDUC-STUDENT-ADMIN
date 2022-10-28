// contains helper functions for form validation in vue.
//
// Ex. use case to create an email input that is required
//  <v-text-field
//     v-model="contactEdit.alternatePhoneExtension"
//     :rules="[rules.email(), rules.required('custom message here')]"
//  </v-text-field>
//
// REMEMBER to do the following in your .vue file
//  import * as Rule from @/utils/institute/form
//  under data do rules: Rules <- allows you to use in <template>.

import {LocalDate} from '@js-joda/core';

/**
 * Rule for emails
 * @param {String} message
 * @returns Function
 */
const email = (message = 'E-mail must be valid') => {
  return v => !v || /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v) || message;
};

/**
 * Rule for phone numbers also works for fax numbers too
 * @param {String} message
 * @returns Function
 */
const phoneNumber = (message = 'Phone Number must be valid') => {
  return v => !v || /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v) || message;
};

/**
 * Rule for postalCodes
 * @param {String} message
 * @returns Function
 */
const postalCode = (message = 'Postal code must be valid') => {
  return v => /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(v) || message;
};

/**
 * Rule required v.trim prevents ' ' from being valid
 * @param {String} message
 * @returns Function
 */
const required = (message = 'Required') => {
  return v => !!(v && v.trim()) || message;
};

// *******************************************************************
// BETA RULES STILL IN DEVELOPMENT
// *******************************************************************
/**
 * Custom endDate Rule BETA! Checks that we have start date and that end date
 * happens after start date.
 * @param {String} effectiveDate
 * @param {String} expiryDate
 * @returns Function
 */
const endDateRuleBeta = (effectiveDate, expiryDate) => {
  let message = '';
  if (!effectiveDate && expiryDate) {
    message = 'Start date required';
  }

  if (effectiveDate && expiryDate) {
    const effDate = LocalDate.parse(effectiveDate.substring(0,10));
    const expDate = LocalDate.parse(expiryDate.substring(0,10));

    message = expDate.isAfter(effDate) ? '' : 'End date cannot be before start date';
  }

  return message || true;
};

export {
  email,
  endDateRuleBeta,
  phoneNumber,
  postalCode,
  required
};
