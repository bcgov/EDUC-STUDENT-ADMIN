<template>
  <v-container fluid>
    <v-row class="mt-3 mb-3">
      <v-btn-toggle rounded="0">
        <v-btn
          id="penReviewButton"
          size="large"
          class="detail-button"
          :class="{ 'active-button': view === 'review' }"
          @click="showReview"
        >
          PEN Review
        </v-btn>
        <v-btn
          id="newPenButton"
          size="large"
          class="summary-button"
          :class="{ 'active-button': view === 'new' }"
          @click="showNew"
        >
          New PENs
        </v-btn>
      </v-btn-toggle>
    </v-row>

    <div v-if="view === 'review'">
      <PenReview 
       :collection-object="collectionObject"
      />
    </div>
    <div v-if="view === 'new'">
      <NewPen 
      :collection-object="collectionObject"/>
    </div>
  </v-container>
</template>
<script>

import PenReview from '../data-collection/PenReview.vue';
import NewPen from '../data-collection/NewPen.vue';

export default {
  name: 'PenMatch',
  components: {
    PenReview,
    NewPen
  },
  mixins: [],
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  emits: ['next'],
  data() {
    return {
      view: 'review',
    };
  },
  computed: {
     
  },
  async created() {
   
  },
  methods: {
    showReview() {
      this.view = 'review';

    },
    showNew() {
      this.view = 'new';
    }
  }
};
</script>
  
  <style scoped>
  .detail-button {
  border: 1px solid lightgray;
}

.summary-button {
  border: 1px solid lightgray;
}

.active-button {
  background-color: #003366 !important;
  color: white !important;
  border: 1px solid #003366;
}
  </style>
  
