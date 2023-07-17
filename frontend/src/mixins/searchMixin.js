import {
  isNotEmptyInputParams,
  isValidMincode,
  isValidAlphanumericValue,
} from '@/utils/validation';

import {deepCloneObject, setEmptyInputParams} from '@/utils/common';

export default {
  data() {
    return {
      searchLoading: false,
      searchEnabled: false,
      isValidSearchForm: false,
      searchInputParams: null,
      searchParams: {},
      minCodeHint: 'Digits only',
      alphanumericHint: 'Alphanumeric only',
    };
  },
  methods: {
    isValidMincode,
    validateField(value, validator = isValidAlphanumericValue, hint = this.alphanumericHint, length = 0) {
      if (!value || validator(value)) {
        return [];
      }
      this.searchEnabled = false;
      if (value.length < length) {
        return [];
      } else {
        return [
          hint
        ];
      }
    },
    clearSearchParams() {
      setEmptyInputParams(this.searchInputParams);
      this.searchHasValues();
      this.search();
    },
    searchHasValues(){
      this.searchEnabled = isNotEmptyInputParams(this.searchInputParams);
      return this.searchEnabled;
    },
    enterPushed() {
      console.log('Enter1');
      if (this.isValidSearchForm && this.searchHasValues()) {
        console.log('Enter2');
        this.search();
      }
    },
    search() {
      this.searchLoading = true;
      this.searchParams = deepCloneObject(this.searchInputParams);
    },
  }
};
