<template>
  <div id="sldHistory" class="px-0 pt-3 ma-0" style="width: 100%;">
    <v-row>
      <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"
                    :timeoutMs="2000"></AlertMessage>
    </v-row>
    <v-row no-gutters>
      <v-col cols="11">
      <div id="studentInfo" class="px-1 pt-2 pb-5"><strong class="pr-3">{{ formatPen(student.pen) }}</strong>
        {{ getStudentName(student) }}
      </div>
      </v-col>
      <v-col cols="1">
        <CompareDemographicModal :clearOnExit="false" :disabled="false" :selectedRecords.sync="compareStudent"></CompareDemographicModal>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
            id="sldHistoryDataTable"
            :headers="headers"
            :items="sldData"
            :items-per-page="10"
            :loading="loading"
            no-data-text="No SLD history found"
        >
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {Routes} from '@/utils/constants';
import AlertMessage from '../../util/AlertMessage';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import {formatPen} from '@/utils/format';
import CompareDemographicModal from '@/components/common/CompareDemographicModal';

export default {
  name: 'StudentSLDHistory',
  mixins: [alertMixin],
  props: {
    student: {
      type: Object,
      required: true
    }
  },
  components: {
    AlertMessage,
    CompareDemographicModal
  },
  data() {
    return {
      headers: [
        {text: 'Date', value: 'reportDate', key: 'date', sortable: false},
        {text: 'Gr', value: 'enrolledGradeCode', key: 'grade', sortable: false},
        {text: 'Mincode', value: 'mincode', key: 'mincode', sortable: false},
        {text: 'Local ID', value: 'localStudentId', key: 'localId', sortable: false},
        {text: 'Surname', value: 'legalSurname', key: 'surname', sortable: false},
        {text: 'Given', value: 'legalGivenName', key: 'givenName', sortable: false},
        {text: 'Middle', value: 'legalMiddleName', key: 'middleName', sortable: false},
        {text: 'Gen', value: 'sex', key: 'gender', sortable: false},
        {text: 'Postal Code', value: 'postal', key: 'postalCode', sortable: false},
        {text: 'Birth Date', value: 'birthDate', key: 'dob', sortable: false}
      ],
      loading: true,
      sldData: [],
      compareStudent: [],
    };
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
          .get(Routes['sld'].STUDENT_HISTORY_URL + '/', {params: {pen: this.student.pen}})
          .then(response => {
            this.sldData = response.data;
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
#dataTable /deep/ table {
  border-spacing: 0 0.25rem;
  border-top: thin solid #d7d7d7;
  border-bottom: thin solid #d7d7d7;
}
#dataTable /deep/ table th {
  font-size: 0.875rem;
}
#dataTable /deep/ table td {
  border-bottom: none !important;
}
#studentInfo {
  font-size: 1.25rem;
}
</style>
