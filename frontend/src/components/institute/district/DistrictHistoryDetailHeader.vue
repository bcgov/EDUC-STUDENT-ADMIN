<template>
  <div
    id="historyDetailHeader"
    class="pt-3 pl-2"
  >
    <span id="headerLabel">Changed by</span>
    <span id="headerUser">{{
      districtHistory.updateUser
    }}</span>
    <span id="headerUpdateDate">{{
      frontEndDateFormat(districtHistory.updateDate)
    }}</span>
    <span id="headerUpdateTime">at {{
      frontEndTimeFormat(districtHistory.updateDate)
    }}</span>
    <span class="float-right mt-n2">
      <v-btn
        id="previousHistoryDetail"
        :disabled="previousDisabled"
        class="mr-3"
        dark
        icon="mdi-arrow-left-bold"
        size="small"
        @click="clickPrevious"
      />
      <v-btn
        id="nextHistoryDetail"
        :disabled="nextDisabled"
        class="mr-2"
        dark
        size="small"
        icon="mdi-arrow-right-bold"
        @click="clickNext"
      />
    </span>
  </div>
</template>

<script>

import alertMixin from '@/mixins/alertMixin';
import moment from 'moment';

export default {
  name: 'HistoryDetailHeader',
  mixins: [alertMixin],
  props: {
    districtHistory: {
      type: Object,
      required: true
    },
    rowNumber: {
      type: Number,
      required: true
    },
    previousDisabled: {
      type: Boolean,
      required: true
    },
    nextDisabled: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    clickPrevious() {
      if (!this.previousDisabled) {
        this.$emit('previous');
      }
    },
    clickNext() {
      if (!this.nextDisabled) {
        this.$emit('next');
      }
    },
    frontEndDateFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
    },
    frontEndTimeFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('HH:mm:ss');
    },
  }
};
</script>

<style scoped>

div#historyDetailHeader {
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
