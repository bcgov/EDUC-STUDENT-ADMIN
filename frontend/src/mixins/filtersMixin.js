export default {
  emits: ['update:filters'],
  props: {
    filters: {
      type: Array,
      required: true
    },
  },
  methods: {
    selectFilters(headers, filterValueField) {
      let statusFilters = [];
      headers.filter(header => !!header.filterName).forEach(header => {
        header.isFiltered = this.filters.some(filter => filter === header.filterName);
        if(header.isFiltered) {
          statusFilters.push(header[filterValueField]);
        }
      });
      return statusFilters;
    },
    selectFilter(header) {
      console.log('Here ' + JSON.stringify(header));
      if(header.isFiltered) {
        this.filters.push(header.filterName);
      } else {
        const index = this.filters.findIndex(filter => filter === header.filterName);
        this.filters.splice(index, 1);
      }

      console.log('filters ' + JSON.stringify(this.filters));
      this.$emit('update:filters', this.filters);
    },
  }
};
