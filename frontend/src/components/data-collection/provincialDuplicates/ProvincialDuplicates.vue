<template>
  <v-card>
    <v-card-title class="sheetHeader">
      <v-row no-gutters>
        Provincial Duplicates
        <v-spacer />
        <v-btn
          id="cancel"
          color="white"
          text="Close"
          size="30"
          icon="mdi-close"
          variant="tonal"
          @click="$emit('close-sheet')"
        />
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row v-if="isLoading">
        <v-col>
          <Spinner />
        </v-col>
      </v-row>
      <div
        v-else
      >
        <v-tabs
          v-model="tab"
          color="#38598a"
          show-arrows
        >
          <v-tab
            v-for="name in tabs"
            :key="name"
            class="divider"
            :value="name"
          >
            {{ name }} {{ name === 'Enrollment Duplicates' ? '(' + nonAllowableDuplicates?.length + ')': '(' + nonAllowableProgramDuplicates?.length + ')' }}
          </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item
            value="Enrollment Duplicates"
            transition="false"
            reverse-transition="false"
          >
            <DuplicateTab
              v-if="tab==='Enrollment Duplicates'"
              duplicate-type="enrollment"
              :non-allowable-duplicates="nonAllowableDuplicates"
            />
          </v-window-item>
          <v-window-item
            value="Program Duplicates"
            transition="false"
            reverse-transition="false"
          >
            <DuplicateTab
              v-if="tab==='Program Duplicates'"
              duplicate-type="program"
              :non-allowable-duplicates="nonAllowableProgramDuplicates"
            />
          </v-window-item>
        </v-window>
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
import {defineComponent} from 'vue';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '../../common/Spinner.vue';
import DuplicateTab from './DuplicateTab.vue';

export default defineComponent({
  name: 'ProvincialDuplicates',
  components: {
    DuplicateTab,
    Spinner
  },
  mixins: [alertMixin],
  props: {
    sdcDuplicates: {
      type: Object,
      required: false,
      default: null
    },
    defaultTab: {
      type: String,
      default: 'Enrollment Duplicates'
    }
  },
  emits: ['close-sheet'],
  data() {
    return {
      nonAllowableDuplicates: [],
      nonAllowableProgramDuplicates: [],
      isLoading: false,
      tab: this.defaultTab,
      tabs: [
        'Enrollment Duplicates',
        'Program Duplicates'
      ],
    };
  },
  async created() {
    await this.setDuplicateVariables(this.sdcDuplicates);
  },
  methods: {
    setDuplicateVariables(sdcDuplicates) {
      this.nonAllowableDuplicates = sdcDuplicates.enrollmentDuplicates;
      this.nonAllowableProgramDuplicates = sdcDuplicates.programDuplicates;
    }
  }
});
</script>
<style scoped>
.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}
</style>
