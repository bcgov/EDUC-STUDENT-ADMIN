<template>
  <v-card
    :id="`sessioncard-${session.sessionid}`"
    fluid
    class="d-flex flex-column mt-4"
    height="100%"
  >
    <v-card-title class="text-wrap pb-0" >
      <v-row no-gutters class="pr-4">
        <v-col>
          <strong class="sessionName"> {{ session.courseMonth }} {{ session.courseYear }} Session </strong>
        </v-col> 
        <v-col cols="1" style="float:right;">
          <a class="ml-2" @click="handleOpenEditor">
            <v-icon
              class="edit-session-small"
              color="#1A5A96"
              :icon="'mdi-pencil'"
            />
          </a>
        </v-col>       
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2 ml-2 mr-2">
      <v-list class="pt-0">
        <v-list-item min-height="inherit" class="pl-0">
          <v-row class="dates">
            <v-col cols="8">
              <v-icon small class="mr-1">mdi-calendar</v-icon>
              <span id="opendatelabel">Registration Open Date:</span>
            </v-col>
            
            <v-col cols="4">
              <span id="opendate">
                {{ formattoDate(session.activeFromDate) }}
              </span>
            </v-col>
          </v-row>
        </v-list-item>
        <v-list-item min-height="inherit" class="pl-0">
          <v-row>
            <v-col cols="8">
              <v-icon small class="mr-1">mdi-calendar</v-icon>
              <span id="closedatelabel">Registration Close Date:</span>
            </v-col>            
            <v-col cols="4">
              <span id="closedate">
                {{ formattoDate(session.activeUntilDate) }}
              </span>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-spacer />
  </v-card>
</template>

<script>
import moment from 'moment';

export default {
  name: 'SessionCard',
  props: {
    session: {
      type: Object,
      required: true,
    },
    handleOpenEditor: {
      type: Function,
      required: true,
    },
  },
  methods: {
    formattoDate(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
    },
  },
};
</script>

<style scoped>
.dateSubText {
  font-style: italic;
  font-size: 0.95em;
}

.sessionName {
  font-size: 1em;
}

.edit-session-small {
  font-size: 25px;
  margin-top: -5px;
  float: right;
}
</style>
