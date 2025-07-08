<template>
  <v-data-table
    :items="uploadedKeyData"
    :headers="headers"
    mobile-breakpoint="0"
  >
    <template #headers="{ getSortIcon, toggleSort }">
      <tr>
        <th
          v-for="column in headers"
          id="header"
          :key="column.key"
          :class="{
            'text-center': column.align === 'center',
            'text-start': column.align === 'start',
            'text-end': column.align === 'end',
            'v-data-table__th--sortable': column.sortable,
          }"
          :style="{ cursor: column.sortable ? 'pointer' : 'default' }"
          @click="column.sortable && toggleSort(column)"
        >
          <div class="v-data-table-header__content d-flex align-center">
            <span class="header-text mr-12">{{ column.title }}</span>
            <v-icon
              v-if="column.sortable"
              class="v-data-table-header__sort-icon ml-1"
              :icon="getSortIcon(column)"
              size="x-small"
            />
          </div>
        </th>
      </tr>
    </template>

    <template #item="props">
      <tr
        class="mt-2"
        @click="rowclicked(props.item)"
      >
        <td
          v-for="column in headers"
          :key="column.key"
          class="pt-2 row-text"
        >
          <span v-if="column.key === 'form'">
            {{ props.item.selectable['form'] }}
          </span>
          <span v-else-if="column.key === 'report'" class="report-link">
            Summary Report
          </span>
          <span v-else-if="column.key === 'assessmentTypeCode'">
            {{ props.item.selectable['assessmentTypeCode'] }}
          </span>
          <span v-else-if="column.key === 'uploadDate'">
            {{ props.item.selectable['uploadDate'] }}
          </span>
          <span v-else-if="column.key === 'uploadBy'">
            {{ props.item.selectable['uploadBy'] }}
          </span>
          <span v-else-if="props.item[column.key]">
            {{ props.item[column.key] }}
          </span>
          <span v-else>-</span>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>
        
<script>
import {formatDateTime} from '@/utils/format';

export default {
  name: 'AssessmentKeyTable',
  components: {
  },
  mixins: [],
  props: {
    headers: {
      type: Array,
      required: true,
      default: null
    },
    data: {
      type: Array,
      required: true,
      default: null
    }
  },
  emits: ['reload'],
  data() {
    return {
      pageNumber: 1,
      pageSize: 25
    };
  },
  computed: {
    uploadedKeyData() {
      let filteredData =  this.data.filter(assessment => assessment.assessmentForms !== undefined &&  assessment.assessmentForms !== null && assessment.assessmentForms.length >0);
      let mappedData = filteredData.flatMap(assessment => {
        let forms = assessment.assessmentForms.map(form => form.formCode).sort((a,b) => a.localeCompare(b));
        return {
            assessmentTypeCode: assessment.assessmentTypeCode,
            form: forms.toString(),
            uploadDate: formatDateTime(assessment.assessmentForms[0].createDate.substring(0, 19), 'uuuu-MM-dd\'T\'HH:mm:ss', 'uuuu/MM/dd HH:mm:ss', true),
            uploadBy: assessment.assessmentForms[0].createUser
          }
      });
      return mappedData.sort((a,b) => {return a.assessmentTypeCode.localeCompare(b.assessmentTypeCode) || a.form.localeCompare(b.form);})
    }
  },
  watch: {
  },
  async created() {
        
  },
  beforeUnmount() {
            
  },
  methods: {
    getIssueIcon(issue){
      switch (issue) {
      case 'ERROR':
        return 'mdi-alert-circle-outline';
      case 'WARNING':
        return 'mdi-alert-outline';
      default:
        return '';
      }
    },
    getIssueIconColor(issue){
      switch (issue) {
      case 'ERROR':
        return '#d90606';
      case 'WARNING':
        return '#2196F3';
      default:
        return '';
      }
    },

  }
};
</script>
        
        <style scoped>
      .header-text {
    color: #7f7f7f;
  }

  :deep(.v-table__wrapper){
         overflow: unset;
       }

       :deep(.v-data-table-footer) {
       display: none;
 }
  
   .row-text {
    vertical-align: text-top;
   }
   .report-link {
    color: #1976d2;
   }

        </style>
        
    
  
