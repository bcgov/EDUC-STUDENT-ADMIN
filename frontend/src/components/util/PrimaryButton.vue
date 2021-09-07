<template>
  <v-hover v-slot:default="{ hover }">
    <v-btn :id="id"
           :title="title||text"
           :class="[(hover && !disabled) ? secondary ? 'button-hover white--text':'button-hover':'']"
           color="#003366"
           :outlined="secondary"
           :small="short"
           :disabled="disabled"
           :dark="!disabled"
           :to="to"
           :width="width"
           :loading="loading"
           v-bind="bind"
           v-on="on"
    >
      <span :class="hover ? 'text-decoration-underline': ''">{{ text }}</span>
      <v-icon :class="largeIcon ? '' : 'ml-1 pr-2 pt-1'" v-if="icon" :nudge-down="4" :large="largeIcon" right dark>{{ icon }}</v-icon>
      <slot></slot>
    </v-btn>
  </v-hover>
</template>

<script>
export default {
  name: 'primaryButton',
  props: {
    id: {
      type: String
    },
    text: {
      type: String
    },
    short: {
      type: Boolean,
      default: false
    },
    secondary: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    to: {
      type: String,
    },
    width: {
      type: String,
    },
    loading: {
      type: Boolean
    },
    icon: {
      type: String
    },
    bind: {
      type: Object
    },
    on: {
      type: Object
    },
    largeIcon: {
      type: Boolean,
      default: false
    },
    title:{
      type: String,
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-btn {
  text-transform: none;
}
.button-hover {
  background-color: #38598A !important;
}
.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: #003366 !important;
  opacity: 0.298039215686275;
  color: white !important;
}

.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) .v-icon {
  color: white !important;
}
</style>
