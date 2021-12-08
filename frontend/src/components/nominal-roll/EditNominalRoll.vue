<template>
  <v-container fluid class="full-height px-0">
    <v-row no-gutters>
      <PrimaryButton class="ml-2" text="Next" @click.native="goToNextPage"></PrimaryButton>
    </v-row>
    <v-row dense no-gutters v-if="items.length > 0">
      <v-col cols="12">
        <v-card v-if="items" class="ma-2">
          <v-card-title>
            Nominal Roll
            <v-spacer></v-spacer>
          </v-card-title>
          <v-data-table v-if="items"
                        item-key="nominalRollStudentID"
                        :headers="headers"
                        :items="items"
                        :expanded="expanded"
                        class="fill-height"
                        :options.sync="options"
                        :server-items-length="totalItems"
                        :loading="loading"
          >
            <template v-slot:item="props">
              <tr>
                <td v-for="header in props.headers" :key="header.id">
                  <PrimaryButton
                    v-if="header.value === 'actions' && !isEmpty(props.item.validationErrors)"
                    text="Fix"
                    @click.native="toggleRow(props.item)"
                  >
                  </PrimaryButton>
                  <div v-else>
                    <span v-if="props.item.validationErrors[header.value]" style="color: red">{{ props.item[header.value] || '' }}
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            color="red"
                            small
                            v-bind="attrs"
                            v-on="on"
                          >mdi-alert</v-icon>
                        </template>
                        {{props.item.validationErrors[header.value]}}
                      </v-tooltip>
                    </span>
                    <span v-else>{{ props.item[header.value] || '' }}</span>
                  </div>
                </td>
              </tr>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td style="border-bottom: 1px solid #ececec;" :colspan="headers.length">
                <v-form v-model="validForm" ref="form" lazy-validation>
                  <v-row class="px-4">
                    <v-col class="pb-0 pt-7">
                      <v-autocomplete v-model="editedRecord.schoolDistrictNumber"
                                :disabled="!item.validationErrors.schoolDistrictNumber && !validationErrors['School District']"
                                outlined dense name="1" label="School District"
                                :items="districtCodesObjectSorted"
                                :rules="[!validationErrors['School District'] || validationErrors['School District']]"
                      ></v-autocomplete>
                    </v-col>
                    <v-col class="pb-0 pt-7">
                      <v-text-field v-model="editedRecord.schoolNumber"
                                    :disabled="!item.validationErrors.schoolNumber && !validationErrors['School Number']"
                                    outlined dense name="2" label="School Number"
                                    :rules="[!validationErrors['School Number'] || validationErrors['School Number']]"
                      ></v-text-field>
                    </v-col>
                    <v-col class="pb-0 pt-7">
                      <v-autocomplete v-model="editedRecord.schoolName"
                                :disabled="!item.validationErrors.schoolName && !validationErrors['School Name']"
                                outlined dense name="3" label="School Name"
                                :items="mincodeSchoolNamesObjectSorted"
                                :rules="[!validationErrors['School Name'] || validationErrors['School Name']]"
                      ></v-autocomplete>
                    </v-col>
                    <v-col class="pb-0 pt-7">
                      <v-autocomplete v-model="editedRecord.leaProvincial"
                                :disabled="!item.validationErrors.leaProvincial && !validationErrors['LEA/Provincial']"
                                outlined dense name="4" label="LEA/Provincial"
                                :items="leaProvincialItems"
                                :rules="[!validationErrors['LEA/Provincial'] || validationErrors['LEA/Provincial']]"
                      ></v-autocomplete>
                    </v-col>
                    <v-col class="pb-0 pt-7">
                      <v-text-field v-model="editedRecord.recipientNumber"
                                    :disabled="!item.validationErrors.recipientNumber && !validationErrors['Recipient Number']"
                                    outlined dense name="5" label="Recipient Number"
                                    :rules="[!validationErrors['Recipient Number'] || validationErrors['Recipient Number']]"
                      ></v-text-field>
                    </v-col>
                    <v-col class="pb-0 pt-7">
                      <v-text-field v-model="editedRecord.fte"
                                    :disabled="!item.validationErrors.fte && !validationErrors['FTE']"
                                    outlined dense name="51" label="FTE"
                                    :rules="[!validationErrors['FTE'] || validationErrors['FTE']]"
                      ></v-text-field></v-col>
                    <v-col class="pb-0 pt-7">
                      <v-text-field v-model="editedRecord.surname"
                                    :disabled="!item.validationErrors.surname && !validationErrors['Surname']"
                                    outlined dense name="52" label="Surname"
                                    :rules="[!validationErrors['Surname'] || validationErrors['Surname']]"
                      ></v-text-field></v-col>
                    <v-col class="pb-0 pt-7">
                      <v-autocomplete v-model="editedRecord.gender"
                                      :disabled="!item.validationErrors.gender && !validationErrors['Gender']"
                                      outlined dense name="4" label="Gender"
                                      :items="genders"
                                      item-text="label"
                                      item-value="genderCode"
                                      :rules="[!validationErrors['Gender'] || validationErrors['Gender']]"
                      ></v-autocomplete>
                    </v-col>
                    <v-col class="pb-0 pt-7">
                      <v-menu
                        v-model="dateMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            id="date-picker-text-field"
                            :value="editedRecord.birthDate"
                            outlined
                            dense
                            readonly
                            v-on="on"
                            :disabled="!item.validationErrors.birthDate && !validationErrors['Birth Date']"
                            :rules="[!validationErrors['Birth Date'] || validationErrors['Birth Date']]"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          id="date-picker"
                          v-model="editedRecord.birthDate"
                          no-title
                        >
                          <v-spacer></v-spacer>
                          <PrimaryButton id="date-picker-ok-button" text="OK" @click.native="dateMenu=false"> </PrimaryButton>
                        </v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col class="pb-0 pt-7">
                      <v-autocomplete v-model="editedRecord.grade"
                                      :disabled="!item.validationErrors.grade && !validationErrors['Grade']"
                                      outlined dense name="4" label="Grade"
                                      :items="gradeCodeObjects"
                                      item-text="label"
                                      item-value="gradeCode"
                                      :rules="[!validationErrors['Grade'] || validationErrors['Grade']]"
                      ></v-autocomplete>
                    </v-col>
                    <v-col class="pb-0 pt-7">
                      <PrimaryButton width="100%" text="Save" :disabled="!validForm" @click.native="updateRequest(item)" :loading="updating"></PrimaryButton>
                    </v-col>
                  </v-row>
                </v-form>
              </td>
            </template>
          </v-data-table>
        </v-card>
        <spinner class="ma-2" v-if="loading"/>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import ApiService from '@/common/apiService';
import {
  NOMINAL_ROLL_STUDENT_STATUS_CODES,
  Routes,
  SEARCH_CONDITION,
  SEARCH_FILTER_OPERATION,
  SEARCH_VALUE_TYPE,
} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner';
import {LocalDate} from '@js-joda/core';
import PrimaryButton from '../util/PrimaryButton';
import {deepCloneObject, constructPenMatchObjectFromNominalRollStudent, getPossibleMatches} from '../../utils/common';
import {mapGetters,mapState} from 'vuex';
import router from '../../router';

export default {
  name: 'EditNominalRoll',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    Spinner
  },
  watch: {
    dateMenu (val) {
      val && setTimeout(() => (this.activePicker = 'YEAR'));
    },
    editedRecord: {
      handler() {
        this.validateRecord();
      },
      deep: true
    },
    options: {
      handler () {
        this.paginatedCall();
      },
      deep: true,
    }
  },
  data() {
    return {
      currentYear: LocalDate.now().year(),
      dialog: false,
      activePicker: null,
      dateMenu: false,
      expanded: [],
      editedRecord: {},
      headers: [
        {text: 'School District', value: 'schoolDistrictNumber',},
        {text: 'School Number', value: 'schoolNumber',},
        {text: 'School Name', value: 'schoolName',},
        {text: 'LEA/Provincial', value: 'leaProvincial',},
        {text: 'Recipient Number', value: 'recipientNumber'},
        {text: 'Recipient Name', value: 'recipientName'},
        {text: 'FTE', value: 'fte'},
        {text: 'Identity', value: 'identity'},
        {text: 'Surname', value: 'surname'},
        {text: 'Given Name(s)', value: 'givenNames'},
        {text: 'Initial', value: 'initial'},
        {text: 'Gender', value: 'gender'},
        {text: 'Birth Date', value: 'birthDate'},
        {text: 'Grade', value: 'grade'},
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      leaProvincialItems: ['LEA', 'PROVINCIAL'],
      search: '',
      items: [],
      totalItems: 0,
      options: {},
      filters: {},
      loading: false,
      schoolDistrictNumberSearch:'',
      sysMatchedStatuses: ['AA','B1','C1','D1'],
      updating: false,
      validationErrors: {},
      validForm: true
    };
  },
  async mounted() {
    if(!this.gradeCodeObjects || !this.genders) {
      this.$store.dispatch('student/getCodes');
    }
    if(this.isEmpty(this.mincodeSchoolNamesObjectSorted) || this.isEmpty(this.districtCodesObjectSorted)) {
      this.$store.dispatch('app/getCodes');
    }
    this.paginatedCall();
  },
  computed: {
    ...mapGetters('student', ['genders','gradeCodeObjects']),
    ...mapState('app', ['mincodeSchoolNames', 'districtCodes']),
    ...mapGetters('app', ['mincodeSchoolNamesObjectSorted', 'districtCodesObjectSorted'])
  },
  methods: {
    isEmpty(obj) {
      return Object.keys(obj).length === 0;
    },
    goToNextPage() {
      router.push({name:'nrStudentList'});
    },
    async paginatedCall() {
      try {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        let sort = {};
        if(!sortBy || sortBy.length === 0){
          sort.status = 'ASC';
        } else {
          sortBy.forEach((x, idx) => {
            sort[x] = sortDesc[idx] ? 'DESC' : 'ASC';
          });
        }
        let response = await ApiService.apiAxios.get(Routes.nominalRoll.PAGINATED_ENDPOINT, {
          params: {
            pageNumber: page-1 || 0,
            pageSize: itemsPerPage,
            sort: sort,
            searchQueries: [{
              searchCriteriaList: [
                {key: 'processingYear', operation: SEARCH_FILTER_OPERATION.EQUAL, value: LocalDate.now().year().toString(), valueType: SEARCH_VALUE_TYPE.STRING, condition: SEARCH_CONDITION.AND}
              ],
            }]
          }
        });
        this.items = response.data.content;
        this.totalItems = response.data.totalElements;
      } catch (e) {
        console.error(e);
        this.setFailureAlert('Could not load page please try again later.');
      }
    },
    async toggleRow(item) {
      const payload = {
        ...item
      };
      const index = this.expanded.indexOf(item);
      if (index === -1) {
        ApiService.apiAxios.post(`${Routes['nominalRoll'].ROOT_ENDPOINT}/validate`, payload)
          .then(async response => {
            this.validationErrors = response?.data?.validationErrors || {};
            this.editedRecord = deepCloneObject(item);
            if (this.expanded.length > 0) {
              this.expanded = [];
            }
            this.expanded.push(item);
            await this.$nextTick();
            this.$refs.form.validate();
          })
          .catch(e => {
            console.log(e);
            this.setFailureAlert('Failed validation call. Please try again later.');
          });
      } else {
        this.expanded.splice(index, 1);
      }
    },
    async updateRequest(item) {
      this.updating = true;
      try {
        if(!this.isEmpty(this.validationErrors)) {
          this.setWarningAlert('Cannot update record due to validation errors. Please fix and try again.');
        } else {
          const matchResult = await getPossibleMatches(constructPenMatchObjectFromNominalRollStudent(item));
          if (this.sysMatchedStatuses?.includes(matchResult?.penStatus) && this.isEmpty(item?.validationErrors)) {
            this.editedRecord.assignedPEN = matchResult.data[0];
            this.editedRecord.status = NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDSYS;
            this.setSuccessAlert('System has automatically found a match! Record will be updated.');
          } else {
            this.editedRecord.status = NOMINAL_ROLL_STUDENT_STATUS_CODES.FIXABLE;
            this.setWarningAlert('System was unable to find a direct match. The record will be set as fixable.');
          }
          ApiService.apiAxios.put(`${Routes['nominalRoll'].ROOT_ENDPOINT}/${this.editedRecord.nominalRollStudentID}`, {...this.editedRecord})
            .then(() => {
              this.toggleRow(item);
              this.paginatedCall();
              this.setSuccessAlert('Record has been successfully updated.');
            })
            .catch(e => {
              console.log(e);
              this.setFailureAlert('Failed to update record. Please try again later.');
            });
        }
      } catch(e) {
        console.log(e);
        this.setFailureAlert('Failed to update record. There was an error during pen match. Please try again later.');
      }
      this.updating = false;
    },
    async validateRecord() {
      const payload = {
        ...this.editedRecord
      };
      const response = await ApiService.apiAxios.post(`${Routes['nominalRoll'].ROOT_ENDPOINT}/validate`, payload);
      this.validationErrors = response?.data?.validationErrors || {};
    }
  }
};
</script>
