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
        />
      </v-col>
    </v-row>
    <v-row
      v-else
      no-gutters
    >
      <v-col>
        <v-row
          cols="2"
          class="d-flex justify-end"
        >
          <v-spacer />
          <PrimaryButton
            v-if="hasAccess"
            id="addNewNoteButton"
            width="9em"
            icon="mdi-plus"
            icon-left
            text="New Note"
            @click-action="openAddNoteDialog"
          />
        </v-row>
        <v-row align="stretch">
          <v-col>
            <v-timeline
              id="instituteNotesTimeline"
              density="compact"
              direction="vertical"
              side="end"
              truncate-line="both"
            >
              <v-timeline-item
                v-for="(note) in sortedNotes"
                :key="note.noteId"
                icon="mdi-message-bulleted"
                dot-color="white"
                fill-dot
                elevation="1"
                icon-color="#003366"
                size="large"
                width="100%"
              >
                <InstituteNote
                  :note="note"
                  :has-access="hasAccess"
                  @open-edit-institute-note-dialog="openEditNoteDialog(note)"
                  @open-remove-institute-note-dialog="removeNote(note)"
                />
              </v-timeline-item>
              <v-timeline-item
                v-if="sortedNotes.length === 0"
                icon="mdi-message-bulleted"
                dot-color="white"
                fill-dot
                elevation="1"
                icon-color="#003366"
                size="large"
                width="100%"
              >
                <v-card width="40em">
                  <v-card-text class="activityContent">
                    No notes have been recorded.
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-bottom-sheet
      v-model="showAddNoteDialog"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <AddInstituteNote
        v-if="showAddNoteDialog"
        :loading="loading"
        @close-add-institute-note="closeAddNoteDialog"
        @save-new-institute-note="addNote"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
      v-model="showEditNoteDialog"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <EditInstituteNote
        v-if="showEditNoteDialog"
        :loading="loading"
        :institute-note="noteToEdit"
        @close-edit-institute-note="closeEditNoteDialog"
        @save-changes-to-institute-note="editNote"
      />
    </v-bottom-sheet>
    <ConfirmationDialog ref="confirmationDialog" />
  </v-container>
</template>

<script>
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import AddInstituteNote from '@/components/institute/common/AddInstituteNote.vue';
import EditInstituteNote from '@/components/institute/common/EditInstituteNote.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import {formatDate} from '@/utils/format';
import InstituteNote from '@/components/institute/common/InstituteNote.vue';

export default {
  name: 'InstituteNotes',
  components: {InstituteNote, EditInstituteNote, AddInstituteNote, ConfirmationDialog, PrimaryButton},
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    hasAccess: {
      type: Boolean,
      required: true
    },
    notes: {
      type: Array,
      required: true
    }
  },
  emits: ['addInstituteNote', 'editInstituteNote', 'removeInstituteNote'],
  data() {
    return {
      showAddNoteDialog: false,
      showEditNoteDialog: false,
      noteToEdit: null
    };
  },
  computed: {
    sortedNotes() {
      if (!this.notes) {
        return [];
      }
      let notes = this.notes.slice();
      return notes.sort(function (a, b) {
        const aCreateDate = new LocalDateTime.parse(a.createDate.substring(0, 19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        const bCreateDate = new LocalDateTime.parse(b.createDate.substring(0, 19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
        if (aCreateDate.isBefore(bCreateDate)) {
          return 1;
        }
        if (aCreateDate.isAfter(bCreateDate)) {
          return -1;
        }
        return 0;
      });
    }
  },
  methods: {
    openAddNoteDialog() {
      this.showAddNoteDialog = true;
    },
    closeAddNoteDialog() {
      this.showAddNoteDialog = false;
    },
    addNote(note) {
      this.$emit('addInstituteNote', note);
      this.showAddNoteDialog = false;
    },
    openEditNoteDialog(note) {
      this.noteToEdit = note;
      this.showEditNoteDialog = true;
    },
    closeEditNoteDialog() {
      this.noteToEdit = null;
      this.showEditNoteDialog = false;
    },
    editNote(note) {
      this.$emit('editInstituteNote', note);
      this.showEditNoteDialog = false;
    },
    removeNote(note) {
      const opts = {
        color: '#003366',
        dense: false,
        width: 400,
        dark: true,
        titleBold: true,
        resolveText: 'Remove'
      };
      this.$refs.confirmationDialog.open('Please Confirm', 'Are you sure you want to remove this note?', opts)
        .then((result) => {
          if (!result) {
            return;
          }
          this.$emit('removeInstituteNote', note);
        });
    },
    formatDate
  }
};
</script>

<style scoped>

.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
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
