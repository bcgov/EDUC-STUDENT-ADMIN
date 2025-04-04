<template>
  <v-table
    density="compact"
  >
    <thead>
      <tr>
        <th
          v-for="columnHeader in header"
          :id="'tableHeader'+columnHeader?.key"
          :key="columnHeader?.key + generateKey()"
        >
          {{ columnHeader?.title }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in summaryData?.rows"
        :key="row?.categoryOrFacilityType + generateKey()"
        :class="row?.isSection === 'true' ?'section-header':''"
      >
        <td
          v-for="columnHeader in header"
          :key="row?.title?.currentValue + columnHeader?.key + generateKey()"
          class="table-cell"
        >
          <span
            v-if="columnHeader?.key === 'categoryOrFacilityType'"
            :class="row?.isSection === 'false' ?'pl-12':''"
          >
            {{ row[columnHeader?.key] }}
          </span>
          <span
            v-else
            class="pl-12"
          >{{ row[columnHeader?.key] }}</span>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
  
<script>
import alertMixin from '@/mixins/alertMixin';
import {v4 as uuidv4} from 'uuid';
   
export default {
  name: 'SummaryTable',
  components: {
  },
  mixins: [alertMixin],
  props: {
    summaryData: {
      type: Object,
      required: true,
      default: null
    },
    header: {
      type: Array,
      required: true,
      default: null
    }
  },
  methods: {
    getClassForCell(columnHeader, row) {
      if(row.section && row.title.currentValue===row.section.currentValue) {
        if(columnHeader==='title') {
          return 'section-header-title';
        } else if(row[columnHeader]?.currentValue==='0') {
          return 'table-cell';
        } else {
          return 'section-header-cell';
        }
      } else if(columnHeader==='title') {
        return 'pl-12';
      } else {
        return 'table-cell';
      }
    },
    generateKey() {
      return uuidv4();
    }
  }
};
</script>
         
  <style scoped>
  .section-header {
    background-color: #FAFBFC;
    color: #38598a;
    font-weight: bold;
  }
  .section-header-cell {
    font-weight: bold;
    text-align: center;
  }
  /* .section-header-title {
    color: #38598a;
    font-weight: bold;
  } */
  .table-cell {
    text-align: left;
  }
  th {
    color: #38598a !important;
    text-align: left !important;
  }
  .zero-cell {
    color: gray;
  }
  
  /* .compare-text {
    color: gray;
  } */
  </style>
         
         
       
     
  
