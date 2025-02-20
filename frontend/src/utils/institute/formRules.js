// contains helper functions for form validation in vue.
//
// Ex. use case to create an email input that is required
//  <v-text-field
//     v-model="contactEdit.alternatePhoneExtension"
//     :rules="[rules.email(), rules.required('custom message here')]"
//  </v-text-field>
//
// Example SchoolContact.vue
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
  return v => !v || /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63}$/.test(v) || message;
};

/**
 * Rule to check input is a number
 * @param {String} message
 * @returns Function
 */
const number = (message = 'Must be a number') => {
  return v => !v || /^\d+$/.test(v) || message;
};

/**
 * Form input must not contain special characters
 *
 * @param {String} [message]
 * @returns {(value: string) => true|string}
 */
const noSpecialCharactersSchDisAuthName = (message = 'Remove or replace any special characters in this field.') =>
  v => !v || !/[^A-Za-z0-9\s-'.#():?&/@]/.test(v) || message;

const noSpecialCharactersAddress = (message = 'Special characters currently aren’t accepted, but we recognize their importance and are working on an update. For now, please remove or replace them.') =>
  v => !v || !/[^A-Za-z0-9\s-.#/]/.test(v) || message;

const noSpecialCharactersContactTitle = (message = 'Remove or replace any special characters in this field.') =>
  v => !v || !/[^A-Za-z.'\s-&()]/.test(v) || message;

const noSpecialCharactersContactName = (message = 'Remove or replace any special characters in this field.') =>
  v => !v || !/[^A-Za-z.'\s-]/.test(v) || message;

const specialCharactersInSchDisName = (displayName, message = 'Required. Enter a school name without special characters.') =>{
  if(/[^A-Za-z.'0-9#@&():?/\s-]/.test(displayName)) {
    return required(message);
  }
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

/**
 * Field is required when other field values are filled out.
 *
 * @param {string[]} fieldValues - an array of field values
 * @param {string} message - error message to display
 * @returns {(v: string) => bool|string} validation test
 */
const requiredWithOtherFieldValues = (
  fieldValues = [],
  message = 'Please fulfill all related fields.'
) => {
  const toAnyFieldHasValue = (result, currentValue) => result || !!(currentValue?.trim());
  return v => {
    const thisFieldIsEmpty = !(v?.trim());
    const fieldsContainValues = fieldValues.reduce(toAnyFieldHasValue, false);
    return thisFieldIsEmpty && fieldsContainValues ? message : true;
  };
};

/**
 * Field is required when some boolean check is true
 *
 * @param {boolean} bool - some boolean check
 * @param {string} message - error message to display
 */
const requiredIf = (bool = true, message = 'Required') => {
  return v => {
    if (bool) {
      return required(message)(v);
    }
    return true;
  };
};

/**
 * Custom endDate Rule! Checks that we have start date and that end date
 * happens after start date. Date format should be 2022-12-10 YYYY-MM-DD.
 * @param {String} effectiveDate
 * @param {String} expiryDate
 * @returns {String, Boolean}
 */
const endDateRule = (effectiveDate, expiryDate, message = 'End date cannot be before start date') => {

  if (effectiveDate && expiryDate) {
    const effDate = LocalDate.parse(effectiveDate.substring(0,10));
    const expDate = LocalDate.parse(expiryDate.substring(0,10));

    return expDate.isAfter(effDate) || expDate.isEqual(effDate) || message;
  }

  return true;
};

const dateIsPriorOrEqualTo = (inputDate, baseDate, allowNullBaseDate = false, message = 'The input date must be prior or equal to the base date.') => {
  if (!inputDate) {
    return 'Please specify an input date.';
  }
  if (!baseDate && !allowNullBaseDate) {
    return 'Please specify a base date.';
  }
  if (!baseDate && allowNullBaseDate) {
    return true;
  }
  inputDate = LocalDate.parse(inputDate.substring(0, 10));
  baseDate = LocalDate.parse(baseDate.substring(0, 10));
  return inputDate.isBefore(baseDate) || inputDate.isEqual(baseDate) || message;
};

const dateIsAfterOrEqualTo = (inputDate, baseDate, allowNullBaseDate = false, message = 'The input date must be after or equal to the base date.') => {
  if (!inputDate) {
    return 'Please specify an input date.';
  }
  if (!baseDate && !allowNullBaseDate) {
    return 'Please specify a base date.';
  }
  if (!baseDate && allowNullBaseDate) {
    return true;
  }
  inputDate = LocalDate.parse(inputDate.substring(0, 10));
  baseDate = LocalDate.parse(baseDate.substring(0, 10));
  return inputDate.isAfter(baseDate) || inputDate.isEqual(baseDate) || message;
};

/**
 * Rule for website url
 * @param {String} message
 * @returns Function
 */
const website = (message = 'Website must be valid and secure (i.e., https)') => {
  return v => !v || /^https:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(v) || message;
};

/**
 * Rule to check minimum length
 * @param {Number} length
 * @param {String} message
 * @returns Function
 */
const minLength = ( length, message = 'Must be at least ${length} characters') => {
  if (!message.includes('${length}')) {
    console.warn('missing ${length} string in message for minLength rule');
  }
  message = message.replace('${length}', length.toString());
  return v => !v || v.length === length || message;
};

const penIsValid = (message = 'PEN is invalid') => {
  return v => {
    if (!v) return true; // Allow empty values

    if (v.length !== 9 || !/^-?\d+(?:\.\d+)?$/.test(v)) {
      return message;
    }

    const odds = [];
    const evens = [];
    for (let i = 0; i < v.length - 1; i++) {
      const number = parseInt(v[i], 10);
      if (i % 2 === 0) {
        odds.push(number);
      } else {
        evens.push(number);
      }
    }

    const sumOdds = odds.reduce((acc, val) => acc + val, 0);

    let fullEvenString = "";
    evens.forEach(num => fullEvenString += num);

    const doubledEvens = [];
    const doubledEvenString = (parseInt(fullEvenString, 10) * 2).toString();
    for (const digit of doubledEvenString) {
      doubledEvens.push(parseInt(digit, 10));
    }

    const sumEvens = doubledEvens.reduce((acc, val) => acc + val, 0);

    const finalSum = sumEvens + sumOdds;
    const checkDigit = v[8];

    return ((finalSum % 10 === 0 && checkDigit === "0") ||
        (10 - finalSum % 10 === parseInt(checkDigit, 10))) || message;
  };
};

export {
  email,
  endDateRule,
  dateIsPriorOrEqualTo,
  dateIsAfterOrEqualTo,
  number,
  noSpecialCharactersSchDisAuthName,
  noSpecialCharactersContactName,
  noSpecialCharactersContactTitle,
  noSpecialCharactersAddress,
  minLength,
  specialCharactersInSchDisName,
  phoneNumber,
  postalCode,
  required,
  requiredWithOtherFieldValues,
  requiredIf,
  website,
  penIsValid,
};
