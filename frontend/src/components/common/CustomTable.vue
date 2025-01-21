<template>
  <div>
    <v-data-table-server
      v-model:page.sync="pageNumber"
      v-model:items-per-page.sync="pageSize"
      v-model="selected"
      :class="itemsPerPageOptions.length === 0 ? 'hide-items-per-page' : ''"
      :items-length="totalElements"
      :items="data"
      :headers="headers"
      mobile-breakpoint="0"
      :items-per-page-options="itemsPerPageOptions"
    >
      <template #top>
        <v-progress-linear
          v-show="isLoading"
          :indeterminate="true"
          color="primary"
        />
      </template>
      <template #headers>
        <tr class="header-row">
          <th
            v-for="column in headers"
            id="header"
            :key="column.key"
          >
            <div v-if="column.title === 'select'">
              <v-checkbox
                v-model="masterCheckbox"
                :indeterminate="selected.length > 0 && !isAllSelected()"
                hide-details="true"
                @change="toggle()"
              />
            </div>
            <div v-else-if="column.title === 'PEN'">
              <div class="header-text">
                Assigned PEN
              </div>
              <div
                v-if="column.hasOwnProperty('subHeader')"
                class="header-text"
              >
                {{ column.subHeader.title }}
              </div>
            </div>
            <div v-else-if="!['select', 'toolTip'].includes(column.title)">
              <div class="header-text">
                {{ column.title }}
              </div>
              <div
                v-if="column.hasOwnProperty('subHeader')"
                class="header-text"
              >
                {{ column.subHeader.title }}
              </div>
            </div>
          </th>
        </tr>
      </template>
      <template #item="{props, index}">
        <tr
          :class="clickable ? `hoverTable`:``"
          @click="rowclicked(props.item.raw)"
        >
          <td
            v-for="column in headers"
            :key="column.key"
            class="td-data"
          >
            <v-checkbox
              v-if="column.title === 'select'"
              :model-value="isSelected(props.item.raw) !== undefined"
              hide-details="true"
              @click.prevent.stop="onClick(props)"
            />
            <span
              v-else-if="column.title === 'toolTip' && props.item.raw.toolTipText"
            >
              <slot
                name="toolTip"
                :tool-tip-text="props.item.raw.toolTipText"
                :chip-text="data[index].toolTipChipText"
              />
            </span>
            <div
              v-else
            >
              <span>
                <span
                  v-if="column.key === 'studentPen'"
                  :class="highlightChanges && index !== data.length-1 && data[index][column.key] !== data[index+1]?.[column.key] ? `highlight`: ``"
                >
                  {{ getAssignedPen(props.item.raw['assignedPen']) }}
                </span>

                <div
                  v-else-if="column.key === 'schoolName'"
                  :class="highlightChanges && index !== data.length-1 && data[index][column.key] !== data[index+1]?.[column.key] ? `highlight`: ``"
                >
                  <a
                    v-if="showLinks"
                    :href="schoolSafeURL(props.item.raw.schoolID, props.item.raw.sdcSchoolCollectionID)"
                    target="_link"
                    :class="{ 'disabled-link': !props.item.raw.schoolID || !props.item.raw.sdcSchoolCollectionID }"
                    @click.stop="props.item.raw.schoolID && props.item.raw.sdcSchoolCollectionID ? true : $event.preventDefault()"
                  >
                    {{ props.item.raw['schoolName'] }}
                  </a>
                  <span v-else>
                    {{ props.item.raw['schoolName'] }}
                  </span>
                </div>
                <div
                  v-else-if="column.key === 'districtName'"
                  :class="highlightChanges && index !== data.length-1 && data[index][column.key] !== data[index+1]?.[column.key] ? `highlight`: ``"
                >
                  <a
                    v-if="showLinks"
                    :href="districtSafeURL(props.item.raw.districtID, props.item.raw.sdcDistrictCollectionID)"
                    target="_link"
                    :class="{ 'disabled-link': !props.item.raw.districtID || !props.item.raw.sdcDistrictCollectionID }"
                    @click.stop="props.item.raw.districtID && props.item.raw.sdcDistrictCollectionID ? true : $event.preventDefault()"
                  >
                    {{ props.item.raw['districtName'] }}
                  </a>
                  <span v-else>
                    {{ props.item.raw['districtName'] }}
                  </span>
                </div>

                <span v-else-if="column.key === 'legalName'">
                  <span :class="highlightChanges && index !== data.length-1 && data[index]['legalLastName'] !== data[index+1]?.['legalLastName'] ? `highlight`: ``">
                    {{ props.item.raw['legalLastName'] }}
                  </span>
                  <span v-if="props.item.raw['legalFirstName'] || props.item.raw['legalMiddleNames']">,
                    <span
                      v-if="props.item.raw['legalFirstName']"
                      :class="highlightChanges && index !== data.length-1 && data[index]['legalFirstName'] !== data[index+1]?.['legalFirstName'] ? `highlight`: ``"
                    > {{ props.item.raw['legalFirstName'] }}</span>
                    <span
                      v-if="props.item.raw['legalMiddleNames']"
                      :class="highlightChanges && index !== data.length-1 && data[index]['legalMiddleNames'] !== data[index+1]?.['legalMiddleNames'] ? `highlight`: ``"
                    > ({{ props.item.raw['legalMiddleNames'] }})</span>
                  </span>
                </span>

                <div v-else-if="column.key === 'isAdult'">
                  <span
                    v-if="props.item.raw['isAdult'] !== null || props.item.raw['isAdult' !== undefined]"
                    :class="highlightChanges && index !== data.length-1 && data[index][column.key] !== data[index+1]?.[column.key] ? `highlight`: ``"
                  >
                    {{ props.item.raw['isAdult'] === "true" ? 'Yes' : 'No' }}
                  </span>
                </div>

                <div v-else-if="column.key === 'fte'">
                  <span :class="highlightChanges && index !== data.length-1 && data[index][column.key] !== data[index+1]?.[column.key] ? `highlight`: ``">{{ props.item.raw['fte'] === 0 ? 0 : props.item.raw['fte'] }}</span>
                </div>
                <div v-else-if="column.key === 'mappedIndigenousEnrolledProgram' || column.key === 'mappedLanguageEnrolledProgram'">
                  <template v-if="props.item.raw[column.key]">
                    <span
                      v-for="(progs, idx) in props.item.raw[column.key].split(',')"
                      :key="idx"
                      :class="highlightChanges && index !== data.length-1 && data[index][column.key] !== data[index+1]?.[column.key] ? `highlight`: ``"
                    >
                      <div>{{ progs }}</div>
                    </span>
                  </template>
                  <template v-else>
                    <div>-</div>
                  </template>
                </div>
                <div v-else-if="column.key === 'updateDate'">
                  <span>{{ formatDateFromDateTime(props.item.raw[column.key]) }}</span>
                </div>
                <div v-else-if="column.key === 'snapshotDate'">
                  <span>{{ formatSnapshotDate(props.item.raw[column.key]) }}</span>
                </div>
                <span v-else-if="column.key === 'resolution'">
                  <slot
                    :sdc-school-collection-student="props.item.raw"
                    name="resolution"
                  >
                    <template v-if="props.item.raw[column.key]">
                      {{ props.item.raw[column.key] }}
                    </template>
                    <template v-else>-</template>
                  </slot>
                </span>
                <span
                  v-else-if="props.item.raw[column.key]"
                  :class="highlightChanges && index !== data.length-1 && data[index][column.key] !== data[index+1]?.[column.key] ? `highlight`: ``"
                >
                  {{ props.item.raw[column.key] }}
                </span>
                <span v-else-if="!['select', 'toolTip'].includes(column.title)">-</span>
              </span>
              <div
                v-if="column.hasOwnProperty('subHeader')"
                :class="highlightChanges && index !== data.length-1 && data[index][column.subHeader.key] !== data[index+1]?.[column.subHeader.key] ? `highlight td-data`: `td-data`"
              >
                <div v-if="column.subHeader.key === 'usualName'">
                  <span :class="highlightChanges && index !== data.length-1 && data[index]['usualLastName'] !== data[index+1]?.['usualLastName'] ? `highlight`: ``">
                    {{ props.item.raw['usualLastName'] }}
                  </span>
                  <span v-if="props.item.raw['usualFirstName'] || props.item.raw['usualMiddleNames']">,
                    <span
                      v-if="props.item.raw['usualFirstName']"
                      :class="highlightChanges && index !== data.length-1 && data[index]['usualFirstName'] !== data[index+1]?.['usualFirstName'] ? `highlight`: ``"
                    > {{ props.item.raw['usualFirstName'] }}</span>
                    <span
                      v-if="props.item.raw['usualMiddleNames']"
                      :class="highlightChanges && index !== data.length-1 && data[index]['usualMiddleNames'] !== data[index+1]?.['usualMiddleNames'] ? `highlight`: ``"
                    > ({{ props.item.raw['usualMiddleNames'] }})</span>
                  </span>
                  <span v-else>-</span>
                </div>
                <div v-else-if="column.subHeader.key === 'isGraduated'">
                  <span v-if="props.item.raw['isGraduated'] !== null || props.item.raw['isGraduated'] !== undefined">{{ props.item.raw['isGraduated'] === "true" ? 'Yes' :'No' }}</span>
                </div>
                <span v-else-if="props.item.raw[column.subHeader.key]">{{ props.item.raw[column.subHeader.key] }}</span>
                <span v-else>-</span>
              </div>
            </div>
          </td>
        </tr>
      </template>
      <template
        v-if="hidePagination"
        #bottom
      />
    </v-data-table-server>
  </div>
</template>

<script>

import {displayName} from '@/utils/format';
import {appStore} from '@/store/modules/app';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {DateTimeFormatter, LocalDateTime, LocalDate} from '@js-joda/core';

export default {
  name: 'CustomTable',
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
    },
    hidePagination: {
      type: Boolean,
      default: false
    },
    totalElements: {
      type: Number,
      required: true,
      default: 0
    },
    isLoading: {
      type: Boolean,
      required: true,
      default: false
    },
    highlightChanges: {
      type: Boolean,
      default: false
    },
    showLinks: {
      type: Boolean,
      default: true
    },
    clickable: {
      type: Boolean,
      default: true
    },
    itemsPerPageOptions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['reload', 'openStudentDetails', 'selections', 'editSelectedRow'],
  data() {
    return {
      masterCheckbox: false,
      selected: [],
      pageNumber: 1,
      pageSize: 15,
      loading: true,
      edxURL: null,
      user: null
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
  },
  watch: {
    pageSize(newPageSize) {
      this.masterCheckbox = false;
      this.selected = [];
      this.$emit('reload', {pageNumber: 0, pageSize: newPageSize});
    },
    pageNumber: {
      handler(val) {
        if(val) {
          this.masterCheckbox = false;
          this.selected = [];
          this.$emit('reload', {pageNumber: val});
        }
      },
      immediate: true
    },
    selected: {
      handler(val) {
        if(val) {
          this.$emit('selections', this.selected);
        }
      },
      deep: true
    },
    reset: {
      handler(val) {
        if(val) {
          this.masterCheckbox = false;
          this.selected.splice(0);
        }
      },
      immediate: true
    }
  },
  created() {
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
    authStore().getUserInfo().then(()=> {
      this.user = this.userInfo;
    });
  },
  methods: {
    districtSafeURL(districtID, sdcDistrictCollectionId) {
      return sanitizeUrl(`${this.edxURL}/api/auth/silent_sdc_idir_login?districtID=${districtID}&sdcDistrictCollectionID=${sdcDistrictCollectionId}&idir_guid=${this.user?.userGuid?.toLowerCase()}`);
    },
    schoolSafeURL(schoolID, sdcSchoolCollectionId) {
      return sanitizeUrl(`${this.edxURL}/api/auth/silent_sdc_idir_login?districtID=${schoolID}&sdcDistrictCollectionID=${sdcSchoolCollectionId}&idir_guid=${this.user?.userGuid?.toLowerCase()}`);
    },
    rowclicked(props) {
      this.$emit('editSelectedRow', props);
    },
    onClick(prop) {
      let selectedValue = prop.item.raw;
      if(this.isSelected(selectedValue)) {
        this.selected.splice(this.selected.findIndex(value => value.sdcSchoolCollectionStudentID === selectedValue.sdcSchoolCollectionStudentID), 1);
      } else {
        this.selected.push(prop.item.raw);
      }
      this.masterCheckbox = this.selected.length > 0 && this.isAllSelected();
    },
    isSelected(selectedValue) {
      return this.selected.find(value => value.sdcSchoolCollectionStudentID === selectedValue.sdcSchoolCollectionStudentID);
    },
    isAllSelected() {
      const numSelected = this.selected.length;
      const totalRows = this.data.length;
      return numSelected === totalRows;
    },
    toggle() {
      if(this.selected.length !== 0 || this.isAllSelected()) {
        this.selected.splice(0);
      } else {
        this.selected = [...this.data];
      }
      this.masterCheckbox = this.selected.length > 0 && this.isAllSelected();
    },
    formatDateFromDateTime(inputDate) {
      const date = LocalDateTime.parse(inputDate);
      return date.format(DateTimeFormatter.ofPattern('yyyy/MM/dd'));
    },
    formatSnapshotDate(inputDate) {
      const date = LocalDate.parse(inputDate);
      return date.format(DateTimeFormatter.ofPattern('yyyy/MM/dd'));
    },
    getSdcStudentStatusIconColor(status) {
      if (status === 'FUNDWARN') {
        return '#ff9800';
      }
      else if (status === 'INFOWARN') {
        return '#2196F3';
      }
    },
    getSdcStudentIssueIcon(status) {
      if (status === 'FUNDWARN') {
        return 'mdi-alert-outline';
      }
      else if (status === 'INFOWARN') {
        return 'mdi-alert-circle-outline';
      }
    },
    getSdcStudentStatusHoverText(status) {
      if (status === 'FUNDWARN') {
        return 'Funding Warning';
      } else if (status === 'INFOWARN') {
        return 'Info Warning';
      }
    },
    getAssignedPen(assignedPen) {
      if (assignedPen) {
        return assignedPen;
      } else {
        return 'Under Review';
      }
    },
    displayName
  }
};
</script>

<style scoped>
.header-text {
  color: #7f7f7f;
}

 .header-row {
    border-bottom-style: groove;
    border-bottom-color: rgb(255 255 255 / 45%);
    vertical-align: top !important;
 }

:deep(.hide-items-per-page .v-data-table-footer__items-per-page) {
  display: none;
}

 .hoverTable tr:hover td {
  background-color: #e8e8e8 !important;
  cursor: pointer;
}

.school-router{
  color: #003366;
}

.school-router:hover{
  text-decoration: underline;
}

.disabled-link {
  color: grey;
  cursor: not-allowed;
  text-decoration: none;
}
.highlight {
  font-weight: bold;
  color: #008000 !important;
}
</style>
