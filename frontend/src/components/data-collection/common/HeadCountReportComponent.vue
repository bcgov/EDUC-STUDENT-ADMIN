<template>
  <v-table
    v-if="headcountTableData"
    :id="tableID"
    density="compact"
  >
    <thead>
      <tr>
        <th
          v-for="columnHeader in headcountTableData?.headers"
          :id="'tableHeader'+columnHeader"
          :key="columnHeader + generateKey()"
        >
          {{ columnHeader==="title"?'':columnHeader }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in headcountTableData?.rows"
        :key="row?.title?.currentValue + generateKey()"
        :class="row?.title?.currentValue === row?.section?.currentValue ?'section-header':''"
      >
        <td
          v-if="Object.keys(row).length === 2 && row?.title?.currentValue === row?.section?.currentValue"
          colspan="20"
          class="section-header-title"
        >
          {{ row?.title?.currentValue }}
        </td>
        <td
          v-for="columnHeader in headcountTableData?.headers"
          v-else
          :key="row?.title?.currentValue + columnHeader + generateKey()"
          :class="getClassForCell(columnHeader, row)"
        >
          <div :class="row[columnHeader]?.currentValue==='0'?'zero-cell':''">
            <span>{{ row[columnHeader]?.currentValue }}</span>
          </div>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import {v4 as uuidv4} from 'uuid';

export default {
  name: 'HeadCountReportComponent',
  components: {
  },
  mixins: [alertMixin],
  props: {
    headcountTableData: {
      type: Object,
      required: true
    },
    tableID: {
      type: String,
      required: true
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


.section-header-title {
  color: #38598a;
  font-weight: bold;
}
th {
  color: #38598a !important;
  text-align: center !important;
}

</style>
       
       
     
   
