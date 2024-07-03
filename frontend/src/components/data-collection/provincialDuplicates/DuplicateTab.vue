<template>
  <v-row class="mt-3 mb-3 pl-3">
    <v-btn-toggle
      v-model="duplicateView"
      color="#003366"
      rounded="0"
      :divided="true"
    >
      <v-btn
        :id="'nonAllowable' + duplicateType + 'Button'"
        value="1"
        size="large"
        class="duplicate-type-button"
      >
        Non-Allowable ({{ nonAllowableDuplicates.length }})
      </v-btn>
      <v-btn
        v-if="allowableDuplicates"
        id="allowableButton"
        value="2"
        size="large"
        class="duplicate-type-button"
      >
        Allowable ({{ allowableDuplicates.length }})
      </v-btn>
      <v-btn
        :id="'resolved' + duplicateType + 'Button'"
        value="3"
        size="large"
        class="duplicate-type-button"
      >
        Resolved ({{ resolvedDuplicates.length }})
      </v-btn>
    </v-btn-toggle>
  </v-row>
  <template v-if="duplicateView==='1'">
    <strong>Duplicate Students Found: {{ nonAllowableDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in nonAllowableDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}</v-col>
              <v-col
                v-if="duplicateType==='enrollment'"
              >
                Error: {{ duplicate.duplicateErrorDescriptionCode }}
              </v-col>
              <v-col v-else>
                Duplicate Program: {{ duplicate.programDuplicateTypeCodeDescription }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="PROVINCIAL_DUPLICATES.nonAllowableTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        >
          <template #resolution="{ sdcSchoolCollectionStudent }">
            <v-menu
              v-model="editOptionsOpen[sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.sdcDuplicateID]"
              transition="fab-transition"
              location="end"
              offset="10"
            >
              <template #activator="{ props }">
                <v-btn
                  :id="'resolve' + duplicateType +'MenuBtn' + sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.sdcDuplicateID"
                  color="primary"
                  icon="mdi-playlist-edit"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <v-list>
                <v-list-item 
                  v-if="sdcSchoolCollectionStudent.canChangeGrade"
                  id="change-grade"
                  @click="changeGrade(sdcSchoolCollectionStudent, duplicate)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-pencil
                  </v-icon>
                  <span class="ml-2">Change Grade</span>
                </v-list-item>
                <v-list-item
                  v-if="duplicateType === 'program'"
                  id="resolve"
                  @click="resolveProgramDuplicate(duplicate)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-check
                  </v-icon>
                  <span class="ml-2">Resolve</span>
                </v-list-item>
                <v-list-item
                  v-if="duplicateType === 'enrollment'"
                  id="resolveEnrollmentDuplicateViaRemove"
                  @click="resolveEnrollmentDuplicateViaRemove(duplicate, sdcSchoolCollectionStudent)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-check
                  </v-icon>
                  <span class="ml-2">Remove</span>
                </v-list-item>
                <v-list-item
                  v-if="duplicateType === 'enrollment' && sdcSchoolCollectionStudent.canMoveToCrossEnrollment"
                  id="enrollmentResolveViaRemoveAndMoveToCrossEnrollment"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-check
                  </v-icon>
                  <span class="ml-2">Remove & Move to 8/9 Cross Enrollment</span>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </CustomTable>
      </v-col>
    </v-row>
    <v-row
      v-if="nonAllowableDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'non-allowable-alert'"
        density="compact"
        type="success"
        variant="tonal"
        text="Congratulations! There are no non-allowable duplicates."
      />
    </v-row>
  </template>
  <template v-if="duplicateView==='2'">
    <strong>Duplicate Students Found: {{ allowableDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in allowableDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>
                Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="PROVINCIAL_DUPLICATES.allowableTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="allowableDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'allowable-alert'"
        density="compact"
        type="info"
        variant="tonal"
        text="There are no allowable duplicates."
      />
    </v-row>
  </template>
  <template v-if="duplicateView==='3'">
    <strong>Duplicate Students Found: {{ resolvedDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in resolvedDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>
                Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="PROVINCIAL_DUPLICATES.resolvedTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        >
          <template #resolution="{ sdcSchoolCollectionStudent }">
            <span>{{ getDuplicateResolutionDescription(duplicate.duplicateResolutionCode) }}</span>
          </template>
        </CustomTable>
      </v-col>
    </v-row>
    <v-row
      v-if="resolvedDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'resolved-alert'"
        density="compact"
        type="info"
        variant="tonal"
        text="There are no resolved duplicates."
      />
    </v-row>
  </template>
  <v-bottom-sheet
    v-model="openProgramResolutionView"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ProgramDuplicateResolution
      :selected-program-duplicate="selectedDuplicate"
      @close="openProgramResolutionView = !openProgramResolutionView"
      @close-refresh="closeAndRefreshDuplicates()"
    />
  </v-bottom-sheet>

  <v-bottom-sheet
    v-model="openChangeGradeView"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
<!--    <ChangeGrade
      :selected-student="selectedStudentForGradeChange"
      :selected-duplicate-id="selectedEnrollmentDuplicate.sdcDuplicateID"
      @close="openChangeGradeView = !openChangeGradeView"
      @close-refresh="closeAndRefreshDuplicates()"  
    />-->
  </v-bottom-sheet>
  <v-bottom-sheet
    v-model="openEnrollmentResolutionViaRemoveView"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
<!--    <EnrollmentDuplicateResolveViaRemove
      :duplicate="selectedDuplicate"
      :sdc-school-collection-student="selectedSdcSchoolCollectionStudent"
      @close="openEnrollmentResolutionViaRemoveView = !openEnrollmentResolutionViaRemoveView"
      @close-refresh="closeAndRefreshDuplicates()"
    />-->
  </v-bottom-sheet>
</template>
<script>
import {defineComponent} from 'vue';
import CustomTable from '../../common/CustomTable.vue';
import {PROVINCIAL_DUPLICATES} from '@/utils/sdc/collectionTableConfiguration';
import ProgramDuplicateResolution from './ProgramDuplicateResolution.vue';
/*import EnrollmentDuplicateResolveViaRemove from './EnrollmentDuplicateResolveViaRemove.vue';*/
/*import ChangeGrade from './ChangeGrade.vue';*/
import {sdcCollectionStore} from '@/store/modules/sdcCollection';

export default defineComponent({
  name: 'DuplicateTab',
  components: {
    /*EnrollmentDuplicateResolveViaRemove,*/
    CustomTable,
    ProgramDuplicateResolution,
    /*ChangeGrade*/
  },
  props: {
    duplicateType: {
      type: String,
      required: true
    },
    nonAllowableDuplicates: {
      type: Array,
      required: true
    },
    allowableDuplicates: {
      type: Array,
      default: null
    },
    resolvedDuplicates: {
      type: Array,
      required: true
    },
    collectionObject: {
      type: Object,
      default: null
    }
  },
  emits:['refresh-duplicates'],
  data() {
    return {
      duplicateView: '1',
      editOptionsOpen: [],
      openProgramResolutionView: false,
      selectedEnrollmentDuplicate: {},
      openEnrollmentResolutionViaRemoveView: false,
      openChangeGradeView: false,
      selectedDuplicate: {},
      selectedSdcSchoolCollectionStudent: {},
      selectedStudentForGradeChange: {}
    };
  },
  computed: {
    PROVINCIAL_DUPLICATES() {
      return PROVINCIAL_DUPLICATES;
    }
  },
  async created() {
    await sdcCollectionStore().getCodes();
  },
  methods: {
    resolveProgramDuplicate(duplicate) {
      this.selectedDuplicate = duplicate;
      this.openProgramResolutionView = !this.openProgramResolutionView;
    },
    resolveEnrollmentDuplicateViaRemove(duplicate, sdcSchoolCollectionStudent) {
      this.selectedDuplicate = duplicate;
      this.selectedSdcSchoolCollectionStudent = sdcSchoolCollectionStudent;
      this.openEnrollmentResolutionViaRemoveView = true;
    },
    closeAndRefreshDuplicates() {
      this.openProgramResolutionView = false;
      this.openEnrollmentResolutionViaRemoveView = false;
      this.openChangeGradeView = false;
      this.$emit('refresh-duplicates');
    },
    async changeGrade(sdcSchoolCollectionStudent, duplicate) {
      this.selectedStudentForGradeChange = sdcSchoolCollectionStudent;
      this.selectedEnrollmentDuplicate = duplicate;
      this.openChangeGradeView = !this.openChangeGradeView;
    },
    getDuplicateResolutionDescription(key) {
      return sdcCollectionStore().duplicateResolutionCodesMap.get(key)?.message;
    }
  }
});
</script>
<style scoped>
.duplicate-type-button {
  border: 1px solid lightgray;
}
</style>
