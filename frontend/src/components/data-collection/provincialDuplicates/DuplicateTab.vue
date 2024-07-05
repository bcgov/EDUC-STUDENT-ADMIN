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

    <v-data-iterator
      :items="nonAllowableDuplicates"
      :items-per-page="10"
      v-model:page.sync="pageNumber"
    >
      <template v-slot:default="{ items }">
        <v-row
          v-for="duplicate in items"
          :key="duplicate?.raw?.sdcDuplicateID"
          class="pt-4"
          no-gutters
        >
        <v-col class="pa-0">

          <v-row no-gutters>
            <v-col class="pb-2">
              <v-chip color="primary">
                <v-col>Assigned PEN: {{ duplicate?.raw?.sdcSchoolCollectionStudent1Entity?.assignedPen }}</v-col>
                <v-col
                  v-if="duplicateType==='enrollment'"
                >
                  Error: {{ duplicate?.raw?.duplicateErrorDescriptionCode }}
                </v-col>
                <v-col v-else>
                  Duplicate Program: {{ duplicate?.raw?.programDuplicateTypeCodeDescription }}
                </v-col>
              </v-chip>
            </v-col>
          </v-row>

          <CustomTable
          :headers="PROVINCIAL_DUPLICATES.nonAllowableTableHeaders"
          :data="[duplicate?.raw?.sdcSchoolCollectionStudent1Entity, duplicate?.raw?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        >
          <template #resolution="{ sdcSchoolCollectionStudent }">
            <v-menu
              v-model="editOptionsOpen[sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.raw.sdcDuplicateID]"
              transition="fab-transition"
              location="end"
              offset="10"
            >
              <template #activator="{ props }">
                <v-btn
                  :id="'resolve' + duplicateType +'MenuBtn' + sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.raw.sdcDuplicateID"
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
                  @click="changeGrade(sdcSchoolCollectionStudent, duplicate.raw)"
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
                  @click="resolveProgramDuplicate(duplicate.raw)"
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
                  @click="resolveEnrollmentDuplicateViaRemove(duplicate.raw, sdcSchoolCollectionStudent)"
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
      </template>
    </v-data-iterator>
    <v-pagination
      v-if="nonAllowableDuplicates.length > 0"
      v-model="pageNumber"
      :length="Math.ceil(nonAllowableDuplicates.length/10)"
      total-visible="5"
      rounded="circle"
    ></v-pagination>
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
    <v-data-iterator
      :items="allowableDuplicates"
      :items-per-page="10"
      v-model:page.sync="pageNumber"
    >
      <template v-slot:default="{ items }">
        <v-row
          v-for="duplicate in items"
          :key="duplicate?.raw?.sdcDuplicateID"
          class="pt-4"
          no-gutters
        >
          <v-col class="pa-0">

            <v-row no-gutters>
              <v-col class="pb-2">
                <v-chip color="primary">
                  <v-col>Assigned PEN: {{ duplicate?.raw?.sdcSchoolCollectionStudent1Entity?.assignedPen }}</v-col>
                </v-chip>
              </v-col>
            </v-row>

            <CustomTable
              :headers="PROVINCIAL_DUPLICATES.allowableTableHeaders"
              :data="[duplicate?.raw?.sdcSchoolCollectionStudent1Entity, duplicate?.raw?.sdcSchoolCollectionStudent2Entity]"
              :is-loading="false"
              :reset="false"
              :total-elements="2"
              :hide-pagination="true"
            />
          </v-col>
        </v-row>
     </template>
    </v-data-iterator>

    <v-pagination
      v-if="allowableDuplicates.length > 0"
      v-model="pageNumber"
      :length="Math.ceil(allowableDuplicates.length/10)"
      total-visible="5"
      rounded="circle"
    ></v-pagination>
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
    <v-data-iterator
      :items="resolvedDuplicates"
      :items-per-page="10"
      v-model:page.sync="pageNumber"
    >
      <template v-slot:default="{ items }">
        <v-row
          v-for="duplicate in items"
          :key="duplicate?.raw?.sdcDuplicateID"
          class="pt-4"
          no-gutters
        >
        <v-col class="pa-0">

          <v-row no-gutters>
            <v-col class="pb-2">
              <v-chip color="primary">
                <v-col>Assigned PEN: {{ duplicate?.raw?.sdcSchoolCollectionStudent1Entity?.assignedPen }}</v-col>
              </v-chip>
            </v-col>
          </v-row>

          <CustomTable
          :headers="PROVINCIAL_DUPLICATES.resolvedTableHeaders"
          :data="[duplicate?.raw?.sdcSchoolCollectionStudent1Entity, duplicate?.raw?.sdcSchoolCollectionStudent2Entity]"
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
      </template>
    </v-data-iterator>

    <v-pagination
      v-if="resolvedDuplicates.length > 0"
      v-model="pageNumber"
      :length="Math.ceil(resolvedDuplicates.length/10)"
      total-visible="5"
      rounded="circle"
    ></v-pagination>

    
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
   <ChangeGrade
      :selected-student="selectedSdcSchoolCollectionStudent"
      :selected-duplicate="selectedDuplicate"
      @close="openChangeGradeView = !openChangeGradeView"
      @close-refresh="closeAndRefreshDuplicates()"  
    />
  </v-bottom-sheet>
  <EnrollmentDuplicateResolveViaRemove
    ref="resolveEnrollmentDuplicateViaRemoveStudent"
    @close-refresh="closeAndRefreshDuplicates()"
  />
</template>
<script>
import {defineComponent} from 'vue';
import CustomTable from '../../common/CustomTable.vue';
import {PROVINCIAL_DUPLICATES} from '@/utils/sdc/collectionTableConfiguration';
import ProgramDuplicateResolution from './ProgramDuplicateResolution.vue';
import EnrollmentDuplicateResolveViaRemove from './EnrollmentDuplicateResolveViaRemove.vue';
import ChangeGrade from './ChangeGrade.vue';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';

export default defineComponent({
  name: 'DuplicateTab',
  components: {
    EnrollmentDuplicateResolveViaRemove,
    CustomTable,
    ProgramDuplicateResolution,
    ChangeGrade
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
      openChangeGradeView: false,
      selectedDuplicate: {},
      selectedSdcSchoolCollectionStudent: {},
      pageNumber: 1
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
      this.$refs.resolveEnrollmentDuplicateViaRemoveStudent.removeAndResolveStudent(duplicate, sdcSchoolCollectionStudent);
    },
    closeAndRefreshDuplicates() {
      this.openProgramResolutionView = false;
      this.openChangeGradeView = false;
      this.$emit('refresh-duplicates');
    },
    async changeGrade(sdcSchoolCollectionStudent, duplicate) {
      this.selectedSdcSchoolCollectionStudent = sdcSchoolCollectionStudent;
      this.selectedDuplicate = duplicate;
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
