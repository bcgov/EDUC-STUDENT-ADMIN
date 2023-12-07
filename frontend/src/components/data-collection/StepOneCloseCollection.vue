<template>
  <v-container
      class="containerSetup"
      fluid
  >
    <v-form
        ref="closeForm"
        v-model="validForm"
    >
      <div class="border">
      <v-row>
        <v-col class="mb-3 d-flex justify-center">
          <span>The next collection will open when the current collection is closed. Please confirm the information for the next collection.</span>
        </v-col>
      </v-row>
      <v-row class="justify-center">
        <v-col cols="6">
          <v-select
              id="collectionTypeField"
              v-model="newCollection.collectionType"
              :rules="[rules.required()]"
              :items="collectionTypes"
              item-title="label"
              variant="underlined"
              class="pt-0"
              label="Next Collection"
              @update:model-value="calculateSnapshotDate"
          />
        </v-col>
      </v-row>
      <v-row class="justify-center">
        <v-col cols="6">
          <DatePicker
              id="snapshotDateField"
              v-model="newCollection.snapshotDate"
              :model-value="newCollection.snapshotDate"
              :disabled-week-days="[0, 6]"
              label="Snapshot Date"
              :rules="[rules.required()]"
              model-type="yyyy-MM-dd'T'00:00:00"
              @update:model-value="calculateSubmissionDate"
          />
        </v-col>
      </v-row>
      <v-row class="justify-center">
        <v-col cols="6">
          <DatePicker
              id="submissionDueDateField"
              v-model="newCollection.submissionDueDate"
              :model-value="newCollection.submissionDueDate"
              :disabled-week-days="[0, 6]"
              :min-date="newCollection.snapshotDate"
              label="Submission Due Date"
              :rules="[rules.required()]"
              model-type="yyyy-MM-dd'T'00:00:00"
              @update:model-value="calculateAdminDates"
              @clear-date=""
          />
        </v-col>
      </v-row>
      <v-row class="justify-center">
        <v-col cols="6">
          <DatePicker
              id="duplicateResolutionDateField"
              v-model="newCollection.duplicationResolutionDueDate"
              :model-value="newCollection.duplicationResolutionDueDate"
              :disabled-week-days="[0, 6]"
              :min-date="newCollection.submissionDueDate"
              label="Duplicate Resolution Due Date"
              :rules="[rules.required()]"
              model-type="yyyy-MM-dd'T'00:00:00"
          />
        </v-col>
      </v-row>
      <v-row class="justify-center">
        <v-col cols="6">
          <DatePicker
              id="signoffDueDateField"
              v-model="newCollection.signoffDueDate"
              :model-value="newCollection.signoffDueDate"
              :disabled-week-days="[0, 6]"
              :min-date="newCollection.duplicationResolutionDueDate"
              label="Sign-Off Due Date"
              :rules="[rules.required()]"
              model-type="yyyy-MM-dd'T'00:00:00"
          />
        </v-col>
      </v-row>
      </div>
      <v-row class="justify-end pr-3">
        <PrimaryButton
            id="closeCollectionButton"
            text="Close Collection"
            :disabled="!validForm"
            @click-action="next"
        />
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import { mapState, mapActions } from 'pinia';
import Spinner from '../common/Spinner.vue';
import {collectionStore} from "@/store/modules/collection";
import * as Rules from '@/utils/institute/formRules';
import {appStore} from "@/store/modules/app";
import {formatCollectionTypeCode} from "@/utils/format"
import {findUpcomingDate} from "@/utils/dateHelpers.js"
import DatePicker from "@/components/util/DatePicker.vue";
import {DateTimeFormatter, DayOfWeek, LocalDate, TemporalAdjusters} from "@js-joda/core";

export default {
  name: 'StepOneCloseCollection',
  components: {
    DatePicker,
    Spinner,
    PrimaryButton
  },
  emits: ['next', 'refreshStore'],
  data() {
    return {
      requiredRules: [v => !!v || 'Required'],
      datePattern: 'yyyy-MM-dd\'T\'HH:mm:ss',
      isDisabled: true,
      validForm: false,
      rules: Rules,
      collectionTypesMap: new Map(),
      collectionTypes: [],
      closingCollectionObject: {},
      newCollection: {
        collectionType: null,
        snapshotDate: null,
        submissionDueDate: null,
        duplicationResolutionDueDate: null,
        signoffDueDate: null
      }
    };
  },
  computed: {
    ...mapState(appStore, ['collectionTypeCodesMap']),
    ...mapState(collectionStore, ['currentStepInCollectionClosureProcess', 'activeCollection']),
  },
  async created() {
    await appStore().getCodes().then(() => {
        this.collectionTypesMap = this.collectionTypeCodesMap;
        this.collectionTypesMap.forEach((type) => {
          this.collectionTypes.push(type['label']);
        });
      });

    await collectionStore().getActiveCollection().then(() => {
      this.closingCollectionObject = this.activeCollection;
      this.isLoading = !this.isLoading;
    });

    let formattedClosingCollectionType = formatCollectionTypeCode(this.closingCollectionObject['collectionTypeCode']);
      let indexOfType = this.collectionTypes.indexOf(formattedClosingCollectionType);
      this.newCollection.collectionType = indexOfType === this.collectionTypes.length - 1 ? this.collectionTypes[0] : this.collectionTypes[indexOfType + 1];

      await this.calculateSnapshotDate();
  },
  methods: {
    ...mapActions(collectionStore, ['setActiveCollection']),

    next() {
      if(this.currentStepInCollectionClosureProcess.isComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },

    async calculateSnapshotDate(){
      let newSnapshotDate = LocalDate.parse(this.collectionTypeCodesMap.get(this.newCollection.collectionType.toUpperCase()).snapshotDate);
      this.newCollection.snapshotDate = findUpcomingDate(newSnapshotDate.month(), newSnapshotDate.dayOfMonth()).toString();

      await this.calculateSubmissionDate();
    },

    async calculateSubmissionDate(){
      let newSubmissionDate= LocalDate.parse(this.newCollection.snapshotDate, DateTimeFormatter.ofPattern(this.datePattern));
      let weekLater = newSubmissionDate.plusWeeks(1);
      this.newCollection.submissionDueDate = weekLater.with(TemporalAdjusters.nextOrSame(DayOfWeek.FRIDAY)).atStartOfDay().format(DateTimeFormatter.ofPattern(this.datePattern));

      await this.calculateAdminDates();
    },

    calculateAdminDates(){
      let baseDate = LocalDate.parse(this.newCollection.submissionDueDate, DateTimeFormatter.ofPattern(this.datePattern));

      let twoWeeksLater = baseDate.plusWeeks(2);
      this.newCollection.duplicationResolutionDueDate = twoWeeksLater.atStartOfDay().format(DateTimeFormatter.ofPattern(this.datePattern));

      let threeWeeksLater = baseDate.plusWeeks(3);
      this.newCollection.signoffDueDate = threeWeeksLater.atStartOfDay().format(DateTimeFormatter.ofPattern(this.datePattern));

      this.fireFormValidate();
    },

    markStepAsComplete() {
      //TODO: insert API call to open new collection endpoint here
    },

    async fireFormValidate() {
      await this.$nextTick();
      this.validateForm();
    },

    async validateForm() {
      await this.$nextTick();
      const isValid = await this.$refs.closeForm.validate();
      this.validForm = isValid.valid;
    },

  }
};
</script>

<style scoped>
.containerSetup{
  padding-right: 5em !important;
  padding-left: 5em !important;
}

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}

:deep(.mdi-information){
  color: #003366;
}
</style>
