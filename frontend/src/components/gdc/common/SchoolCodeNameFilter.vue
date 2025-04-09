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
import {LocalDateTime} from '@js-joda/core';

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
      let now = LocalDateTime.now();

      this.schoolsCacheMap.forEach(school => {
        if (school.schoolCategoryCode !== 'PUBLIC') {
          return;
        }
        if (!school.canIssueTranscripts) {
          return;
        }
        if (!school.openedDate) {
          return;
        }

        let openDate = LocalDateTime.parse(school.openedDate);
        let endOfCloseDateGraceWindow = school.closedDate ? LocalDateTime.parse(school.closedDate).plusMonths(3) : null;

        if (now.isBefore(openDate)) {
          return;
        }
        if((endOfCloseDateGraceWindow !== null) && now.isAfter(endOfCloseDateGraceWindow)) {
          return;
        }

        let schoolItem = {
          schoolCodeName: `${school.mincode} - ${school.schoolName}`,
          schoolID: school.schoolID,
          status: getStatusAuthorityOrSchool(school)
        };
        this.schoolSearchNames.push(schoolItem);
      });
    },
  },
};
</script>
