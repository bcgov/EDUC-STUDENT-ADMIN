import { defineStore } from 'pinia';
import ApiService from '../../common/apiService';

export const sdcCollectionStore = defineStore('sdcCollection', {
  id: 'sdcCollection',
  state: () => ({
    districtCollectionStatusCodesMap: new Map(),
    schoolCollectionStatusCodesMap: new Map()
  }),
  actions: {

    setDistrictCollectionStatusCodes(districtCollectionStatusCodes){
      districtCollectionStatusCodes.forEach(districtCollectionCode => {
        this.districtCollectionStatusCodesMap.set(districtCollectionCode.sdcDistrictCollectionStatusCode, districtCollectionCode);
      });
    },
    setSchoolCollectionStatusCodes(schoolCollectionStatusCodes){
      schoolCollectionStatusCodes.forEach(schoolCollectionCode => {
        this.schoolCollectionStatusCodesMap.set(schoolCollectionCode.sdcSchoolCollectionStatusCode, schoolCollectionCode);
      });
    },
    async getDistrictCollectionStatusCodeMap() {
      if(this.districtCollectionStatusCodesMap.size === 0) {
        ApiService.getAllDistrictCollectionStatusCodes().then((res) => this.setDistrictCollectionStatusCodes(res.data));
      }
      return this.districtCollectionStatusCodesMap;
    },
    async getSchoolCollectionStatusCodeMap() {
      if(this.schoolCollectionStatusCodesMap.size === 0) {
        ApiService.getAllSchoolCollectionStatusCodes().then((res) => this.setSchoolCollectionStatusCodes(res.data));
      }
      return this.schoolCollectionStatusCodesMap;
    }
  }
});
