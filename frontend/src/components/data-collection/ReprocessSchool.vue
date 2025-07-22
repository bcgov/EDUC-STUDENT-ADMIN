<template>
  <div>Reprocess School</div>
  <span>{{ collectionObject }}</span>
</template>
<script>
export default {
  name: 'ReprocessSchool',
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isProcessing: false
    };
  },
  methods: {
    async reprocessSchool() {

    }
  }
};
</script>
