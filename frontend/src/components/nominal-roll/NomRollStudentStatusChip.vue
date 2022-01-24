<template>
  <v-chip
    :color="statusChipColors[statusCode][0] || '#027CB1' "
    :text-color="statusChipColors[statusCode][1] || 'white'"
    small
  >
    <strong>{{ statusLabel || statusCode }}</strong>
  </v-chip>
</template>

<script>
import {NOMINAL_ROLL_STUDENT_STATUSES} from '@/utils/constants';

export default {
  name: 'NomRollStudentStatusChip',
  props: {
    statusCode: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      statusChipColors: {
        'MATCHEDSYS': ['#027CB1', 'white'],
        'MATCHEDUSR': ['#027CB1', 'white'],
        'FIXABLE' : ['#2E8540', 'white'],
        'IGNORED' : ['#f3e21c', 'black'],
        'ERROR' : ['#D8292F', 'white'],
      },
    };
  },
  computed: {
    statusLabel() {
      return NOMINAL_ROLL_STUDENT_STATUSES.find(status => status.value === this.statusCode)?.text || this.statusCode;
    },
  },
};
</script>
