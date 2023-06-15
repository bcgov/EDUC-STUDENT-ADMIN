<template>
   
    <v-container fluid>
      <v-row v-if="loading">
        <v-col class="d-flex justify-center">
          <v-progress-circular
              class="mt-16"
              :size="70"
              :width="7"
              color="primary"
              indeterminate
              :active="loading"
          ></v-progress-circular>
        </v-col>
      </v-row>
      <v-row v-else no-gutters>
        <v-col>                
              <v-row>
                <v-col cols="10" class="d-flex justify-start">
                  <v-timeline id="schoolNotesTimeline" dense v-if="school.notes.length > 0">
                    <div v-for="(activity) in school.notes"
                         :key="activity.noteId">
                      <v-timeline-item right icon="mdi-message-bulleted" icon-color="#003366" large color="white" >
                        <v-card width="40em">
                          <v-card-title>
                            <div class="activityTitle">{{ activity.createUser }}</div>
                            <v-spacer></v-spacer>
                            <div class="activityDisplayDate">{{ formatDate(activity.createDate.substring(0,19),'uuuu-MM-dd\'T\'HH:mm:ss', to='uuuu/MM/dd') }}</div>
                          </v-card-title>
                          <v-card-text class="activityContent">{{ activity.content }}</v-card-text>
                        </v-card>
                      </v-timeline-item>
                    </div>
                  </v-timeline>
                  <v-timeline id="schoolNotesTimeline" dense v-else>
                    <v-timeline-item right icon="mdi-message-bulleted" icon-color="#003366" large color="white" >
                      <v-card width="40em">
                        <v-card-text class="activityContent">No notes have been recorded for this school</v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </v-timeline>
                </v-col>

                <v-col cols="2" class="d-flex justify-end">
                  <PrimaryButton id="addNewNoteButton" width="9em" icon="mdi-plus" icon-left text="New Note"
                                 v-if="hasAccess" @click.native="openNoteSheet">
                  </PrimaryButton>
                </v-col>
          </v-row>
      <v-bottom-sheet
        v-model="newNoteSheet"
        inset
        no-click-animation
        scrollable
        persistent
        width="30%"
      >
        <v-card
          v-if="newNoteSheet"
          id="newNoteSheet"
          class="information-window-v-card">
          <v-card-title class="sheetHeader pt-1 pb-1">New Note</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row>
              <v-col>
                <v-textarea
                  id="newNoteTextArea"
                  v-model="newNoteText"
                  rows="8"
                  label="Note"
                  autofocus
                  no-resize
                  maxlength="4000"
                  class="pt-0"
                  ref="newNoteTextArea"
                  hide-details="auto">
                </v-textarea>
              </v-col>
            </v-row>
            <v-row class="py-4 pr-2 justify-end">
              <PrimaryButton id="cancelNote" secondary text="Cancel" class="mr-2" @click.native="newNoteSheet = !newNoteSheet"></PrimaryButton>
              <PrimaryButton id="saveNote" text="Save" width="7rem" :loading="loading" @click.native="saveNewSchoolNote" :disabled="newNoteText === ''"></PrimaryButton>
            </v-row>
          </v-card-text>
        </v-card>
      </v-bottom-sheet>
      </v-col>
      </v-row>
    </v-container>
    </template>
  
<script>
  
import PrimaryButton from '../../util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {formatDate} from '@/utils/format';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';

  
export default {
  name: 'MinistryNotes',
  mixins: [alertMixin],
  components: {
    PrimaryButton
  },
  props: {
    schoolID: {
      type: String,
      required: true
    },
    hasAccess: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      newNoteSheet: false,
      newNoteText: '',
      school: '',
      loading: true,
    };
  },
  created() {
    this.getThisSchoolsDetails();
  },
  methods: {
 
    getThisSchoolsDetails(){
      this.loading = true;
      this.school = '';
  
      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.school = response.data;
          
          this.sortNotes();
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    sortNotes(){
      this.school.notes = this.school.notes.sort(function(a, b) {
        const aCreateDate = new LocalDateTime.parse(a.createDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        const bCreateDate = new LocalDateTime.parse(b.createDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        if ( aCreateDate < bCreateDate ){
          return 1;
        }
        if ( aCreateDate > bCreateDate ){
          return -1;
        }
        return 0;
      });
    },
    openNoteSheet(){
      this.newNoteText = '';
      this.newNoteSheet = !this.newNoteSheet;
    },
    saveNewSchoolNote() {
      this.loading = true;
      const payload = {
        schoolID: this.schoolID,
        noteContent: this.newNoteText
      };
      ApiService.apiAxios.post(`${Routes.institute.SCHOOL_NOTE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the school.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the school note. Please try again later.');
        })
        .finally(() => {
          this.getThisSchoolsDetails();
          this.newNoteSheet = false;
          this.newNoteText = '';
        });
    },
    formatDate
  },
};
</script>
  
  <style scoped>
  
  .fontItalic{
    font-style: italic;
  }
  
  .sheetHeader{
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
  }
  
  .activityDisplayDate{
    font-size: smaller;
  }
  
  .activityContent {
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    font-size: medium;
  }
  
  .divider {
    border-color: #FCBA19;
    border-width: unset;
  }
  
  .containerSetup{
    padding-right: 24em !important;
    padding-left: 24em !important;
  }
  
  @media screen and (max-width: 1950px) {
    .containerSetup{
      padding-right: 20em !important;
      padding-left: 20em !important;
    }
  }
  
  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 4em !important;
      padding-left: 4em !important;
    }
  }
  
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 30% !important;
  }
  @media screen and (max-width: 950px){
    .v-dialog__content /deep/ .v-bottom-sheet {
      width: 60% !important;
    }
  }
  
  
  </style>
  
