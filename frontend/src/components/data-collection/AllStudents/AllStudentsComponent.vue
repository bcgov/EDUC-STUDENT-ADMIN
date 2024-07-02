<template>
  <v-container
      id="enrollmentTab"
      fluid
  >
    <v-row class="mt-3 mb-3">
      <v-btn-toggle rounded="0">
        <v-btn
            id="detailButton"
            size="large"
            class="detail-button"
            :class="{ 'active-button': reportView === 'detail' }"
            @click="showDetail"
        >
          Detail View
        </v-btn>
      </v-btn-toggle>
    </v-row>

    <div v-if="reportView === 'detail'">
      <DetailComponent
          :config="config"
          :district="district"
          :show-export-btn="true"
      />
    </div>
  </v-container>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import DetailComponent from './DetailComponent.vue';
import {FTE} from '@/utils/sdc/collectionTableConfiguration.js';

export default {
  name: 'AllStudentsComponent',
  components: {
    DetailComponent
  },
  mixins: [alertMixin],
  props: {
    district: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: [],
  data() {
    return {
      reportView: 'detail',
      config: FTE

    };
  },
  computed: {

  },
  created() {
  },
  methods: {
    showDetail() {
      this.reportView = 'detail';

    },

  }
};
</script>

<style scoped>
.detail-button {
  border: 1px solid lightgray;
}

.active-button {
  background-color: #003366 !important;
  color: white !important;
  border: 1px solid #003366;
}
</style>

