import {getSchoolData} from '@/utils/common';

export default {
  data() {
    return {
      minCodeErrors: [], // asynchronously set the validation error messages
      schoolLabel: null, // school name returned from school API
      minCodeError: false, // error indicator
      loadingSchoolData: false, // in progress for asynchronous validation
      minCodeHint: 'Invalid Mincode',
      minCodeAdditionalHint: ', should be exactly 8 digits.',
    };
  },
  methods: {
    async getSchoolName(minCode) {
      this.loadingSchoolData = true;
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
      } finally {
        this.loadingSchoolData = false;
      }
    },
    isValidFormattedMinCode(minCode) {
      return minCode && minCode.length === 9 && minCode.charAt(3) === ' ';
    },
  }
};
