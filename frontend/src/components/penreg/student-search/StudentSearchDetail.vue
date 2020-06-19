<template>
  <StudentSearch
    request-type-label="PEN Request"
    title="GetMyPen Request Details"
    :prep-put="prepPut"
    :request-completed="requestCompleted"
  >
    <template>
      <StudentSearchCard>
      </StudentSearchCard>
    </template>
  </StudentSearch>
</template>

<script>
import StudentSearch from './StudentSearch';

export default {
  name: 'penRequestDetail',
  components: {
    StudentSearch
  },
};
</script>
