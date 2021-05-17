import {mapMutations, mapState} from 'vuex';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState('student', ['staleStudentRecordsMap'])
  },
  methods: {
    ...mapMutations('student', ['clearStaleData', 'addStaleDataToMap']),
    getMessageForStudent(studentID) {
      return this.staleStudentRecordsMap.get(studentID);
    }
  },

};
