<template>
  <v-data-table
    id="mergedStatsDataTable"
    :headers="headers"
    :items="mergedAndTrueStudents"
    item-key="studentID"
    item-value="studentID"
    disable-sort
    :search="search"
    :item-class="itemRowBackground"
    :footer-props="{
      'items-per-page-options': [10]
    }"
    :items-per-page="10"
  >
    <template #top>
      <v-text-field
        v-model="search"
        label="Search"
        class="pa-4"
      />
    </template>
    <template
      v-for="h in headers"
      :key="h.id"
      #[`column.${h.key}`]="{ column }"
    >
      <v-row no-gutters
             v-if="column.shouldDisplay"
      >
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
          shouldDisplay: true,
          topText: 'PEN',
          align: 'start',
          key: 'pen',
          title: 'PEN',
          topValue: 'pen',
          topTooltip: 'Personal Education Number'
        },
        {
          shouldDisplay: true,
          topText: 'Legal Surname',
          key: 'legalLastName',
          bottomText: 'Usual Surname',
          topValue: 'legalLastName',
          bottomValue: 'usualLastName',
          topTooltip: 'Legal Surname',
          bottomTooltip: 'Usual Surname'
        },
        {
          shouldDisplay: false,
          key: 'usualLastName'
        },
        {
          shouldDisplay: true,
          topText: 'Legal Given',
          key: 'legalFirstName',
          bottomText: 'Usual Given',
          topValue: 'legalFirstName',
          bottomValue: 'usualFirstName',
          topTooltip: 'Legal Given',
          bottomTooltip: 'Usual Given'
        },
        {
          shouldDisplay: false,
          key: 'usualFirstName'
        },
        {
          shouldDisplay: true,
          topText: 'Legal Middle',
          key: 'legalMiddleNames',
          bottomText: 'Usual Middle',
          topValue: 'legalMiddleNames',
          bottomValue: 'usualMiddleNames',
          topTooltip: 'Legal Middle',
          bottomTooltip: 'Usual Middle'
        },
        {
          shouldDisplay: false,
          key: 'usualMiddleNames'
        },
        {
          shouldDisplay: true,
          topText: 'Postal Code',
          bottomText: 'Memo',
          topValue: 'postalCode',
          bottomValue: 'memo',
          topTooltip: 'Postal Code',
          bottomTooltip: 'Memo',
          key: 'postalCode'
        },
        {
          shouldDisplay: false,
          key: 'memo'
        },
        {
          shouldDisplay: true,
          topText: 'DC',
          doubleText: 'Gen',
          bottomText: 'Local ID',
          topValue: 'demogCode',
          doubleValue: 'genderCode',
          bottomValue: 'localID',
          topTooltip: 'Demographic Code',
          doubleTooltip: 'Gender',
          bottomTooltip: 'Local ID',
          key: 'genderCode'
        },
        {
          shouldDisplay: false,
          key: 'demogCode'
        },
        {
          shouldDisplay: false,
          key: 'localID'
        },
        {
          shouldDisplay: true,
          topText: 'Birth Date',
          bottomText: 'Grade',
          topValue: 'dob',
          bottomValue: 'gradeCode',
          topTooltip: 'Birth Date',
          bottomTooltip: 'Grade',
          key: 'dob'
        },
        {
          shouldDisplay: false,
          key: 'gradeCode'
        },
        {
          shouldDisplay: true,
          topText: 'Mincode',
          topValue: 'mincode',
          topTooltip: 'Mincode',
          key: 'mincode'
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
