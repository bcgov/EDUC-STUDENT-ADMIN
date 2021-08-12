<template>
  <v-chip
    :color="statusChipColors[prbStudent.penRequestBatchStudentStatusCode][0] || '#027CB1' "
    :text-color="statusChipColors[prbStudent.penRequestBatchStudentStatusCode][1] || 'white'"
    small
  >
    <strong>{{ statusLabel || prbStudent.penRequestBatchStudentStatusCode }}</strong>
  </v-chip>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'PrbStudentStatusChip',
  props: {
    prbStudent: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      statusChipColors: {
        'MATCHEDSYS': ['#027CB1', 'white'],
        'MATCHEDUSR': ['#027CB1', 'white'],
        'NEWPENSYS' : ['#7737BD', 'white'],
        'NEWPENUSR' : ['#7737BD', 'white'],
        'FIXABLE' : ['#2E8540', 'white'],
        'ERROR' : ['#D8292F', 'white'],
        'REPEAT' : ['#FCBA19', '#313132'],
        'INFOREQ' : ['#FF9839', '#313132'],
        'DUPLICATE' : ['#C55A11', 'white'],
      },
    };
  },
  computed: {
    ...mapState('penRequestBatch', ['prbStudentStatuses']),
    statusLabel() {
      const statusLabel = this.prbStudentStatuses.find(status => status.penRequestBatchStudentStatusCode === this.prbStudent.penRequestBatchStudentStatusCode)?.label;
      if(this.prbStudent?.penRequestBatchStudentStatusCode === 'DUPLICATE'){
        return 'Duplicate';
      }
      return this.prbStudent.penRequestBatchStudentStatusCode === 'REPEAT' ? `${this.prbStudent.repeatRequestSequenceNumber || ''} Repeats` : statusLabel;
    },
  },
};
</script>
