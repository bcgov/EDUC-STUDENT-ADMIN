<template>
  <v-container
    fluid
    class="px-0 mb-4"
  >
    <v-row
      no-gutters
      style="background-color:white;"
    >
      <v-col>
        <v-data-table
          id="dataTable"
          v-model:page="pageNumber"
          v-model:items="studentRegistrationContacts"
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :search="search"
          :loading="dataLoading"
          :sort-by="sortBy"
          @click:row="openSchoolDetails"
        >
          <template #top>
            <v-text-field
              v-model="search"
              clearable
              hide-details="auto"
              label="Search"
              class="pa-4"
            />
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <ConfirmationDialog ref="confirmationDialog">
      <template #message>
        <v-col class="mt-n6">
          <v-row class="mt-n2 mb-0">
            You have unsaved changes. Do you wish to proceed and cancel changes?
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>

<script>
import {Routes} from '@/utils/constants';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {appStore} from '@/store/modules/app';

export default {
  name: 'StudentRegistrationContactsDisplay',
  components: {
    ConfirmationDialog
  },
  mixins: [alertMixin],
  data() {
    return {
      search: null,
      pageNumber: 1,
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        {title: 'Institute Identifier', value: 'instituteIdentifier', align: 'start', tooltip: 'Institute Identifier', key: 'instituteIdentifier'},
        {title: 'Institute Name', value: 'instituteName', tooltip: 'Institute Name', key: 'instituteName'},
        {
          title: 'Contact Name',
          value: 'name',
          tooltip: 'Name',
          key: 'name'
        },
        {
          title: 'Email',
          value: 'email',
          tooltip: 'Email',
          key: 'email'
        }
      ],
      sortBy: [
        {
          'key': 'instituteIdentifier',
          'order': 'asc'
        }
      ],
      studentRegistrationContacts: [],
      hoveredOveredRowID: null,
      hoveredOveredRow: null,
      hoveredOveredHeader: null,
      dataLoading: false,
    };
  },
  created() {
    appStore().getCodes();
  },
  mounted() {
    this.loadPenCoords();
  },
  methods: {
    loadPenCoords() {
      this.dataLoading = true;
      ApiService.apiAxios
        .get(`${Routes.institute.STUDENT_REGISTRATION_CONTACTS}`)
        .then(response => {
          if (response.data) {
            this.studentRegistrationContacts = response.data;
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the PEN contact data. Please try again later.');
        })
        .finally(() => (this.dataLoading = false));
    },
    openSchoolDetails(schoolContact, school){
      let curSchool = school.item.raw;
      let route;
      if(curSchool.instituteType === 'SCHOOL'){
        route = this.$router.resolve({name: 'schoolDetails', params: {schoolID: curSchool.instituteGUID}, query: {contact: true}});
      }else{
        route = this.$router.resolve({name: 'districtDetails', params: {districtID: curSchool.instituteGUID}, query: {contact: true}});
      }
      window.open(route.href, '_blank');
    },
  }
};
</script>

<style scoped>
:deep(.v-data-table-header__content){
  font-weight: bold;
}

</style>
