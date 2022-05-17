<template>
  <div>Hello World Users Your mincode is {{this.mincode}}</div>
</template>

<script>

export default {
  name: 'AccessUsersPage',
  props: {
    mincode: {
      type: String,
      required: true
    },
  }
};
</script>

<style scoped>
.card-hint {
  color: #000 !important;
  font-size: 1rem;
}
</style>
