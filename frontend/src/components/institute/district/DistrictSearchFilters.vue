<template>
  <v-card
    flat
    class="filter-card"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Filters
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="close()"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col class="d-flex justify-start">
          <PrimaryButton
            id="clear-filter"
            secondary
            large-icon
            icon="mdi-filter-off-outline"
            text="Clear All"
            @click-action="clear"
          />
        </v-col>
      </v-row>
      <v-row
        class="px-3"
      >
        <v-col class="pt-0">
          <v-row no-gutters>
            <v-col
              cols="12"
              md="12"
            >
            <v-autocomplete
            id="district-text-field"
            v-model="districtCodeNameFilterVal"
            :clearable="true"
            :items="districtSearchNames"
            item-title="districtNumberName"
            variant="underlined"
            item-value="districtId"
            :menu-props="{closeOnContentClick:true}"
            label="District Number & Name"
            @update:model-value="districtCodeNameFilter = $event; apply('districtCodeNameFilter')"
          >
            <template #prepend-inner>
              <v-icon
                v-if="districtCodeNameFilterVal"
                class="pt-1"
                :color="getStatusColor(districtSearchNames.find(item=>item.districtId===districtCodeNameFilterVal)?.status)"
              >
                mdi-circle-medium
              </v-icon>
            </template>
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-circle-medium"
                :base-color="getStatusColor(item.raw.status)"
                title=""
              >
                <v-list-item-title style="color: black !important;">
                  {{
                    item.raw.districtNumberName
                  }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
            </v-col>
            <v-col
              cols="12"
              md="12"
            >
            <v-select
            id="status-select-field"
            v-model="districtStatusFilterVal"
            :clearable="true"
            :items="status"
            item-title="label"
            variant="underlined"
            item-value="districtStatusCode"
            :menu-props="{closeOnContentClick:true}"
            label="Status"
            @update:model-value="districtStatusFilter = $event; apply('districtStatusFilter')"
          >
            <template #prepend-inner>
              <v-icon
                v-if="districtStatusFilterVal"
                class="pt-1"
                :color="getStatusColor(districtStatusFilterVal)"
              >
                mdi-circle-medium
              </v-icon>
            </template>
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-circle-medium"
                :base-color="getStatusColor(item.raw.districtStatusCode)"
                title=""
              >
                <v-list-item-title style="color: black !important;">
                  {{
                    item.raw.label
                  }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
  
<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import ApiService from '@/common/apiService';
import {appStore} from '@/store/modules/app';
import {mapState} from 'pinia';
import {sortByNameValue} from '@/utils/format';
  
export default {
  name: 'DistrictSearchFilters',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    districtCodeNameFilter: {
      type: String,
      required: false,
      default: null
    },
    districtStatusFilter: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: ['clearFilters', 'close', 'apply-districtCodeNameFilter', 'apply-districtStatusFilter'],
  data() {
    return {
      districtStatusFilterVal: this.districtStatusFilter,
      districtCodeNameFilterVal: this.districtCodeNameFilter,
      selected: {},
      schoolStatus: [],
      districtSearchNames: [],
      status: [
        {label: 'Active', districtStatusCode: 'ACTIVE'},
        {label: 'Inactive', districtStatusCode: 'INACTIVE'}
      ],
    };
  },
  computed: {
    ...mapState(appStore, ['districtMap',]),
  },
  async beforeMount() {
  },
  created() {
    this.getDistrictDropDownItems();

  },
  methods: {
    sortByNameValue,
    getStatusColor(districtStatusCode) {
      if (districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if (districtStatusCode === 'INACTIVE') {
        return 'red';
      }
    },
    getDistrictDropDownItems() {
      ApiService.getDistricts().then((response) => {
        for (const district of response.data) {
          let districtItem = {
            districtNumberName: `${district.districtNumber} - ${district.name}`,
            districtId: district.districtId,
            status: district.districtStatusCode
          };
          this.districtSearchNames.push(districtItem);
        }
        this.districtSearchNames = this.sortByNameValue(this.districtSearchNames, 'districtNumberName');
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting districts. Please try again later.');
      });
    },
    getDistrictStatusColor(districtStatusCode) {
      if (districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if (districtStatusCode === 'INACTIVE') {
        return 'red';
      }
    },
    close() {
      this.$emit('close');
    },
    clear() {
      this.districtCodeNameFilterVal = null;
      this.districtStatusFilterVal = 'ACTIVE';
      this.$emit('clearFilters');
    },
    apply(type) {
      if(type === 'districtCodeNameFilter'){
        this.$emit('apply-districtCodeNameFilter', this.districtCodeNameFilter);
      }else if(type === 'districtStatusFilter'){
        console.log(this.districtStatusFilter)
        this.$emit('apply-districtStatusFilter', this.districtStatusFilter);
      }
    }
  }
};
</script>
  <style scoped>
  .sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
  }

  .filter-heading {
    font-weight: bold;
    color: #003366;
    margin-top: 1em;
  }

  .filter-button {
    color: #003366;
    padding: 5px;
    margin: 0 8px 8px 8px;
    border: 1px solid #003366;
  }

  .filter-toggle {
    flex-wrap: wrap !important;
    overflow: visible !important;
    height: auto !important;
  }

  #courses-slider {
    margin: 0 8px 8px 8px;
  }

  .slider-text {
    width: 5em;
    font-size: 0.875rem;
    border-color: #003366;
  }
  </style>
    
    
  
