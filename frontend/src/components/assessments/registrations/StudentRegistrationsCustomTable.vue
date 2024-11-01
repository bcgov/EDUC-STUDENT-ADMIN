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
          <th v-for="column in headers" id="header" :key="column.key">            
            <div v-if="column.title !== 'select'">
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
          @click="rowClicked(props.item.raw)"
        >
          <td v-for="column in headers" :key="column.key" class="td-data">
            <div>              
              <div v-if="column.key === 'schoolName'">
                <span v-if="readOnly">
                  {{ props.item.raw["schoolName"] }}
                </span>
                <span v-else>
                  <a
                    href="#"
                    target="_link"
                    :class="{ 'disabled-link': !props.item.raw.schoolID }"
                    @click="$event.stopPropagation()"
                  >
                    {{ props.item.raw["schoolName"] }}
                  </a>
                </span>
              </div>
              <div v-else-if="column.key === 'districtName'">
                <span v-if="!props.item.raw.districtID">-</span>
                <span v-else-if="readOnly">
                  {{ props.item.raw["districtName"] }}
                </span>
                <span v-else>
                  <a
                    href="#"
                    target="_link"
                    :class="{ 'disabled-link': !props.item.raw.districtID }"
                    @click="$event.stopPropagation()"
                  >
                    {{ props.item.raw["districtName"] }}
                  </a>
                </span>
              </div>           
              <span v-else-if="props.item.raw[column.key]">{{
                props.item.raw[column.key]
              }}</span>
              <span v-else-if="column.title !== 'select'">-</span>              
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

export default {
  name: 'StudentRegistrationsCustomTable',
  components: {},
  props: {
    headers: {
      type: Array,
      required: true,
      default: null,
    },
    data: {
      type: Array,
      required: true,
      default: null,
    },
    hidePagination: {
      type: Boolean,
      default: false,
    },
    totalElements: {
      type: Number,
      required: true,
      default: 0,
    },
    isLoading: {
      type: Boolean,
      required: true,
      default: false,
    },
    canLoadNext: {
      type: Boolean,
      required: true,
      default: false,
    },
    canLoadPrevious: {
      type: Boolean,
      required: true,
      default: false,
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: [ 'reload', 'openStudentDetails', 'selections', 'editSelectedRow', 'loadPrevious', 'loadNext'],
  data() {
    return {
      masterCheckbox: false,
      selected: [],
      pageNumber: 1,
      pageSize: 15,
      loading: true,
      edxURL: null,
      user: null,
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
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
      deep: true,
    },
    reset: {
      handler(val) {
        if (val) {
          this.masterCheckbox = false;
          this.selected.splice(0);
        }
      },
      immediate: true,
    },
  },
  created() {
    appStore()
      .getConfig()
      .then(() => {
        this.edxURL = this.config.EDX_URL;
      });
    authStore()
      .getUserInfo()
      .then(() => {
        this.user = this.userInfo;
      });
  },
  methods: {
    districtSafeURL(districtID) {
      return sanitizeUrl(
        `${
          this.edxURL
        }/api/auth/silent_sdc_idir_login?districtID=${districtID}&idir_guid=${this.user?.userGuid?.toLowerCase()}`
      );
    },
    schoolSafeURL(schoolID) {
      return sanitizeUrl(
        `${
          this.edxURL
        }/api/auth/silent_sdc_idir_login?schoolID=${schoolID}&idir_guid=${this.user?.userGuid?.toLowerCase()}`
      );
    },
    rowClicked(props) {
      this.$emit('editSelectedRow', props);
    },
    onClick(prop) {
      this.selected.push(prop.item.raw);
      this.masterCheckbox = this.selected.length > 0 && this.isAllSelected();
    },        
    displayName,
  },
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
  gap: 0.5rem;
  padding-bottom: 0.2rem;
  padding-top: 1rem;
}
</style>
