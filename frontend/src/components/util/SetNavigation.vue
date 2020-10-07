<template>
  <div v-if="totalNumber > 0">
    <span class="mr-8 nav-title">{{title}}</span>
    <v-btn 
      class="mr-3"
      id="preRecord"
      icon
      small
      :disabled="preDisabled"
      @click="clickBtn(preRoute)"
    >
      <v-icon large>fa-arrow-alt-circle-left</v-icon>
    </v-btn >
    <v-btn 
      id="nextRecord"
      icon
      :disabled="nextDisabled"
      @click="clickBtn(nextRoute)"
    >
      <v-icon large>fa-arrow-alt-circle-right</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import router from '../../router';

export default {
  name: 'SetNavigation',
  computed:{
    ...mapState('setNavigation', ['seqNumber', 'totalNumber', 'title', 'preRoute', 'nextRoute']),
    preDisabled() {
      return this.seqNumber <= 1;
    },
    nextDisabled() {
      return this.seqNumber >= this.totalNumber;
    }
  },
  methods: {
    clickBtn(route) {
      router.push(route);
    }
  }
};
</script>

<style scoped>
#preRecord.v-btn--disabled .v-icon,
#nextRecord.v-btn--disabled .v-icon {
  background-color: rgba(255, 255, 255, 0.80) !important;
  color: white !important;
  border-radius: 50%;
}

.nav-title {
  font-size: 1.065rem;
}

</style>
