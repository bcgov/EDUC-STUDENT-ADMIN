<template>
  <v-data-table
    :items="data"
    v-model:items-per-page="pageSize"
    :headers="headers"
    v-model:page="pageNumber"
    mobile-breakpoint="0"
  >
    <template #headers>
      <tr>
        <th
          v-for="column in headers"
          id="header"
          :key="column.key"
        >
          <v-row>
            <v-col class="header-text mr-12">
              {{ column.title }}
            </v-col>
          </v-row>
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
          <span v-if="column.key === 'course'">
            <span v-if="props.item.raw['courseCode'] === null">-</span>
            <span v-else-if="props.item.raw['courseLevel'] === null">-</span>
            <span v-else>{{ props.item.raw['courseCode'] }}{{ props.item.raw['courseLevel'] }}</span>
          </span>
          <span v-else-if="column.key === 'status'">
            <v-icon
              size="25"
              :color="getIssueIconColor(props.item.raw['studentStatusCode'])"
            >
              {{ getIssueIcon(props.item.raw['studentStatusCode']) }}
            </v-icon>
          </span>
          <span v-else-if="column.key === 'session'">
            <span v-if="props.item.raw['courseMonth'] === null || props.item.raw['courseYear'] === null">-</span>
            <span v-else> {{ props.item.raw['courseYear'] }}/{{ props.item.raw['courseMonth'] }}</span>
          </span>
          <span v-else-if="column.key === 'relatedCourse'">
            <span v-if="props.item.raw['relatedCourse'] === null">-</span>
            <span v-else-if="props.item.raw['relatedLevel'] === null">-</span>
            <span v-else>{{ props.item.raw['relatedCourse'] }}{{ props.item.raw['relatedLevel'] }}</span>
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
  name: 'CourseTable',
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
