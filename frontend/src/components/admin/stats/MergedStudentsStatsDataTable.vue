<template>
  <v-data-table
    id="mergedStatsDataTable"
    :headers="headers"
    :items="mergedAndTrueStudents"
    item-key="studentID"
    item-value="studentID"
    disable-sort
    :search="search"
    :custom-filter="filterMerges"
    :item-class="itemRowBackground"
    :footer-props="{
      'items-per-page-options': [12]
    }"
    :items-per-page="12"
  >
    <template v-slot:top>
      <v-text-field
        v-model="search"
        label="Search"
        class="pa-4"
      ></v-text-field>
    </template>
    <template
      v-for="h in headers"
      :key="h.id"
      #[`column.${h.key}`]="{ column }"
    >
      <v-row no-gutters>
        <v-col>
          <span
            class="header-font"
            :title="column.topTooltip"
          >
            {{ column.topText }}
          </span>
        </v-col>
        <v-col v-if="column.doubleTooltip">
          <span
            class="double-column-item header-font"
            style="margin-top: 0.4em;"
            :title="column.doubleTooltip"
          >{{ column.doubleText }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <span
            class="header-font"
            :title="column.bottomTooltip"
          >{{ column.bottomText }}</span>
        </v-col>
      </v-row>
    </template>
    <template #item="item">
      <tr
        no-gutters
        class="hoverTable"
        :class="itemRowBackground(item.item.raw)"
      >
        <td
          v-for="header in headers"
          :key="header"
          :class="isAPair(item.item.raw)?'even-row':'odd-row'"
        >
          <div>{{item}}</div>
          <div
            class="tableCell"
            @click="viewStudentDetails(item.item.raw.studentID)"
          >
            <span
              v-if="header.topValue === 'dob'"
              class="top-column-item"
            >{{
                formatDob(item.item.raw[header.topValue], 'uuuu-MM-dd', 'uuuu/MM/dd')
              }}</span>
            <span
              v-else
              class="top-column-item"
            >{{ item.item.raw[header.topValue] }}</span>
            <span class="double-column-item">{{ item.item.raw[header.doubleValue] }}</span>
            <br>
            <!-- if top and bottom value are the same, do not display the bottom value -->
            <v-tooltip
              v-if="header.bottomValue === 'memo'"
              bottom
            >
              <template #activator="{ on }">
                <span class="bottom-column-item">{{
                    firstMemoChars(item.item.raw[header.bottomValue])
                  }}</span>
              </template>
              <span>{{ item.item.raw[header.bottomValue] }}</span>
            </v-tooltip>
            <span
              v-else-if="['usualLastName','usualFirstName','usualMiddleNames'].includes(header.bottomValue)"
              class="bottom-column-item"
            >{{
                getUsualName(item.item.raw[header.bottomValue], item.item.raw[header.topValue])
              }}</span>
            <span
              v-else
              class="bottom-column-item"
            >{{ item.item.raw[header.bottomValue] }}</span>
          </div>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
import {formatDob} from '@/utils/format';
import router from '@/router';
import {REQUEST_TYPES} from '@/utils/constants';

export default {
  name: 'MergedStudentsDataTable',
  props: {
    mergedAndTrueStudents: {
      type: Array,
      required: true
    },
  },
  data: () => ({
    search: null,
  }),
  computed: {
    headers() {
      return [
        {
          topText: 'PEN', align: 'start', key: 'pen', title: 'PEN',
          topValue: 'pen', topTooltip: 'Personal Education Number'
        },
        {
          topText: 'Mincode',
          topValue: 'mincode',
          topTooltip: 'Mincode',
          key: 'mincode'
        },
        {
          topText: 'Jincode',
          topValue: 'jincode',
          topTooltip: 'Jincode',
          key: 'jincode'
        },
      ];
    }
  },
  methods: {
    formatDob,
    firstMemoChars(memo) {
      if (memo) {
        return memo.substring(0, 25);
      }
    },
    filterMerges(value, query, item) {
      console.log('Val: ' + JSON.stringify(value));
      console.log('query: ' + query);
      console.log('item: ' + JSON.stringify(item));

      return value != null &&
        query != null &&
        typeof value === 'string' &&
        value.toString().toLocaleUpperCase().indexOf(query) !== -1;
    },
    getUsualName(usual, legal) {
      if (usual === legal) {
        return '';
      }
      return usual;
    },
    isAPair(item) {
      const index = this.mergedAndTrueStudents.indexOf(item);
      return (index + 1) % 2 === 0;
    },
    itemRowBackground(item) {
      return item?.groupIndex % 2 === 0 ? 'grouped-row-even' : 'grouped-row-odd';
    },
    viewStudentDetails(studentID) {
      const route = router.resolve({name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
  }
};
</script>

<style scoped>
.odd-row {
    border: none !important;
}

.grouped-row-odd td {
    background-color: transparent !important; /* or #000 */
}

.grouped-row-even td {
    background-color: transparent !important; /* or #000 */
}

.grouped-row-odd {
    background-color: rgba(97, 114, 67, 0.24) !important;
}

.grouped-row-even {
    background-color: rgba(102, 7, 181, 0.06) !important;
}

.even-row {
    border-bottom: thin solid !important;
}

.double-column-item {
    float: right;
    font-size: 0.9em;
}

.top-column-item {
    float: left;
    font-size: 0.9em;
}

.header-font {
    font-size: 0.75em;
    font-weight: bold;
}

.bottom-column-item {
    float: left;
    min-height: 1.5em;
    font-size: 0.9em;
}

.tableCell {
    cursor: pointer;
}


</style>
