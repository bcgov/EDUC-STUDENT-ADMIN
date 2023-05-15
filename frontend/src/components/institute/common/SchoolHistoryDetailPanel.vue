<template>
  <div class="full-width">
    <v-row>
      <v-col cols="11" class="ml-10">
        <HistoryDetailHeader :schoolHistory="currentSelectedHistory" :rowNumber="rowNumber"
          :previousDisabled="previousDisabled" :nextDisabled="nextDisabled" @next="clickNext" @previous="clickPrevious">
        </HistoryDetailHeader>
  
        <SchoolHistoryDetail :schoolHistory="currentSelectedHistory">
          <v-card-actions class="pb-2">
            <v-spacer></v-spacer>
            <PrimaryButton id="closePanel" class="mx-1" text="Close" @click.native="$emit('close')"></PrimaryButton>
          </v-card-actions>
        </SchoolHistoryDetail>
      </v-col>
    </v-row>
  </div>
</template>
  
<script>
  
import PrimaryButton from '../../util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import HistoryDetailHeader from './HistoryDetailHeader.vue';
import SchoolHistoryDetail from './SchoolHistoryDetail.vue';
export default {
  name: 'SchoolHistoryDetailPanel',
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
    schoolHistoryId: {
      type: String,
      required: true
    },
  },
  components: {
    HistoryDetailHeader,
    PrimaryButton,
    SchoolHistoryDetail
  },
  data() {
    return {
      currentSelectedHistory: null,
      rowNumber: 0,
    };
  },
  created() {
    this.schoolHistory.content.forEach((item, idx) => {
      if (item.schoolHistoryId === this.schoolHistoryId) {
        this.currentSelectedHistory = item;
        this.rowNumber = idx;
      }
    });
  },
  watch: {
    schoolHistoryId(newValue) {
      this.schoolHistory.content.forEach((item, idx) => {
        if (item.schoolHistoryId === newValue) {
          this.currentSelectedHistory = item;
          this.rowNumber = idx;
        }
      });
    }
  },
  computed: {
    previousDisabled() {
      return this.rowNumber <= 0;
    },
    nextDisabled() {
      return this.rowNumber >= this.schoolHistory?.content?.length - 1;
    },
  },
  methods: {
    clickPrevious() {
      if (this.rowNumber > 0) {
        this.rowNumber -= 1;
        this.currentSelectedHistory = this.schoolHistory?.content[this.rowNumber];
        this.$emit('update', this.currentSelectedHistory?.schoolHistoryId);
      }
    },
    clickNext() {
      if (this.rowNumber < this.schoolHistory?.content?.length - 1) {
        this.rowNumber += 1;
        this.currentSelectedHistory = this.schoolHistory?.content[this.rowNumber];
        this.$emit('update', this.currentSelectedHistory?.schoolHistoryId);
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
