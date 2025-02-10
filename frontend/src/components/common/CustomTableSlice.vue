<template>
  <div>
    <v-data-table-server
      v-model:page.sync="pageNumber"
      v-model:items-per-page.sync="pageSize"
      v-model="selected"
      :items-length="totalElements"
      :items="data"
      :headers="headers"
      mobile-breakpoint="0"
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
            <div v-else-if="column.title !== 'select'">
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
      <template #item="props">
        <tr
          class="hoverTable"
          :style="{'color': getRow(props.item.raw['sdcSchoolCollectionStudentStatusCode'])}"
          @click="rowClicked(props.item.raw)"
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
            <v-tooltip
              v-else-if="column.key === 'sdcSchoolCollectionStudentStatusCode'"
              :style="{ display: getSdcStudentStatusHoverText(props.item.raw['sdcSchoolCollectionStudentStatusCode'], props.item.raw['sdcSchoolCollectionStudentValidationIssues']) ? '' : 'none'}"
            >
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  size="25"
                  :color="getSdcStudentStatusIconColor(props.item.raw['sdcSchoolCollectionStudentStatusCode'])"
                >
                  {{ getSdcStudentIssueIcon(props.item.raw['sdcSchoolCollectionStudentStatusCode']) }}
                </v-icon>
              </template>
              <div style="white-space: pre-line;">
                {{ getSdcStudentStatusHoverText(props.item.raw['sdcSchoolCollectionStudentStatusCode'], props.item.raw['sdcSchoolCollectionStudentValidationIssues']) }}
              </div>
            </v-tooltip>
            <div v-else>
              <span v-if="column.key === 'studentPen'">
                {{ getAssignedPen(props.item.raw['assignedPen']) }}
              </span>
              <div v-else-if="column.key === 'schoolName'">
                <span v-if="readOnly || !hasEditPermission">
                  {{ props.item.raw['schoolName'] }}
                </span>
                <span v-else>
                  <a
                    :href="schoolSafeURL(props.item.raw.schoolID, props.item.raw.sdcSchoolCollectionID)"
                    target="_link"
                    :class="{ 'disabled-link': !props.item.raw.schoolID || !props.item.raw.sdcSchoolCollectionID }"
                    @click="$event.stopPropagation()"
                  >
                    {{ props.item.raw['schoolName'] }}
                  </a>
                </span>
              </div>
              <div v-else-if="column.key === 'districtName'">
                <span v-if="!props.item.raw.districtID || !props.item.raw.sdcDistrictCollectionID">-</span>
                <span v-else-if="readOnly || !hasEditPermission">
                  {{ props.item.raw['districtName'] }}
                </span>
                <span v-else>
                  <a
                    :href="districtSafeURL(props.item.raw.districtID, props.item.raw.sdcDistrictCollectionID)"
                    target="_link"
                    :class="{ 'disabled-link': !props.item.raw.districtID || !props.item.raw.sdcDistrictCollectionID }"
                    @click="$event.stopPropagation()"
                  >
                    {{ props.item.raw['districtName'] }}
                  </a>
                </span>
              </div>
              <span v-else-if="column.key === 'legalName'">
                {{ displayName(props.item.raw['legalFirstName'], props.item.raw['legalMiddleNames'], props.item.raw['legalLastName']) }}
              </span>
              <div v-else-if="column.key === 'isAdult'">
                <span v-if="props.item.raw['isAdult'] !== null || props.item.raw['isAdult' !== undefined]">{{ props.item.raw['isAdult'] === "true" ? 'Yes' : 'No' }}</span>
              </div>
              <div v-else-if="column.key === 'fte'">
                <span>{{ props.item.raw['fte'] === 0 ? 0 : props.item.raw['fte'] }}</span>
              </div>
              <div v-else-if="column.key === 'mappedIndigenousEnrolledProgram' || column.key === 'mappedLanguageEnrolledProgram'">
                <template v-if="props.item.raw[column.key]">
                  <span
                    v-for="(progs, idx) in props.item.raw[column.key].split(',')"
                    :key="idx"
                  >
                    <div>{{ progs }}</div>
                  </span>
                </template>
                <template v-else>
                  <div>-</div>
                </template>
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
              <span v-else-if="props.item.raw[column.key]">{{ props.item.raw[column.key] }}</span>
              <span v-else-if="column.title !== 'select'">-</span>
              <div v-if="column.hasOwnProperty('subHeader')">
                <div v-if="column.subHeader.key === 'usualName'">
                  <span v-if="props.item.raw['usualLastName'] || props.item.raw['usualFirstName'] || props.item.raw['usualMiddleNames']">
                    {{ displayName(props.item.raw['usualFirstName'], props.item.raw['usualMiddleNames'], props.item.raw['usualLastName']) }}
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
      <template #bottom>
        <div class="pagination-controls">
          <v-btn
            icon
            :disabled="!canLoadPrevious || isLoading"
            @click="$emit('loadPrevious')"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            icon
            :disabled="!canLoadNext || isLoading"
            @click="$emit('loadNext')"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<script>
import { displayName } from '@/utils/format';
import { appStore } from '@/store/modules/app';
import { mapState } from 'pinia';
import { authStore } from '@/store/modules/auth';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'CustomTableSlice',
  components: {},
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
    canLoadNext: {
      type: Boolean,
      required: true,
      default: false
    },
    canLoadPrevious: {
      type: Boolean,
      required: true,
      default: false
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['reload', 'openStudentDetails', 'selections', 'editSelectedRow', 'loadPrevious', 'loadNext'],
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
    hasEditPermission() {
      return this.hasRequiredPermission(this.user, PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION);
    }
  },
  watch: {
    pageNumber(val) {
      if (val) {
        this.masterCheckbox = false;
        this.selected = [];
        this.$emit('reload', { pageNumber: val });
      }
    },
    selected: {
      handler(val) {
        if (val) {
          this.$emit('selections', this.selected);
        }
      },
      deep: true
    },
    reset: {
      handler(val) {
        if (val) {
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
    authStore().getUserInfo().then(() => {
      this.user = this.userInfo;
    });
  },
  methods: {
    hasRequiredPermission,
    districtSafeURL(districtID, sdcDistrictCollectionId) {
      return sanitizeUrl(`${this.edxURL}/api/auth/silent_sdc_idir_login?districtID=${districtID}&sdcDistrictCollectionID=${sdcDistrictCollectionId}&idir_guid=${this.user?.userGuid?.toLowerCase()}`);
    },
    schoolSafeURL(schoolID, sdcSchoolCollectionId) {
      return sanitizeUrl(`${this.edxURL}/api/auth/silent_sdc_idir_login?schoolID=${schoolID}&sdcSchoolCollectionID=${sdcSchoolCollectionId}&idir_guid=${this.user?.userGuid?.toLowerCase()}`);
    },
    rowClicked(props) {
      this.$emit('editSelectedRow', props);
    },
    onClick(prop) {
      let selectedValue = prop.item.raw;
      if (this.isSelected(selectedValue)) {
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
      if (this.selected.length !== 0 || this.isAllSelected()) {
        this.selected.splice(0);
      } else {
        this.selected = [...this.data];
      }
      this.masterCheckbox = this.selected.length > 0 && this.isAllSelected();
    },
    getSdcStudentStatusIconColor(status) {
      if (status === 'FUNDWARN') {
        return '#ff9800';
      } else if (status === 'INFOWARN') {
        return '#2196F3';
      } else if (status === 'ERROR') {
        return 'rgb(217, 6, 6)';
      } else if (status === 'DELETED') {
        return 'grey';
      }
    },
    getSdcStudentIssueIcon(status) {
      if (status === 'FUNDWARN') {
        return 'mdi-alert-outline';
      } else if (status === 'INFOWARN') {
        return 'mdi-alert-circle-outline';
      } else if (status === 'ERROR') {
        return 'mdi-alert-circle-outline';
      } else if (status === 'DELETED') {
        return 'mdi-delete-circle-outline';
      }
    },
    getSdcStudentStatusHoverText(status) {
      if (status === 'FUNDWARN') {
        return 'Funding Warning';
      } else if (status === 'INFOWARN') {
        return 'Info Warning';
      } else if (status === 'ERROR') {
        return 'Error';
      } else if (status === 'DELETED') {
        return 'Removed from collection';
      }
    },
    getRow(status) {
      if(status === 'DELETED') {
        return 'grey';
      } else {
        return 'black';
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

:deep(.v-data-table-footer__items-per-page) {
  display: none;
}

tr:hover td {
  background-color: #e8e8e8 !important;
  cursor: pointer;
}

.school-router {
  color: #003366;
}

.school-router:hover {
  text-decoration: underline;
}

.disabled-link {
  color: grey;
  cursor: not-allowed;
  text-decoration: none;
}

.pagination-controls {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: .5rem;
  padding-bottom: .2rem;
  padding-top: 1rem;
}
</style>
