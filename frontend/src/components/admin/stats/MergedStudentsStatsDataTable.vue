<template>
  <v-data-table
    id="mergedStatsDataTable"
    :headers="headers"
    :items="mergedAndTrueStudents"
    item-key="studentID"
    disable-sort
    :item-class="itemRowBackground"
    :footer-props="{
    'items-per-page-options': [12]
  }"
    :items-per-page="12"
  >
    <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
        <span :key="h.id" class="top-column-item" :title="header.topTooltip">
          {{ header.topText }}
        </span>
      <span :key="h.id">

        </span>
      <span :key="h.id" class="double-column-item" :title="header.doubleTooltip">{{ header.doubleText }}</span>
      <br :key="h.id"/>
      <span :key="h.id" class="bottom-column-item" :title="header.bottomTooltip">{{ header.bottomText }}</span>
    </template>
    <template v-slot:item="props">
      <tr :class="itemRowBackground(props.item)">
        <td :class="isAPair(props.item)?'even-row':'odd-row'" v-for="header in props.headers" :key="header.id">
          <div class="tableCell">
              <span v-if="header.topValue === 'dob'" class="top-column-item">{{
                  formatDob(props.item[header.topValue], 'uuuu-MM-dd', 'uuuu/MM/dd')
                }}</span>
            <span v-else class="top-column-item">{{ props.item[header.topValue] }}</span>
            <span class="double-column-item">{{ props.item[header.doubleValue] }}</span>
            <br>
            <!-- if top and bottom value are the same, do not display the bottom value -->
            <v-tooltip v-if="header.bottomValue === 'memo'" bottom>
              <template v-slot:activator="{ on }">
                  <span v-on="on" class="bottom-column-item">{{
                      firstMemoChars(props.item[header.bottomValue])
                    }}</span>
              </template>
              <span>{{ props.item[header.bottomValue] }}</span>
            </v-tooltip>
            <span v-else-if="['usualLastName','usualFirstName','usualMiddleNames'].includes(header.bottomValue)"
                  class="bottom-column-item">{{
                getUsualName(props.item[header.bottomValue], props.item[header.topValue])
              }}</span>
            <span v-else class="bottom-column-item">{{ props.item[header.bottomValue] }}</span>
          </div>
        </td>
      </tr>

    </template>

  </v-data-table>
</template>

<script>
import {formatDob} from '@/utils/format';

export default {
  name: 'MergedStudentsDataTable',
  props: {
    mergedAndTrueStudents: {
      type: Array,
      required: true
    },
    penSearch: {
      type: String,
      defaultValue: '',
    },
    mincodeSearch: {
      type: String,
      defaultValue: '',
    },
    legalSurnameSearch: {
      type: String,
      defaultValue: '',
    },
    legalGivenNameSearch: {
      type: String,
      defaultValue: '',
    },
    legalMiddleNameSearch: {
      type: String,
      defaultValue: '',
    },
  },
  data: () => ({}),
  watch: {
    penSearch(newValue) {
      this.penSearch = newValue;
    },
    mincodeSearch(newValue) {
      this.mincodeSearch = newValue;
    },
    legalSurnameSearch(newValue) {
      this.legalSurnameSearch = newValue;
    },
    legalGivenNameSearch(newValue) {
      this.legalGivenNameSearch = newValue;
    },
    legalMiddleNameSearch(newValue) {
      this.legalMiddleNameSearch = newValue;
    },

  },
  computed: {
    headers() {
      return [
        {
          topText: 'PEN', align: 'start',
          topValue: 'pen', topTooltip: 'Personal Education Number',
          filter: (value, search, item) => {
            if (!this.penSearch) return true;
            return item.pen?.includes(this.penSearch);
          },
        },
        {
          topText: 'Legal Surname',
          filter: (value, search, item) => {
            if (!this.legalSurnameSearch) return true;
            return item.legalLastName?.includes(this.legalSurnameSearch.toUpperCase());
          },
          bottomText: 'Usual Surname',
          topValue: 'legalLastName',
          bottomValue: 'usualLastName',
          topTooltip: 'Legal Surname',
          bottomTooltip: 'Usual Surname'
        },
        {
          topText: 'Legal Given',
          filter: (value, search, item) => {
            if (!this.legalGivenNameSearch) return true;
            return item.legalFirstName?.includes(this.legalGivenNameSearch.toUpperCase());
          },
          bottomText: 'Usual Given',
          topValue: 'legalFirstName',
          bottomValue: 'usualFirstName',
          topTooltip: 'Legal Given',
          bottomTooltip: 'Usual Given'
        },
        {
          topText: 'Legal Middle',
          filter: (value, search, item) => {
            if (!this.legalMiddleNameSearch) return true;
            return item.legalMiddleNames?.includes(this.legalMiddleNameSearch.toUpperCase());
          },
          bottomText: 'Usual Middle',
          topValue: 'legalMiddleNames',
          bottomValue: 'usualMiddleNames',
          topTooltip: 'Legal Middle',
          bottomTooltip: 'Usual Middle'
        },
        {
          topText: 'Postal Code',
          bottomText: 'Memo',
          topValue: 'postalCode',
          bottomValue: 'memo',
          topTooltip: 'Postal Code',
          bottomTooltip: 'Memo'
        },
        {
          topText: 'DC',
          doubleText: 'Gen',
          bottomText: 'Local ID',
          topValue: 'demogCode',
          doubleValue: 'genderCode',
          bottomValue: 'localID',
          topTooltip: 'Demographic Code',
          doubleTooltip: 'Gender',
          bottomTooltip: 'Local ID'
        },
        {
          topText: 'Birth Date',
          bottomText: 'Grade',
          topValue: 'dob',
          bottomValue: 'gradeCode',
          topTooltip: 'Birth Date',
          bottomTooltip: 'Grade'
        },
        {
          topText: 'Mincode',
          filter: (value, search, item) => {
            if (!this.mincodeSearch) return true;
            return item.mincode?.includes(this.mincodeSearch);
          },
          topValue: 'mincode',
          topTooltip: 'Mincode'
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
    }
  }
};
</script>

<style scoped>
.odd-row {
  border: none !important;
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
}

.top-column-item {
  float: left;
}

.bottom-column-item {
  float: left;
  min-height: 1.5em;
}

.tableCell {
  cursor: pointer;
}


</style>
