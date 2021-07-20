import {getSchoolData} from '@/utils/common';

export default {
  data() {
    return {
      mincodeErrors: [], // asynchronously set the validation error messages
      schoolLabel: null, // school name returned from school API
      mincodeError: false, // error indicator
      loadingSchoolData: false, // in progress for asynchronous validation
      mincodeHint: 'Invalid Mincode',
      mincodeAdditionalHint: ', should be exactly 8 digits.',
    };
  },
  methods: {
    async getSchoolName(mincode) {
      if(mincode && mincode.length === 8){
        this.loadingSchoolData = true;
        try {
          const schoolData = await getSchoolData(mincode);
          if (!!schoolData && !!schoolData.schoolName) {
            this.schoolLabel = schoolData.schoolName;
            this.mincodeError = false;
            this.mincodeErrors = [];
          } else {
            this.mincodeError = true;
            this.mincodeErrors = [this.mincodeHint];
          }
        } catch (e) {
          this.mincodeError = true;
          this.mincodeErrors = [this.mincodeHint];
        } finally {
          this.loadingSchoolData = false;
        }
      }
    },
    isValidFormattedMincode(mincode) {
      return mincode && mincode.length === 9 && mincode.charAt(3) === ' ';
    },
  }
};
