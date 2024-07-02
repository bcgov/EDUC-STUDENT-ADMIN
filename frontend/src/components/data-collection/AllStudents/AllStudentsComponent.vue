<template>
  <v-container
    id="enrollmentTab"
    fluid
  >
    <div>
      <DetailComponent
        :config="config"
        :collection-object="collectionObject"
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
    collectionObject: {
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

