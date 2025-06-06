<template>
  <div
    id="schoolMove"
    class="px-0 pt-3 ma-0"
    style="width: 100%;"
  >
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        />
      </v-col>
    </v-row>
    <v-row
      v-else
      no-gutters
    >
      <v-col>
        <v-row
          v-if="isMoveSchoolAllowed()"
          class="mb-1"
        >
          <v-col class="text-right">
            <PrimaryButton
              id="moveSchoolButton"
              class="mr-2"
              secondary
              icon-left
              icon="mdi-arrow-left-right"
              text="Move School"
              @click-action="moveSchool"
            />
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="schoolMoveDataFormatted"
          :loading="loading"
          class="elevation-1"
          item-value="schoolMoveId"
        />
      </v-col>
    </v-row>

    <v-bottom-sheet
      v-model="moveSchoolSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <MoveSchoolPage
        v-if="moveSchoolSheet"
        :school="school"
        @moveSchool:closeMoveSchoolPage="moveSchoolSheet = !moveSchoolSheet"
      />
    </v-bottom-sheet>
  </div>
</template>

<script>
import {Routes} from '@/utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import router from '@/router';
import {formatDob} from '@/utils/format';
import {mapState, mapActions} from 'pinia';
import MoveSchoolPage from './MoveSchoolPage.vue';
import PrimaryButton from '../../util/PrimaryButton.vue';
import {getStatusAuthorityOrSchool} from '@/utils/institute/status';
import {appStore} from '@/store/modules/app';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'SchoolMove',
  components: {
    MoveSchoolPage,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      schoolMoveDataFormatted: [],
      independentArray: ['INDEPEND', 'INDP_FNS'],
      loading: true,
      moveSchoolSheet: false,
      school: '',
      district: '',
      headers: [
        {title: 'Date', sortable: false, key: 'moveDate'},
        {title: 'Moved By', sortable: false, key: 'createUser'},
        {title: 'From District', sortable: false, key: 'fromDistrict'},
        {title: 'To District', sortable: false, key: 'toDistrict'},
        {title: 'From Authority', sortable: false, key: 'fromAuthority'},
        {title: 'To Authority', sortable: false, key: 'toAuthority'},
        {title: 'Old School Number', sortable: false, key: 'fromSchoolNumber'},
        {title: 'New School Number', sortable: false, key: 'toSchoolNumber'},
      ],
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
    ...mapState(appStore, ['schoolMap', 'districtMap', 'independentAuthorityMap']),

    canOnlyMoveIndependentSchools() {
      return this.independentArray.includes(this.school?.schoolCategoryCode) && this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION);
    },
    canMoveSchools() {
      return !this.independentArray.includes(this.school?.schoolCategoryCode) && this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_SCHOOL_PERMISSION);
    }
  },
  watch: {
    notification(notificationData) {
      if (notificationData) {
        if (notificationData.eventType === 'COPY_USERS_TO_NEW_SCHOOL' && notificationData.eventOutcome === 'USERS_TO_NEW_SCHOOL_COPIED' && notificationData.eventPayload) {
          try {
            const moveData = JSON.parse(notificationData.eventPayload);
            if (moveData.toSchool.schoolId) {
              const warningMessage = `School moved successfully. <a style="font-weight: bold" href="/institute/school/${moveData.toSchool.schoolId}/details">Click here to go to new school</a>.`;
              this.setSuccessAlert(warningMessage);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
  },
  created() {
    appStore().getInstituteCodes().then(() => this.getSchoolDetails());
  },
  methods: {
    hasRequiredPermission,
    ...mapActions(instituteStore, ['schoolMovedNotification']),
    getPageHeading() {
      let school = this.schoolMap?.get(this.schoolID);
      if (school) {
        return school?.mincode + ' - ' + school?.schoolName;
      }
    },
    getSchoolDetails() {
      this.school = '';
      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.school = response.data;
          this.schoolMoveDataFormatted = this.formatSchoolMoveData(response.data.schoolMove);
          this.getDistrictDetails(this.school.districtId);
          this.school.status = getStatusAuthorityOrSchool(this.school);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    formatSchoolMoveData(schoolMoveData) {
      return schoolMoveData.map((schoolMoveItem => {
        return {
          moveDate: this.formatDate(schoolMoveItem.moveDate),
          createUser: schoolMoveItem.createUser,
          ...this.formatSchoolData(schoolMoveItem.fromSchoolId, 'from'),
          ...this.formatSchoolData(schoolMoveItem.toSchoolId, 'to'),
        };
      }));
    },
    formatSchoolData(schoolUUID, moveDirection) {
      let school = this.schoolMap.get(schoolUUID);
      let districtName = '';
      let authorityName = '';

      if (school.districtID) {
        districtName = `${this.districtMap.get(school.districtID).districtNumber} - ${this.districtMap.get(school.districtID).name}`;
      }

      if (school.authorityID) {
        authorityName = `${this.independentAuthorityMap.get(school.authorityID).authorityNumber} - ${this.independentAuthorityMap.get(school.authorityID).name}`;
      }

      return {
        [`${moveDirection}District`]: districtName,
        [`${moveDirection}Authority`]: authorityName,
        [`${moveDirection}SchoolNumber`]: school.schoolNumber
      };
    },
    back() {
      router.push(`/institute/school/${this.schoolID}/details`);
    },
    formatDate(datetime) {
      return formatDob(datetime.substring(0, 10), 'uuuu-MM-dd');
    },
    isMoveSchoolAllowed() {
      return this.school.status !== 'Closed' && this.school.status !== 'Never Opened' && this.school.schoolCategoryCode !== 'POST_SEC' && this.school.schoolCategoryCode !== 'OFFSHORE' && (this.canOnlyMoveIndependentSchools || this.canMoveSchools) && this.school.schoolCategoryCode !== 'YUKON';
    },
    moveSchool() {
      this.moveSchoolSheet = !this.moveSchoolSheet;
    },
    getDistrictDetails(districtId) {
      this.district = '';
      ApiService.apiAxios.get(`${Routes.cache.DISTRICT_DATA_URL}/${districtId}`)
        .then(response => {
          this.district = response.data;
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
  :deep(.v-data-table-footer) {
    display: none;
  }
</style>

