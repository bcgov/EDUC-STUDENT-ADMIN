<template>
  <v-row class="mt-3 pb-3 pl-3">
    <strong>Duplicate Students Found: {{ nonAllowableDuplicates?.length }}</strong>
  </v-row>
  <v-data-iterator
    v-model:page.sync="pageNumber"
    :items="nonAllowableDuplicates"
    :items-per-page="10"
  >
    <template #default="{ items }">
      <v-row
        v-for="duplicate in items"
        :key="duplicate.sdcDuplicateID"
        class="pt-4"
        no-gutters
      >
        <v-col class="pa-0">
          <v-row no-gutters>
            <v-col class="pb-2">
              <v-chip color="primary">
                <v-col>Assigned PEN: {{ duplicate.raw.sdcSchoolCollectionStudent1Entity.assignedPen }}</v-col>
                <v-col
                  v-if="duplicateType==='enrollment'"
                >
                  Error: {{ duplicate.raw.duplicateErrorDescriptionCode }}
                </v-col>
                <v-col v-else>
                  Duplicate Program: {{ duplicate.raw.programDuplicateTypeCodeDescription }}
                </v-col>
              </v-chip>
            </v-col>
          </v-row>
          <CustomTable
            :headers="PROVINCIAL_DUPLICATES.nonAllowableTableHeaders"
            :data="[duplicate.raw.sdcSchoolCollectionStudent1Entity, duplicate.raw.sdcSchoolCollectionStudent2Entity]"
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
    v-if="nonAllowableDuplicates?.length > 0"
    v-model="pageNumber"
    :length="Math.ceil(nonAllowableDuplicates?.length/10)"
    total-visible="5"
    rounded="circle"
  />
  <v-row
    v-if="nonAllowableDuplicates?.length === 0"
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
<script>
import {defineComponent} from 'vue';
import CustomTable from '../../common/CustomTable.vue';
import {PROVINCIAL_DUPLICATES} from '@/utils/sdc/collectionTableConfiguration';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';

export default defineComponent({
  name: 'DuplicateTab',
  components: {
    CustomTable
  },
  props: {
    duplicateType: {
      type: String,
      required: true
    },
    nonAllowableDuplicates: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
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
});
</script>
<style scoped>
</style>
