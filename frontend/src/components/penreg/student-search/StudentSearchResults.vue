<template>
  <div id="searchResults" class="px-3" style="width: 100%" :overlay=false>
    <v-row no-gutters>
      <v-col>
        <span id="numberResults" class="px-4 pb-2">{{ tableData.totalElements }} Results</span>
      </v-col>
      <v-col>
        <v-btn color="#1976d2" id="compareButton" class="ma-0" small text @click="compare" :disabled="selectedRecords.length!==2">
          <v-icon left>mdi-content-copy</v-icon> Compare
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
            id="dataTable"
            v-model="selectedRecords"
            :headers="headers"
            :items="tableData.content"
            :page.sync="pageNumber"
            :items-per-page="tableData.pageable.pageSize"
            hide-default-footer
            item-key="studentID"
            @page-count="tableData.pageable.pageNumber = $event">
      <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
        <span :key="h.id" class="top-column-item">
          {{ header.topText }}
        </span>
        <em :key="h.id" v-if="header.topValue === 'dob'" @click="updateSortParams(header.topValue)"
            :class="['dob-sort pl-2 v-icon v-data-table-header__icon fas active', headerSortParams.currentSortAsc ? 'fa-sort-down' : 'fa-sort-up']"
        ></em>
        <span :key="h.id" class="double-column-item">{{header.doubleText}}</span>
        <br :key="h.id" />
        <span :key="h.id" class="bottom-column-item">{{ header.bottomText }}</span>
      </template>
      <template v-slot:item="props">
        <tr>
          <td v-for="header in props.headers" :key="header.id" :class="header.id">
            <v-checkbox v-if="header.type" :input-value="props.isSelected" @change="props.select($event)"></v-checkbox>
            <div v-else>
              <span class="top-column-item">{{ props.item[header.topValue] || '-' }}</span>
              <span class="double-column-item">{{props.item[header.doubleValue]}}</span>
              <br>
              <span class="bottom-column-item">{{ props.item[header.bottomValue] || '-' }}</span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-row class="pt-2" justify="end">
      <v-col cols="4">
        <v-pagination v-model="pageNumber" :length="tableData.totalPages"></v-pagination>
      </v-col>
      <v-col cols="4" id="currentItemsDisplay">
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ tableData.totalElements }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
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
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { topText: 'PEN', bottomText: 'Merged', align: 'start', sortable: false, topValue: 'pen', bottomValue: 'merged' },
        { topText: 'Legal Surname', bottomText: 'Usual Surname', topValue: 'legalLastName', bottomValue: 'usualLastName', sortable: false },
        { topText: 'Legal Given', bottomText: 'Usual Given', topValue: 'legalFirstName', bottomValue: 'usualFirstName', sortable: false },
        { topText: 'Legal Middle', bottomText: 'Usual Middle', topValue: 'legalMiddleNames', bottomValue: 'usualMiddleNames', sortable: false },
        { topText: 'Postal Code', bottomText: 'Memo', topValue: 'postalCode', bottomValue: 'memo', sortable: false },
        { topText: 'DC', doubleText: 'Gen', bottomText: 'Local ID', topValue: 'dc', doubleValue: 'sexCode', bottomValue: 'localID', sortable: false },
        { topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false },
        { topText: 'Mincode', bottomText: 'Twinned', topValue: 'mincode', bottomValue: 'twinned', sortable: false },
      ],
    };
  },
  watch: {
    pageNumber: {
      handler() {
        this.search(false);
      }
    },
    headerSortParams: {
      handler() {
        this.search(false);
      },
      deep: true
    }
  },
  computed: {
    ...mapState('studentSearch', ['headerSortParams']),
    pageNumber: {
      get(){
        return this.$store.state['studentSearch'].pageNumber;
      },
      set(newPage){
        return this.$store.state['studentSearch'].pageNumber = newPage;
      }
    },
    selectedRecords: {
      get(){
        return this.$store.state['studentSearch'].selectedRecords;
      },
      set(newRecord){
        return this.$store.state['studentSearch'].selectedRecords = newRecord;
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * this.tableData.pageable.pageSize + 1);
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * this.tableData.pageable.pageSize + this.tableData.numberOfElements);
    }
  },
  methods: {
    ...mapMutations('studentSearch', ['updateSortParams']),
    compare() {
      //TODO
    }
  }
};
</script>

<style scoped>
  #compareButton {
    float: right;
  }
  #currentItemsDisplay {
    text-align: right;
    font-size: 0.875rem;
  }
  .dob-sort {
    opacity: 1;
    cursor: pointer;
    color: #1976d2;
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
  .table-checkbox {
    margin-top: 0;
    padding-top: 0;
  }
  .table-checkbox /deep/ .v-input__slot {
    padding-top: 0;
  }
  /deep/ .v-pagination__navigation > i {
    padding-left: 0;
  }
  /deep/ .v-input--selection-controls__ripple {
    left: -7px;
  }
</style>
