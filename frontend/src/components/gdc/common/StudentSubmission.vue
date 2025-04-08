<template>
  <v-card class="filter-card mx-auto">
    <v-card-title class="sheetHeader pt-1 pb-1">
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Student Submission
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="close()"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />

    <v-card-text>
      <v-row>
        <v-col>
          <h4>Below is a list of submissions for the student</h4>
        </v-col>
      </v-row>
      <v-list
        v-model:selected="selected"
        :items="submittedStudentRecord"
        mandatory
        @update:selected="refreshSearch"
      >
        <v-row class="heading">
          <v-col cols="5">
            Submission Date
          </v-col>
          <v-col>
            Upload User
          </v-col>
        </v-row>
        <v-list-item
          v-for="(item, index) in submittedStudentRecord"
          :key="index"
          :value="item"
          active-class="active"
        >
          <v-row>
            <v-col cols="3">
              {{ item.createDate }}
            </v-col>
            <v-col cols="2">
              {{ item.createTime }}
            </v-col>
            <v-col>{{ item.updateUser }}</v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
  
<script>
import alertMixin from '../../../mixins/alertMixin';
import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';
import {formatDateTime} from '@/utils/format';

export default {
  name: 'StudentSubmission',
  components: {
  },
  mixins: [alertMixin],
  props: {
    submissions: {
      type: Array,
      required: true,
      default: null
    },
    selectedSubmission: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: ['close', 'refreshSearch'],
  data() {
    return {
      submittedStudentRecord:[],
      selected: null
    };
  },
  watch : {
    submissions: {
      handler(value) {
        if(value.length > 0) {
          this.handleSubmissionData(value);
        }
      },
      immediate: true
    },
  },
  methods: {
    handleSubmissionData(value) {
      this.submittedStudentRecord = value.map(fileset => {
        let createDate =  formatDateTime(fileset.createDate.substring(0, 19),'uuuu-MM-dd\'T\'HH:mm:ss','uuuu/MM/dd', false);
        let createTime = LocalDateTime.parse(fileset.createDate).format(DateTimeFormatter.ofPattern('HH:mm'));
        return {
          incomingFilesetID: fileset.incomingFilesetID,
          createDate: createDate,
          createTime: createTime,
          updateUser: fileset.updateUser
        };
      });
      this.selected = this.setActiveRecord(this.selectedSubmission);
    },
    close() {
      this.$emit('close');
    },
    setActiveRecord(selectedItem) {
      return this.submittedStudentRecord.filter(submission => submission.incomingFilesetID === selectedItem.incomingFilesetID);
    },
    refreshSearch() {
      this.$emit('refreshSearch', this.selected);
    }
    
  }
};
</script>
    
<style scoped>
/deep/ .active {
  color: white;
  background-color: #38598a;
}

.heading {
color: grey;
padding-left: 1rem;
padding-bottom: 10px;
}
</style>
