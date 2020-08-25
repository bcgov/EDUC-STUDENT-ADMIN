<template>
  <v-hover v-slot:default="{ hover }">
    <v-btn :id="id"
           :class="[hover ? secondary ? 'text-decoration-underline button-hover white--text':'text-decoration-underline button-hover':'']"
           color="#003366"
           :outlined="secondary"
           :small="short"
           :disabled="disabled"
           :dark="!disabled"
           :to="to"
           :width="width"
           :loading="loading"
    >{{ text }}</v-btn>
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
</style>
