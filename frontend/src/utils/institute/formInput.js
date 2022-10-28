// helper function to use on input fields
// how to use: example SchoolContact.vue
// import {isNumber} from '@/utils/institute/formInput';
// under methods section in vue: isNumber (allows us to use in <template>)
// <v-text-field @keypress="isNumber($event)" />

/**
 * Will only allow numbers in an input field.
 * @param {Object} event
 * @returns void
 */
const isNumber = function(event) {
  let charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault();
  }
};

export {
  isNumber
};
