<template>
  <div id="searchResults" class="px-3" style="width: 100%" :overlay=false>
    <v-row no-gutters>
      <span class="px-4 pb-2">{{ tableData.numberOfElements }}</span>
    </v-row>
      <v-data-table
              id="dataTable"
              :headers="headers"
              :items="tableData.content"
              :page.sync="page"
              :items-per-page="tableData.pageable.pageSize"
              hide-default-footer
              @page-count="tableData.pageable.pageNumber = $event">
        <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
          <span class="top-column-item">{{ header.topText }}</span>
          <span class="double-column-item">{{header.doubleText}}</span>
          <br />
          <span class="bottom-column-item">{{ header.bottomText }}</span>
        </template>
        <template v-slot:item="{ item, headers }">
          <tr>
            <td v-for="header in headers">
              <span class="top-column-item">{{ item[header.topValue] || '-' }}</span>
              <span class="double-column-item">{{item[header.doubleValue]}}</span>
              <br>
              <span class="bottom-column-item">{{ item[header.bottomValue] || '-' }}</span>
            </td>
          </tr>
        </template>
      </v-data-table>
      <div class="text-center pt-2">
        <v-pagination v-model="page" :length="tableData.totalPages"></v-pagination>
      </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  props: {
    tableData: {
      type: Object,
      required: true
    },
    searchCriteria: {
      type: Object,
      required: true
    },
    search: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        {
          topText: 'PEN',
          bottomText: 'Merged',
          align: 'start',
          sortable: false,
          topValue: 'pen',
          bottomValue: 'merged'
        },
        { topText: 'Legal Surname', bottomText: 'Usual Surname', topValue: 'legalLastName', bottomValue: 'usualLastName', sortable: false },
        { topText: 'Legal Given', bottomText: 'Usual Given', topValue: 'legalFirstName', bottomValue: 'usualFirstName', sortable: false },
        { topText: 'Legal Middle', bottomText: 'Usual Middle', topValue: 'legalMiddleNames', bottomValue: 'usualMiddleNames', sortable: false },
        { topText: 'Postal Code', bottomText: 'Memo', topValue: 'postalCode', bottomValue: 'memo', sortable: false },
        { topText: 'DC', doubleText: 'Gen', bottomText: 'Local ID', topValue: 'dc', doubleValue: 'sexCode', bottomValue: 'localID', sortable: false },
        { topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'grade', sortable: false },
        { topText: 'School', bottomText: 'Twinned', topValue: 'school', bottomValue: 'twinned', sortable: false },
      ],
    };
  },
  watch: {
    page: {
      handler() {
        this.searchCriteria.pageNumber = this.page;
        this.search();
      }
    }
  }
};
</script>

<style scoped>
  /deep/ .v-icon {
    padding: 0 !important;
  }
  .double-column-item {
    float: right;
  }

  .top-column-item {
    float: left;
  }

  .bottom-column-item {
    float: left;
  }
</style>
