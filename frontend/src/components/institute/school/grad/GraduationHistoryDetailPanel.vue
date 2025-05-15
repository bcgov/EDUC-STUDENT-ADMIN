<template>
  <div class="full-width">
    <v-row>
      <v-col
        cols="11"
        class="ml-10"
      >
        <HistoryDetailHeader
          :school-history="currentSelectedHistory"
          :row-number="rowNumber"
          :previous-disabled="previousDisabled"
          :next-disabled="nextDisabled"
          @next="clickNext"
          @previous="clickPrevious"
        />

        <GraduationHistoryDetail :school-history="currentSelectedHistory">
          <v-card-actions class="pb-2">
            <v-spacer />
            <PrimaryButton
              id="closePanel"
              class="mx-1"
              text="Close"
              @click-action="closePanel"
            />
          </v-card-actions>
        </GraduationHistoryDetail>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import PrimaryButton from '../../../util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';
import HistoryDetailHeader from '../../common/HistoryDetailHeader.vue';
import GraduationHistoryDetail from './GraduationHistoryDetail.vue';

export default {
  name: 'GraduationHistoryDetailPanel',
  components: {
    HistoryDetailHeader,
    PrimaryButton,
    GraduationHistoryDetail
  },
  mixins: [alertMixin],
  props: {
    nextSchoolHistory: {
      type: Array,
      required: true
    },
    schoolHistory: {
      type: Object,
      required: true
    },
    gradSchoolHistoryID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      currentSelectedHistory: null,
      rowNumber: 0,
    };
  },
  computed: {
    previousDisabled() {
      return this.rowNumber <= 0;
    },
    nextDisabled() {
      return this.rowNumber >= this.schoolHistory?.content?.length - 1;
    },
  },
  watch: {
    gradSchoolHistoryID(newValue) {
      this.schoolHistory.content.forEach((item, idx) => {
        if (item.gradSchoolHistoryID === newValue) {
          this.currentSelectedHistory = item;
          this.rowNumber = idx;
        }
      });
    }
  },
  created() {
    this.schoolHistory.content.forEach((item, idx) => {
      if (item.gradSchoolHistoryID === this.gradSchoolHistoryID) {
        this.currentSelectedHistory = item;
        this.rowNumber = idx;
      }
    });
  },
  methods: {
    clickPrevious() {
      if (this.rowNumber > 0) {
        this.rowNumber -= 1;
        this.currentSelectedHistory = this.schoolHistory?.content[this.rowNumber];
        this.$emit('update-panel', this.currentSelectedHistory?.gradSchoolHistoryID);
      }
    },
    closePanel(){
      this.$emit('close-panel');
    },
    clickNext() {
      if (this.rowNumber < this.schoolHistory?.content?.length - 1) {
        this.rowNumber += 1;
        this.currentSelectedHistory = this.schoolHistory?.content[this.rowNumber];
        this.$emit('update-panel', this.currentSelectedHistory?.gradSchoolHistoryID);
      }
    },
  }
};
</script>

<style scoped>

div#auditHistoryDetailHeader {
    background-color: rgb(56, 89, 138);
    color: white;
    height: 50px;
}

span#headerLabel {
    margin-top: 5px;
    margin-left: 5px;
    font-weight: bold;
}

span#headerUser {
    margin-top: 10px;
    margin-left: 5px;
}

span#headerUpdateDate {
    margin-top: 10px;
    margin-left: 8px;
    font-size: 14px;
}

span#headerUpdateTime {
    margin-top: 10px;
    margin-left: 6px;
    font-size: 14px;
}

#previousHistoryDetail.v-btn--disabled .v-icon,
#nextHistoryDetail.v-btn--disabled .v-icon {
    background-color: rgba(255, 255, 255, 0.80) !important;
    color: white !important;
    border-radius: 50%;
}

</style>
