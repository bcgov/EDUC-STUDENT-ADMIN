<template>  
  <v-row
    class="pt-2"
    justify="end"
  >
    <v-col cols="4">
      <v-btn
        v-if="pageCommands"
        id="page-commands"
        text
        color="#38598a"
      >
        Showing page commands
        <v-icon>
          mdi-chevron-down
        </v-icon>
      </v-btn>
    </v-col>
    <v-col cols="4">
      <v-pagination
        color="#38598A"
        :value="value"
        :length="dataResponse.totalPages"
        @input="handlePageNumberInput"
      />
    </v-col>
    <v-col
      id="currentItemsDisplay"
      cols="4"
    >
      Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ (dataResponse.totalElements || 0) }}
    </v-col>
  </v-row>
</template>

<script>

export default {
  name: 'Pagination',
  props: {
    value: {
      type: Number,
      required: true
    },
    dataResponse: {
      type: Object,
      required: true
    },
    pageCommands: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    showingFirstNumber() {
      return ((this.value-1) * (this.dataResponse.pageable.pageSize || 0) + ((this.dataResponse.numberOfElements || 0)  > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.value-1) * (this.dataResponse.pageable.pageSize || 0) + (this.dataResponse.numberOfElements || 0));
    },
  },
  methods: {
    handlePageNumberInput(v) {
      this.$emit('input', v);
    },
  }
};
</script>


<style scoped>
  #currentItemsDisplay {
    text-align: right;
    font-size: 0.875rem;
  }
  #page-commands {
    font-size: 0.875rem;
    text-transform: none !important;
  }
</style>
