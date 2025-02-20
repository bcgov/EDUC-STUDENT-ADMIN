<template>
  <div class="full-width">
    <v-row>
      <v-col
        cols="11"
        class="ml-10"
      >
        <DistrictHistoryDetailHeader
          :district-history="currentSelectedHistory"
          :row-number="rowNumber"
          :previous-disabled="previousDisabled"
          :next-disabled="nextDisabled"
          @next="clickNext"
          @previous="clickPrevious"
        />

        <DistrictHistoryDetail :district-history="currentSelectedHistory">
          <v-card-actions class="pb-2">
            <v-spacer />
            <PrimaryButton
              id="closePanel"
              class="mx-1"
              text="Close"
              @click-action="closePanel"
            />
          </v-card-actions>
        </DistrictHistoryDetail>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import PrimaryButton from '../../util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';
import DistrictHistoryDetail from './DistrictHistoryDetail.vue';
import DistrictHistoryDetailHeader from '@/components/institute/district/DistrictHistoryDetailHeader.vue';

export default {
  name: 'DistrictHistoryDetailPanel',
  components: {
    DistrictHistoryDetailHeader,
    PrimaryButton,
    DistrictHistoryDetail
  },
  mixins: [alertMixin],
  props: {
    nextDistrictHistory: {
      type: Array,
      required: true
    },
    districtHistory: {
      type: Object,
      required: true
    },
    districtHistoryId: {
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
      return this.rowNumber >= this.districtHistory?.content?.length - 1;
    },
  },
  watch: {
    districtHistoryId(newValue) {
      this.districtHistory.content.forEach((item, idx) => {
        if (item.districtHistoryId === newValue) {
          this.currentSelectedHistory = item;
          this.rowNumber = idx;
        }
      });
    }
  },
  created() {
    this.districtHistory.content.forEach((item, idx) => {
      if (item.districtHistoryId === this.districtHistoryId) {
        this.currentSelectedHistory = item;
        this.rowNumber = idx;
      }
    });
  },
  methods: {
    clickPrevious() {
      if (this.rowNumber > 0) {
        this.rowNumber -= 1;
        this.currentSelectedHistory = this.districtHistory?.content[this.rowNumber];
        this.$emit('update-panel', this.currentSelectedHistory?.districtHistoryId);
      }
    },
    closePanel(){
      this.$emit('close-panel');
    },
    clickNext() {
      if (this.rowNumber < this.districtHistory?.content?.length - 1) {
        this.rowNumber += 1;
        this.currentSelectedHistory = this.districtHistory?.content[this.rowNumber];
        this.$emit('update-panel', this.currentSelectedHistory?.districtHistoryId);
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
