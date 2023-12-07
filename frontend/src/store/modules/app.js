import { REQUEST_TYPES } from '@/utils/constants';
import ApiService from '@/common/apiService';
import {defineStore} from 'pinia';
import {DateTimeFormatter, LocalDate, LocalDateTime} from '@js-joda/core';
export const appStore = defineStore('app', {
  namespaced: true,
  state: () => ({
    request: {},
    selectedRequest: null,
    messages:[],
    participants:[],
    requestType: REQUEST_TYPES.penRequest.name,
    requestTypeLabel: REQUEST_TYPES.penRequest.label,
    pageTitle: null,
    stickyInfoPanelHeight: null,
    mincodeSchoolNames: new Map(),
    schoolMap: new Map(),
    notClosedSchools: [],
    activeSchools: [],
    activeDistricts: [],
    districtMap : new Map(),
    districtCodes: new Set(),
    independentAuthorityMap: new Map(),
    alertNotificationText: '',
    alertNotificationQueue: [],
    alertNotification: false,
    config: '',
    fundingGroupsMap: new Map(),
    fundingGroups: [],
    collectionTypeCodesMap: new Map()
  }),
  getters: {
    activeFundingGroups: state => state.fundingGroups.filter(group => group.expiryDate >= LocalDateTime.now().toString() && group.effectiveDate <= LocalDateTime.now().toString()),
    districtCodesObjectSorted: state => Array.from(state.districtCodes).sort(),
    mincodeSchoolNamesObjectSorted: state => Object.values(Object.fromEntries(state.mincodeSchoolNames)).map(v => v.toUpperCase()).sort(),
  },
  actions: {
    async setConfig(config){
      this.config = config;
    },
    async setRequest(request) {
      this.request = request || {};
    },
    async setSelectedRequest(selectedRequest) {
      this.selectedRequest = selectedRequest;
    },
    async pushMessage(message) {
      this.messages.push(message);
    },
    async setMessages(messages) {
      this.messages = messages || [];
    },
    async setParticipants(participants) {
      this.participants = participants || [];
    },
    async setRequestType(requestType) {
      this.requestType = requestType;
      this.requestTypeLabel = REQUEST_TYPES[requestType].label;
    },
    async setPageTitle(pageTitle) {
      this.pageTitle = pageTitle;
    },
    async setStickyInfoPanelHeight(stickyInfoPanelHeight) {
      this.stickyInfoPanelHeight = stickyInfoPanelHeight;
    },
    async setMincodeSchoolNameAndDistrictCodes(mincodeSchoolNameList) {
      this.mincodeSchoolNames = new Map();
      this.schoolMap = new Map();
      this.notClosedSchools = [];
      mincodeSchoolNameList.forEach(element => {
        this.mincodeSchoolNames.set(element.mincode, element.schoolName);
        this.schoolMap.set(element.schoolID, {...element});
        if(isSchoolActive(element)){
          this.notClosedSchools.push(element);
        }
        this.districtCodes.add(element.mincode?.substring(0, 3));
      });
    },
    async setActiveSchools(activeSchools) {
      this.activeSchools = activeSchools;
    },
    async setActiveDistricts(activeDistricts) {
      this.activeDistricts = activeDistricts;
    },
    async setDistricts(districtList) {
      this.districtMap = new Map();
      districtList.forEach(element => {
        this.districtMap.set(element.districtId, element);
      });
    },
    async setIndependentAuthorities(independentAuthorityList) {
      this.independentAuthorityMap = new Map();
      independentAuthorityList.forEach(element => {
        this.independentAuthorityMap.set(element.authorityID, element);
      });
    },
    async setAlertNotificationText(alertNotificationText) {
      this.alertNotificationText = alertNotificationText;
    },
    async setAlertNotification(alertNotification) {
      this.alertNotification = alertNotification;
    },
    async addAlertNotification(text) {
      this.alertNotificationQueue.push(text);
      if (!this.alertNotification) {
        this.alertNotification = true;
      }
    },
    async setFundingGroups(fundingGroups) {
      this.fundingGroups = fundingGroups;
      this.fundingGroupsMap = new Map();
      fundingGroups.forEach(element => {
        this.fundingGroupsMap.set(element.schoolFundingGroupCode, element);
      });
    },
    async setCollectionTypeCodes(collectionTypes) {
      this.collectionTypeCodesMap = new Map();
      collectionTypes.forEach(element => {
        this.collectionTypeCodesMap.set(element.collectionTypeCode, element)
      })
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(this.mincodeSchoolNames.size === 0) {
          const response = await ApiService.getAllSchools();
          await this.setMincodeSchoolNameAndDistrictCodes(response.data);
        }
        if (this.activeSchools.length === 0) {
          const response = await ApiService.getActiveSchools();
          await this.setActiveSchools(response.data);
        }
        if(this.districtMap.size === 0) {
          const response = await ApiService.getDistricts();
          await this.setDistricts(response.data);
        }
        if (this.activeDistricts.length === 0) {
          const response = await ApiService.getActiveDistricts();
          await this.setActiveDistricts(response.data);
        }
        if(this.independentAuthorityMap.size === 0) {
          const response = await ApiService.getAuthorities();
          await this.setIndependentAuthorities(response.data);
        }
        if(this.fundingGroupsMap.size === 0 && !this.config.DISABLE_SDC_FUNCTIONALITY) {
          const response = await ApiService.getAllFundingGroups();
          await this.setFundingGroups(response.data);
        }
        if(this.collectionTypeCodesMap.size === 0 && !this.config.DISABLE_SDC_FUNCTIONALITY) {
          const response = await ApiService.getAllCollectionTypeCodes();
          await this.setCollectionTypeCodes(response.data);
        }
      }
    },
    async getConfig() {
      const response = await ApiService.getConfig();
      await this.setConfig(response.data);
    },
    async refreshEntities() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        const responseMinSchool = await ApiService.getAllSchools();
        await this.setMincodeSchoolNameAndDistrictCodes(responseMinSchool.data);

        const responseActiveSchools = await ApiService.getActiveSchools();
        await this.setActiveSchools(responseActiveSchools.data);

        const responseDistricts = await ApiService.getDistricts();
        await this.setDistricts(responseDistricts.data);

        const responseActiveDistricts = await ApiService.getActiveDistricts();
        await this.setActiveDistricts(responseActiveDistricts.data);

        const response = await ApiService.getAuthorities();
        await this.setIndependentAuthorities(response.data);

        if(!this.config.DISABLE_SDC_FUNCTIONALITY) {
          const responseFunding = await ApiService.getAllFundingGroups();
          await this.setFundingGroups(responseFunding.data);
        }
      }
    },
  },
});

function isSchoolActive(school) {
  const currentTime = LocalDate.now();
  const openedDate = school?.openedDate;
  const closedDate = school?.closedDate;
  return school?.schoolName && !!openedDate && (!closedDate || currentTime.isBefore(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
}

