<template>
  <v-data-table
    v-model:page="pageNumber"
    v-model:items-per-page="pageSize"
    :items="data"
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
            <span class="header-text">{{ column.title }}</span>
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
      >
        <td
          v-for="column in headers"
          :key="column.key"
          class="pt-2 row-text"
        >
          <span v-if="column.key === 'status'">
            <v-icon
              size="25"
              :color="getIssueIconColor(props.item.raw['studentStatusCode'])"
            >
              {{ getIssueIcon(props.item.raw['studentStatusCode']) }}
            </v-icon>
          </span>
          <span v-else-if="props.item.raw[column.key]">
            {{ props.item.raw[column.key] }}
          </span>
          <span v-else>-</span>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>
        
<script>
import alertMixin from '../../../mixins/alertMixin';
        
export default {
  name: 'AssessmentTable',
  mixins: [alertMixin],
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

       :deep(.v-data-table-footer__items-per-page) {
       display: none;
 }
  
   .row-text {
    vertical-align: text-top;
   }

        </style>
        
    
  
