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
        'ERROR' : ['#D8292F', 'white'],
      },
      statusLabels: {
        'MATCHEDSYS': 'Matched by system',
        'MATCHEDUSR': 'Matched by user',
        'FIXABLE' : 'Fixable Request',
        'ERROR' : 'Error',
      }
    };
  },
  computed: {
    statusLabel() {
      return this.statusLabels[this.statusCode];
    },
  },
};
</script>
