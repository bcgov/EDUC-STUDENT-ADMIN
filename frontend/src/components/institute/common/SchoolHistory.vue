<template>
    <v-row>
      <v-col :cols="showRecordDetail ? 6 : 12">
        <v-data-table id="schoolHistoryTable"
          :headers="getHeaders()"
          :items="schoolHistory.content"
          :items-per-page="schoolHistory.pageable.pageSize"
          :page.sync="pageNumber"
          :loading="loading"
          :key="selectedSchoolHistoryId"
          v-model="selectedSchoolHistory" 
          item-key="schoolHistoryId"
          @page-count="schoolHistory.pageable.pageNumber = $event" 
          class="batch-file-table"
          hide-default-footer>
          <template #item="props">
            <tr :class="tableRowClass(props.item)" @click="selectHistoryItem(props)">
              <td v-for="header in props.headers" :key="header.id" :class="header.id">
                <div class="table-cell">
                  <span :class="{ 'diff-value': props.item[`${header.value}_diff`] }">{{
                      formatTableColumn(header.format, props.item[header.value])
                  }}</span>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-row class="pt-2" justify="end">
          <v-col cols="4">
            <v-pagination color="#38598A" v-model="pageNumber" :length="schoolHistory.totalPages"></v-pagination>
          </v-col>
          <v-col cols="4" id="currentItemsDisplay">
            Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ schoolHistory.totalElements || 0 }}
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if="showRecordDetail">
        <SchoolHistoryDetailPanel 
          :nextSchoolHistory="nextSchoolHistory" 
          :schoolHistory="schoolHistory"
          :schoolHistoryId="selectedSchoolHistoryId" 
          @close="showRecordDetail = false" 
          @update="setSelectedSchoolHistoryId">
        </SchoolHistoryDetailPanel>
      </v-col>
    </v-row>
</template>
  
<script>
import { Routes } from '@/utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import router from '@/router';
import {formatDob} from '@/utils/format';
import { mapState } from 'pinia';
import {getStatusAuthorityOrSchool} from '@/utils/institute/status';
import SchoolHistoryDetailPanel from './SchoolHistoryDetailPanel.vue';
import {instituteStore} from '@/store/modules/institute';
import {appStore} from '@/store/modules/app';
export default {
  name: 'SchoolHistory',
  mixins: [alertMixin],
  components: {
    SchoolHistoryDetailPanel
  },
  props: {
    schoolID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      schoolHistory: {
        numberOfElements: 0,
        totalElements: 0,
        pageable: {
          pageSize: 0
        }
      },
      showRecordDetail: false,
      loading: true,
      pageNumber: 1,
      pageSize: 15,
      nextSchoolHistory: [],
      selectedSchoolHistory:[],
      allAuthority:[],
      selectedSchoolHistoryId:null,
      searchParams: {
        schoolID: '',
      },
      headers: [
        {text: 'Date', sortable: false, value: 'updateDate', format: this.formatDate, tooltip: 'Activity Date'},
        {text: 'Changed by', sortable: false, value: 'updateUser', tooltip: 'Changed By'},
        {text: 'Status', sortable: false, value: 'status', tooltip: 'Status'},
        {text: 'District Number', sortable: false, value: 'districtNumber', tooltip: 'District Code'},
        {text: 'Authority Number', sortable: false, value: 'authorityNumber', tooltip: 'Authority Code'},
        {text: 'School Number', sortable: false, value: 'schoolNumber', tooltip: 'School Code'},
        {text: 'Name', sortable: false, value: 'displayName', tooltip: 'Name'},
        {text: 'Facility Type', sortable: false, value: 'facilityTypeValue', tooltip: 'Facility Type'},
        {text: 'School Category', sortable: false, value: 'schoolCategoryValue', tooltip: 'School Category'},
        {text: 'Contact Information', sortable: false, value: 'contactUpdatedFlag', tooltip: 'Contact Information'},
        {text: 'Grades Offered', sortable: false, value: 'gradeValue', tooltip: 'Grades Offered'}
      ],
      shortHeaders: [
        {text: 'Date', sortable: false, value: 'updateDate', format: this.formatDate, tooltip: 'Activity Date'},
        {text: 'Changed by', sortable: false, value: 'updateUser', tooltip: 'Changed By'},
        {text: 'Status', sortable: false, value: 'status', tooltip: 'Status'},
        {text: 'Name', sortable: false, value: 'displayName', tooltip: 'Name'},
        {text: 'Contact Information', sortable: false, value: 'contactUpdatedFlag', tooltip: 'Contact Information'}
      ],
    };
  },
  computed: {
    ...mapState(instituteStore, ['facilityTypeCodes', 'schoolCategoryTypeCodes', 'gradeCodes', 'schoolNeighborhoodLearningCodes', 'schoolOrganizationTypeCodes', 'schoolReportingRequirementTypeCodes']),
    ...mapState(appStore, ['schoolMap', 'districtMap']),
    showingFirstNumber() {
      return ((this.pageNumber - 1) * (this.schoolHistory.pageable.pageSize || 0) + ((this.schoolHistory.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber - 1) * (this.schoolHistory.pageable.pageSize || 0) + (this.schoolHistory.numberOfElements || 0));
    },
  },
  async beforeMount() {
    await appStore().getCodes();
  },
  mounted() {
    this.getSchoolHistory();
    this.showRecordDetail = false;
  },
  watch: {
    pageNumber: {
      handler() {
        this.getSchoolHistory();
      }
    },
  },
  created() {
    this.getAuthority();
    const instStore = instituteStore();
    instStore.getAllFacilityTypeCodes();
    instStore.getAllSchoolCategoryTypeCodes();
    instStore.getAllGradeCodes();
    instStore.getAllSchoolNeighborhoodLearningCodes();
    instStore.getAllSchoolOrganizationTypeCodes();
    instStore.getSchoolReportingRequirementTypeCodes();
  },
  methods: {
    getPageHeading() {
      let school = this.schoolMap?.get(this.schoolID);
      if(school) {
        return school?.mincode + ' - ' + school?.schoolName;
      }
    },
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    tableRowClass(item) {
      let rowClass = [];
      item.isSelected && rowClass.push('selected-record');
      return rowClass;
    },
    selectHistoryItem(props) {
      this.setSelectedSchoolHistoryId(props.item.schoolHistoryId);
      this.showRecordDetail = true;
    },
    getHeaders() {
      if (this.showRecordDetail) {
        return this.shortHeaders;
      }
      return this.headers;
    },
    setSelectedSchoolHistoryId(schoolHistoryId) {
      this.schoolHistory.content.forEach(hist => {
        hist.expanded = false;
        hist.hidden = false;
        hist.isSelected = hist.schoolHistoryId === schoolHistoryId;
      });
      this.selectedSchoolHistoryId = schoolHistoryId;
    },
    compareAddress(preAddress, address) {
      if (!preAddress && !address) {
        return true;
      }
      if ((!preAddress && address) || (preAddress && !address)) {
        return false;
      }
      return preAddress.addressLine1 === address.addressLine1 &&
        preAddress.addressLine2 === address.addressLine2 &&
        preAddress.city === address.city &&
        preAddress.countryCode === address.countryCode &&
        preAddress.postal === address.postal &&
        preAddress.provinceCode === address.provinceCode;
    },
    getSchoolHistory() {
      this.loading = true;
      this.searchParams.schoolID = this.schoolID;
      const currentPageParams = {
        params: {
          pageSize: 15,
          pageNumber: this.pageNumber - 1,
          sort: {
            createDate: 'DESC'
          },
          searchParams: this.searchParams,
        }
      };

      const nextPageParams = {
        params: {
          pageSize: 1,
          pageNumber: this.pageNumber * currentPageParams.params.pageSize,
          sort: {
            createDate: 'DESC'
          },
          searchParams: this.searchParams,
        }
      };

      return Promise.all([currentPageParams, nextPageParams].map(params => ApiService.apiAxios
        .get(Routes.institute.SCHOOL_HISTORY_PAGINATED_DATA_URL, params)))
        .then(([currentPageResp, nextPageResp]) => {
          this.initializeSchoolHistory(currentPageResp.data, nextPageResp.data);
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the school history. Please try again later.');
          console.log(error);
        })
        .finally(() => this.loading = false);
    },
    checkForDifferences(preHistory, history, key) {
      if(key === 'mailingAddress') {
        history['mailingAddress_diff'] = !this.compareAddress(preHistory.mailingAddress, history.mailingAddress);
        return history;
      } else if(key === 'physicalAddress') {
        history['physicalAddress_diff'] = !this.compareAddress(preHistory.physicalAddress, history.physicalAddress);
        return history;
      } else if (history[key] !== preHistory[key] && !['createDate', 'createUser', 'addresses'].includes(key)) {
        history[`${key}_diff`] = true;
        return history;
      } else {
        history[`${key}_diff`] = false;
        return history;
      }
    },
    markDifferences(currentPageContent, nextPageContent) {
      const historyContent = [...currentPageContent, ...nextPageContent];
      historyContent.forEach((history, index) => {
        if (index < historyContent.length - 1) {
          const preHistory = historyContent[index + 1];
          Object.keys(history).forEach(key => {
            return this.checkForDifferences(preHistory, history, key);
          });
        }
      });
    },
    back() {
      router.push(`/institute/school/${this.schoolID}/details`);
    },
    formatDate(datetime) {
      return formatDob(datetime.substring(0, 10), 'uuuu-MM-dd');
    },
    initializeSchoolHistory(currentPageData, nextPageData) {
      [...currentPageData.content, ...nextPageData.content].forEach(history => {
        if (history) {
          this.formatSchoolHistory(history);
        }
      });
      this.markDifferences(currentPageData.content, nextPageData.content);
      this.checkContactUpdates(currentPageData, nextPageData);
      this.schoolHistory = {
        ...currentPageData,
        content: currentPageData.content,
      };
      this.nextSchoolHistory = nextPageData.content;
    },
    formatSchoolHistory(history) {
      history.facilityTypeValue =  this.mapFacilityCode(history.facilityTypeCode);
      history.schoolCategoryValue = this.mapSchoolCategoryCode(history.schoolCategoryCode);
      history.schoolReportingRequirementCodeValue =
        this.mapSchoolReportingRequirementCode(history.schoolReportingRequirementCode);
      history.gradeValue = this.mapGradesOffered(history.schoolGrades);
      history.status = getStatusAuthorityOrSchool(history);
      history.updateDateTrunc = history.updateDate.length > 10 ? history.updateDate.substr(0, 10) : history.updateDate;
      history.districtNumber = this.districtMap?.get(history.districtId)?.districtNumber;
      history.authorityNumber = this.allAuthority.find(authority => authority?.authorityID === history.independentAuthorityId)?.authorityNumber;
      history.mailingAddress = history.addresses?.find(address => address.addressTypeCode === 'MAILING');
      history.physicalAddress = history.addresses?.find(address => address.addressTypeCode === 'PHYSICAL') ?? history.addresses?.find(address => address.addressTypeCode === 'MAILING');
      history.nlcList = this.mapNLCActivity(history?.neighbourhoodLearnings);
      history.schoolOrganizationValue = this.mapSchoolOrganization(history?.schoolOrganizationCode);
      return history;
    },
    checkContactUpdates(currentPageData, nextPageData) {
      [...currentPageData.content, ...nextPageData.content].forEach(history => {
        if (history) {
          if(history.phoneNumber_diff || history.email_diff || history.faxNumber_diff || history.website_diff || history.mailingAddress_diff || history.physicalAddress_diff) {
            history.contactUpdatedFlag =  'Changed';
            history.contactUpdatedFlag_diff=true;
          } else {
            history.contactUpdatedFlag = 'Unchanged';
          }
        }
      });
    },
    mapFacilityCode(facilityCode) {
      return this.facilityTypeCodes.find(code =>code?.facilityTypeCode === facilityCode)?.description;
    },
    mapSchoolReportingRequirementCode(requirementCode) {
      return this.schoolReportingRequirementTypeCodes
        .find(c => c.schoolReportingRequirementCode === requirementCode).label;
    },
    mapSchoolCategoryCode(categoryCode) {
      return this.schoolCategoryTypeCodes.find(code =>code?.schoolCategoryCode === categoryCode)?.description;
    },
    mapNLCActivity(neighbourhoodLearnings) {
      let nLCActivityList = [];
      for (const nl of neighbourhoodLearnings) {
        let schoolNeighborhoodLearningType = this.schoolNeighborhoodLearningCodes?.find((facility) => facility?.neighborhoodLearningTypeCode === nl.neighbourhoodLearningTypeCode);
        if (schoolNeighborhoodLearningType) {
          nLCActivityList.push(schoolNeighborhoodLearningType?.label);
        }
      }
      nLCActivityList.sort((a,b) => a.localeCompare(b));
      return nLCActivityList.toString().replace(/,/g, ', ');
    },
    mapSchoolOrganization(schoolOrganizationCode) {
      return this.schoolOrganizationTypeCodes.find((facility) => facility.schoolOrganizationCode === schoolOrganizationCode)?.label;
    },
    mapGradesOffered(grades) {
      let gradeList = [];
      for (const grade of grades) {
        let schoolGradeType = this.gradeCodes.find((facility) => facility.schoolGradeCode === grade.schoolGradeCode);
        if (schoolGradeType) {
          gradeList.push(schoolGradeType.label.replaceAll('Grade ', ''));
        }
      }
      let onlyNumbers = gradeList.filter(Number);
      let onlyLetters = gradeList.filter(x => !onlyNumbers.includes(x));
      onlyLetters.sort((a,b) => a.localeCompare(b));

      onlyNumbers = onlyNumbers.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      gradeList = onlyNumbers.concat(onlyLetters);
      return gradeList.toString().replace(/,/g, ', ');
    },
    getAuthority(){
      ApiService.apiAxios.get(`${Routes.cache.AUTHORITY_DATA_URL}`)
        .then(response => {
          this.allAuthority = response?.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
  
<style scoped>
#auditHistory /deep/ .v-pagination__navigation > i {
  padding-left: 0;
}

#schoolHistoryTable /deep/ table {
  border-spacing: 0 0.25rem;
  border-bottom: thin solid #d7d7d7;
}

#schoolHistoryTable /deep/ table th {
  font-size: 0.875rem;
}

#schoolHistoryTable /deep/ table td {
  border-bottom: none !important;
}

#schoolHistoryTable /deep/ table tr.selected-record,
#schoolHistoryTable /deep/ table tbody tr:hover {
  background-color: #E1F5FE !important;
}
.diff-value {
  font-weight: bold;
}

.divider {
  border-color: #FCBA19;
  border-width: unset;
}
</style>
  
