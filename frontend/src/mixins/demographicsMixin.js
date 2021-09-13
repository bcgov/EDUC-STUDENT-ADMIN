import ApiService from '@/common/apiService';
import { Routes } from '@/utils/constants';

export default {
  props: {
    switchLoading: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      penSearchId: null,
      demographics: {
        legalFirst: null,
        legalMiddle: null,
        legalLast: null,
        usualFirst: null,
        usualMiddle: null,
        usualLast: null,
        dob: null,
        gender: null
      },
      enableCompleteButton: false,
    };
  },
  methods: {
    searchByPen() {
      this.switchLoading(true);
      ApiService.apiAxios
        .get(Routes.SEARCH_BY_PEN + '/' + this.penSearchId)
        .then(response => {
          this.demographics = response.data;
          this.enableCompleteButton = true;
        })
        .catch(error => {
          console.log(error);
          if (error?.response?.status === 404 && error?.response?.data?.message) {
            this.setFailureAlert(`No demographic data was found for pen :: ${this.penSearchId}`);
          } else {
            this.setFailureAlert('An error occurred while loading the demographic data. Please try again later.');
          }
        })
        .finally(() => {
          this.switchLoading(false);
        });
    },
  }
};
