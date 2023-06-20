import {mapActions, mapState} from 'pinia';
import {studentStore} from '@/store/modules/student';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(studentStore, ['staleStudentRecordsMap'])
  },
  methods: {
    ...mapActions(studentStore, ['clearStaleData', 'addStaleDataToMap']),
    getMessageForStudent(studentID) {
      return this.staleStudentRecordsMap.get(studentID);
    }
  },

};
