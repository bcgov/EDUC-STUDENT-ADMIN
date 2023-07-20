<template>
  <v-card width="40em">
    <v-card-title>
      <v-row>
        <v-col>
          <div>
            {{
              note.createUser
            }}
          </div>
          <div
            class="mt-n2"
            style="font-size: 12px;"
          >
            Last modified by {{
              note.updateUser
            }} on {{
              formatDate(note.updateDate.substring(0, 19), 'uuuu-MM-dd\'T\'HH:mm:ss', to = 'uuuu/MM/dd')
            }}
          </div>
        </v-col>
        <v-col class="d-flex justify-end">
          <span class="activityDisplayDate mr-2">{{
            formatDate(note.createDate.substring(0, 19), 'uuuu-MM-dd\'T\'HH:mm:ss', to = 'uuuu/MM/dd')
          }}</span>
          <v-btn
            v-if="hasAccess"
            class="mr-2"
            width="0.5em"
            min-width="0.5em"
            title="Edit"
            color="white"
            depressed
            small
            variant="flat"
            @click="openEditInstituteNoteDialog"
          >
            <v-icon
              size="x-large"
              color="#003366"
              dark
            >
              mdi-pencil
            </v-icon>
          </v-btn>
          <v-btn
            v-if="hasAccess"
            width="0.5em"
            min-width="0.5em"
            title="Remove"
            color="white"
            depressed
            small
            variant="flat"
            @click="openRemoveInstituteNoteDialog"
          >
            <v-icon
              size="x-large"
              color="#003366"
              dark
            >
              mdi-delete
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="activityContent">
      {{
        note.content
      }}
    </v-card-text>
  </v-card>
</template>

<script>
import {formatDate} from '@/utils/format';

export default {
  name: 'InstituteNote',
  props: {
    hasAccess: {
      type: Boolean,
      required: true
    },
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['openEditInstituteNoteDialog', 'openRemoveInstituteNoteDialog'],
  methods: {
    openEditInstituteNoteDialog() {
      this.$emit('openEditInstituteNoteDialog');
    },
    openRemoveInstituteNoteDialog() {
      this.$emit('openRemoveInstituteNoteDialog');
    },
    formatDate
  }
};
</script>

<style scoped>

.activityDisplayDate {
  font-size: smaller;
}

.activityContent {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
}

</style>
