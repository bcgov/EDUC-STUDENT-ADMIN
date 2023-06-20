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
        <v-row cols="2" class="d-flex justify-end">
          <v-spacer/>
          <PrimaryButton id="addNewNoteButton" width="9em" icon="mdi-plus" icon-left text="New Note" v-if="hasAccess" @click.native="addNewSchoolNoteSheet = !addNewSchoolNoteSheet"/>
        </v-row>
        <v-row align="stretch">
          <v-col>
            <v-timeline id="schoolNotesTimeline" dense>
              <v-timeline-item v-for="(note) in sortedNotes" :key="note.noteId" right icon="mdi-message-bulleted" icon-color="#003366" large color="white">
                <v-card>
                  <v-card-title>
                    <div class="activityTitle">{{ note.createUser }}<br/><span style="font-size: xx-small;">Last modified by {{ note.updateUser }} on {{ formatDate(note.updateDate.substring(0, 19), 'uuuu-MM-dd\'T\'HH:mm:ss', to = 'uuuu/MM/dd') }}</span></div>
                    <v-spacer/>
                    <div class="activityDisplayDate mr-2">
                      {{ formatDate(note.createDate.substring(0, 19), 'uuuu-MM-dd\'T\'HH:mm:ss', to = 'uuuu/MM/dd') }}
                    </div>
                    <v-btn class="mr-2" width="0.5em" min-width="0.5em" title="Edit" color="white" v-if="hasAccess" @click="showSchoolNoteEditForm(note)" depressed small>
                      <v-icon size="x-large" color="#003366" dark>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn class="mr-2" width="0.5em" min-width="0.5em" title="Remove" color="white" v-if="hasAccess" @click="removeSchoolNote(note)" depressed small>
                      <v-icon size="x-large" color="#003366" dark>mdi-delete-forever-outline</v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-card-text class="activityContent">{{ note.content }}</v-card-text>
                </v-card>
              </v-timeline-item>
              <v-timeline-item v-if="sortedNotes.length === 0" right icon="mdi-message-bulleted" icon-color="#003366" large color="white">
                <v-card>
                  <v-card-text class="activityContent">No notes have been recorded for this school.</v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-bottom-sheet
        v-model="addNewSchoolNoteSheet"
        inset
        no-click-animation
        scrollable
        persistent
    >
      <NewSchoolNotePage
          v-if="addNewSchoolNoteSheet"
          :schoolID="this.$route.params.schoolID"
          @newSchoolNote:closeNewSchoolNotePage="addNewSchoolNoteSheet = !addNewSchoolNoteSheet"
          @newSchoolNote:addNewSchoolNote="newSchoolNoteAdded"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
        v-model="editSchoolNoteSheet"
        inset
        no-click-animation
        scrollable
        persistent
    >
      <EditSchoolNotePage
          v-if="editSchoolNoteSheet"
          :schoolNote="editSchoolNote"
          :schoolId="this.$route.params.schoolID"
          @editSchoolNote:closeEditSchoolNotePage="editSchoolNoteSheet = !editSchoolNoteSheet"
          @editSchoolNote:schoolNoteSaved="schoolNoteSaved"
      />
    </v-bottom-sheet>
    <ConfirmationDialog ref="confirmationDialog"/>
  </v-container>
</template>

<script>

import PrimaryButton from '../../util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {formatDate} from '@/utils/format';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';
import NewSchoolNotePage from '@/components/institute/common/NewSchoolNotePage.vue';
import EditSchoolNotePage from '@/components/institute/common/EditSchoolNotePage.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';

export default {
  name: 'MinistryNotes',
  mixins: [alertMixin],
  components: {
    ConfirmationDialog,
    NewSchoolNotePage,
    EditSchoolNotePage,
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
      loading: true,
      addNewSchoolNoteSheet: false,
      editSchoolNoteSheet: false,
      school: '',
      editSchoolNote: null
    };
  },
  computed: {
    sortedNotes() {
      if (!this.school?.notes) {
        return [];
      }
      let notes = this.school.notes.slice();
      return notes.sort(function (a, b) {
        const aCreateDate = new LocalDateTime.parse(a.createDate.substring(0, 19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        const bCreateDate = new LocalDateTime.parse(b.createDate.substring(0, 19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        if (aCreateDate < bCreateDate) {
          return 1;
        }
        if (aCreateDate > bCreateDate) {
          return -1;
        }
        return 0;
      });
    }
  },
  created() {
    this.getThisSchoolsDetails();
  },
  methods: {
    getThisSchoolsDetails() {
      this.loading = true;
      this.school = '';

      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.school = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    showSchoolNoteEditForm(schoolNote) {
      this.editSchoolNote = schoolNote;
      this.editSchoolNoteSheet = true;
    },
    schoolNoteSaved() {
      this.editSchoolNoteSheet = false;
      this.getThisSchoolsDetails();
    },
    newSchoolNoteAdded() {
      this.newNoteSheet = !this.newNoteSheet;
      this.getThisSchoolsDetails();
    },
    removeSchoolNote(schoolNote) {
      const opts = {
        color: '#003366',
        dense: false,
        titleBold: true,
        resolveText: 'Remove'
      };
      this.$refs.confirmationDialog.open('Please Confirm', 'Are you sure you want to remove this note?',opts)
        .then((result) => {
          if (!result) {
            return;
          }
          this.loading = true;
          ApiService.apiAxios.delete(`${Routes.institute.SCHOOL_NOTE_URL}/${schoolNote.schoolId}/${schoolNote.noteId}`).then(() => {
            this.setSuccessAlert('The school note has successfully been removed!');
            this.getThisSchoolsDetails();
          }).catch(error => {
            console.log(error);
            this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while removing the school note. Please try again later.');
          }).finally(() => {
            this.loading = false;
          });
        });
    },
    formatDate
  },
};
</script>

<style scoped>

.fontItalic {
  font-style: italic;
}

.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.activityTitle {
  line-height: 1rem;
}

.activityDisplayDate {
  font-size: smaller;
}

.activityContent {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
}

.divider {
  border-color: #FCBA19;
  border-width: unset;
}

.containerSetup {
  padding-right: 24em !important;
  padding-left: 24em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup {
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup {
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}

.v-dialog__content /deep/ .v-bottom-sheet {
  width: 30% !important;
}

@media screen and (max-width: 950px) {
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}


</style>
  
