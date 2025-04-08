<template>
  <v-autocomplete
    id="school-code-name-filter"
    v-model="schoolCodeNameFilter"
    label="School Code & Name"
    variant="underlined"
    item-value="schoolID"
    item-title="schoolCodeName"
    autocomplete="off"
    :items="schoolSearchNames"
    clearable
    @update:model-value="handleUpdate"
  >
    <template #prepend-inner>
      <v-icon
        v-if="schoolCodeNameFilter"
        :color="getStatusColorAuthorityOrSchool(schoolSearchNames.find(school=>school.schoolID===schoolCodeNameFilter)?.status)"
      >
        mdi-circle-medium
      </v-icon>
    </template>
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        prepend-icon="mdi-circle-medium"
        :base-color="getStatusColorAuthorityOrSchool(item.raw.status)"
        title=""
      >
        <v-list-item-title style="color: black !important;">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import {getStatusAuthorityOrSchool, getStatusColorAuthorityOrSchool} from '@/utils/institute/status';
import {mapState} from 'pinia';
import {appStore} from '@/store/modules/app';

export default {
  name: 'SchoolCodeNameFilter',
  props: {
    modelValue: {
      type: [String, Number, Object],
      default: ''
    }
  },
  emits: ['update:modelValue', 'search'],
  data() {
    return {
      schoolsCacheMap: null,
      schoolSearchNames: []
    };
  },
  computed: {
    ...mapState(appStore, ['schoolMap']),

    schoolCodeNameFilter: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      }
    }
  },
  async created() {
    appStore().getInstituteCodes().finally(() => {
      this.schoolsCacheMap = this.schoolMap;
      this.getSchoolDropDownItems();
    });
  },
  methods: {
    getStatusColorAuthorityOrSchool,
    handleUpdate(value) {
      this.$emit('search', value);
    },
    getSchoolDropDownItems() {
      this.schoolSearchNames = [];
      let now = new Date();
      let currentSchoolYearStart, currentSchoolYearEnd;

      // 0 indexed for months
      if (now.getMonth() >= 9) {
        currentSchoolYearStart = new Date(now.getFullYear(), 9, 1); // October 1 of this year
        currentSchoolYearEnd = new Date(now.getFullYear() + 1, 8, 30); // September 30 of next year
      } else {
        currentSchoolYearStart = new Date(now.getFullYear() - 1, 9, 1); // October 1 of last yea
        currentSchoolYearEnd = new Date(now.getFullYear(), 8, 30); // September 30 of this year
      }

      const windowStart = new Date(currentSchoolYearStart.getFullYear() - 2, currentSchoolYearStart.getMonth(), currentSchoolYearStart.getDate());
      const windowEnd = currentSchoolYearEnd;

      this.schoolsCacheMap.forEach(school => {
        if (school.schoolCategoryCode === 'PUBLIC' && school.canIssueTranscripts === true) {
          if (!school.openedDate) {
            return;
          }

          let schoolOpened = new Date(school.openedDate);
          let schoolClosed = school.expiryDate ? new Date(school.expiryDate) : null;

          if (schoolOpened <= windowEnd && (!schoolClosed || schoolClosed >= windowStart)) {
            let schoolItem = {
              schoolCodeName: school.mincode + ' - ' + school.schoolName,
              schoolID: school.schoolID,
              status: getStatusAuthorityOrSchool(school)
            };
            this.schoolSearchNames.push(schoolItem);
          }
        }
      });
    },
  },
};
</script>
