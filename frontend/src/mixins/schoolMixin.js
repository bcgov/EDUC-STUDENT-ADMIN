import {getSchoolData} from '@/utils/common';

export default {
  data() {
    return {
      minCodeErrors: [], // asynchronous way to set the validation error messages
      schoolLabel: null,
      minCodeError: false,
      minCodeHint: 'Invalid Mincode',
      minCodeAdditionalHint: ', should be exactly 8 digits.',
    };
  },
  methods: {
    async getSchoolName(minCode) {
      try {
        const schoolData = await getSchoolData(minCode);
        if (!!schoolData && !!schoolData.schoolName) {
          this.schoolLabel = schoolData.schoolName;
          this.mincodError = false;
          this.minCodeErrors = [];
        } else {
          this.mincodeError = true;
          this.minCodeErrors = [this.minCodeHint];
        }
      } catch (e) {
        this.mincodeError = true;
        this.minCodeErrors = [this.minCodeHint];
      }
    },
    isValidFormattedMinCode(minCode) {
      return minCode && minCode.length === 9 && minCode.charAt(3) === ' ';
    },
  }
};
