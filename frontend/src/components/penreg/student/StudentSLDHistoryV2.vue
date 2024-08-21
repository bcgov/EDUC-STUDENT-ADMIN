<template>
  <div
    id="sldHistory"
    class="px-0 pt-3 ma-0"
    style="width: 100%;"
  >
    <v-row no-gutters>
      <v-col>
        <div
          id="studentInfo"
          class="px-1 pt-2 pb-5"
        >
          <strong class="pr-3">{{ formatPen(student.pen) }}</strong>
          {{ getStudentName(student) }}
        </div>
      </v-col>
      <v-col class="d-flex justify-end">
        <CompareDemographicModal
          v-model:selected-records="compareStudent"
          :clear-on-exit="false"
          :disabled="isStudentUpdated || !PROCESS_STUDENT_ROLE"
        />
      </v-col>
    </v-row>
    <v-row>
      <CustomTable
        :headers="tableHeaders"
        :data="sldData"
        :total-elements="totalElements"
        :is-loading="loading"
        :highlight-changes="true"
        :show-links="false"
        :clickable="false"
      />
    </v-row>
  </div>
</template>
<script>
import {Routes} from '@/utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import {formatPen} from '@/utils/format';
import CompareDemographicModal from '@/components/common/CompareDemographicModal.vue';
import {mapState} from 'pinia';
import {notificationsStore} from '@/store/modules/notifications';
import {authStore} from '@/store/modules/auth';
import CustomTable from '@/components/common/CustomTable.vue';

export default {
  name: 'StudentSLDHistory',
  components: {
    CustomTable,
    CompareDemographicModal
  },
  mixins: [alertMixin],
  props: {
    student: {
      type: Object,
      required: true
    }
  },
  emits: ['isStudentUpdated'],
  data() {
    return {
      tableHeaders: [
        {title: 'Date', value: 'updateDate', key: 'updateDate', sortable: false, tooltip: 'Activity Date'},
        { title: 'District', key: 'districtName' },
        { title: 'School', key: 'schoolName' },
        { title: 'Assigned PEN', key: 'assignedPen', subHeader: { title: 'Local ID', key: 'localID' } },
        { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
        { title: 'Birthdate', key: 'dob', subHeader: { title: 'Gender', key: 'gender' } },
        { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
        { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
        { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
        { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInELL' } },
        { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
        { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
        { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Special Education Category', key: 'mappedSpedCode' } },
      ],
      loading: true,
      sldData: [],
      compareStudent: [],
      isStudentUpdated: false,
      pageNumber: 1,
      pageSize: 10,
      totalElements: 0
    };
  },
  computed:{
    ...mapState(notificationsStore, ['notification']),
    ...mapState(authStore, ['PROCESS_STUDENT_ROLE']),
  },
  watch: {
    notification(val) {
      if (val) {
        const notificationData = val;
        if (notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
          try {
            const student = JSON.parse(notificationData.eventPayload);
            if (student?.pen && student?.pen === this.student?.pen) {
              this.isStudentUpdated = true;
              this.$emit('isStudentUpdated', true);
              const warningMessage = `Student details for ${student.pen} is updated by ${student.updateUser}, Please refresh the page.`;
              this.setWarningAlert(warningMessage);
              const studentID = student.studentID;
              this.addStaleDataToMap({studentID, warningMessage});
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  },
  created() {
    this.compareStudent[0] = this.student;
    this.retrieveStudentSLDData();
  },
  methods: {
    formatPen,
    getStudentName(student) {
      return `${student.legalLastName ? student.legalLastName + ',' : ''} ${student.legalFirstName ? student.legalFirstName : ''} ${student.legalMiddleNames ? student.legalMiddleNames : ''}`;
    },
    retrieveStudentSLDData() {
      this.loading = true;
      ApiService.apiAxios
        .get(Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT + '/byAssignedStudentID', {
          params: {
            pageNumber: this.pageNumber - 1,
            pageSize: this.pageSize,
            sort: {
              'sdcSchoolCollection.uploadDate': 'DESC'
            },
            assignedStudentID: this.student.studentID,
            tableFormat: true
          }
        })
        .then(response => {
          this.sldData = response?.data?.content;
          this.totalElements = response?.data?.totalElements;
        }).catch(error => {
          this.setFailureAlert('Could not retrieve data from API, Please try again later.');
          console.log(error);
        }).finally(() => {
          this.loading = false;
        });
    },
  }
};
</script>
<style scoped>
#studentInfo {
  font-size: 1.25rem;
}
</style>
