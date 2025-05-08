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
        :class="{'section-header': row?.isSection === 'true'}"
      >
        <td
          v-for="columnHeader in header"
          :key="row?.title?.currentValue + columnHeader?.key + generateKey()"
          class="table-cell"
        >
          <span
            v-if="columnHeader?.key === 'categoryOrFacilityType'"
            :class="{
              'pl-12': row?.isSection === 'false',
              'clickable-header': row?.isSection === 'true'
            }"
            @click="row?.isSection === 'true' ? $emit('category-clicked', row) : null"
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
  .table-cell {
    text-align: left;
  }
  th {
    color: #38598a !important;
    text-align: left !important;
  }
  .clickable-header {
    cursor: pointer;
    text-decoration: underline;
  }
  </style>
         
         
       
     
  
