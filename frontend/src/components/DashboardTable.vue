<template>
  <v-card
    flat
    :color="colour"
    class="mt-2"
    height="100%"
  >
    <v-row class="pt-6 px-8">
      <v-col
        class="pa-0"
        cols="2"
      >
        <h3 class="dashboard-title mr-4">
          {{ title }}
        </h3>
      </v-col>
      <v-col
        v-for="(row, index) in tableData"
        :key="index"
        class="pa-4"
        cols="3"
      >
        <v-row class="pa-0">
          <h3>{{ row.title }}</h3>
        </v-row>
        <v-row
          v-for="(col, idx) in omit(row, 'title')"
          :key="idx"
          class="pt-2 listCol"
        >
          <div v-if="idx === 'heldReview' && col.data > 0">
            <router-link to="heldRequestBatch">
              <strong>{{ col.data }} {{ col.name }}</strong>
            </router-link>
          </div>
          <div v-else-if="idx === 'unreadMessages' && col.data > 0">
            <strong>{{ col.data }} {{ col.name }}</strong>
          </div>
          <div v-else-if="!row.error">
            {{ col.data }} {{ col.name }}
          </div>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="pt-4 px-8">
      <v-col cols="2" />
      <v-col
        v-for="(row, index) in tableData"
        :key="index"
        class="pt-4 py-0 px-0"
        cols="3"
      >
        <router-link :to="row.button.route">
          <PrimaryButton
            :id="row.title.replace(/ /g,'')+'Btn'"
            :text="row.button.text"
          />
        </router-link>
      </v-col>
    </v-row>

    <v-col />
  </v-card>
</template>
<script>
import omit from 'lodash/omit';
import PrimaryButton from './util/PrimaryButton.vue';

export default {
  name: 'DashboardTable',
  components: {
    PrimaryButton
  },
  props: {
    tableData: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: false,
      default: ''
    },
    colour: {
      type: String,
      required: false,
      default: ''
    }
  },
  methods: {
    omit(object, key) {
      return omit(object, key);
    },
  }
};
</script>

<style scoped>
.listCol {
  align-self: center;
}
.dashboard-title {
  word-break: break-word;
  font-size: 20px;
}
</style>
