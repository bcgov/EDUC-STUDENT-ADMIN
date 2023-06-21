<template>
  <v-hover v-slot="{ hover }">
    <v-btn
      :id="id"
      :title="title||text"
      :class="[(hover && !disabled) ? secondary ? this.class + ' button-hover white--text': this.class + ' button-hover': this.class + '']"
      :color="disabled ? '' : '#003366'"
      :variant="secondary ? 'outlined' : 'elevated'"
      :small="short"
      :disabled="disabled"
      :dark="!disabled"
      :to="to"
      :width="width"
      :loading="loading"
      v-bind="bind"
      @click="clickAction"
    >
      <v-icon
        v-if="icon"
        :color="secondary ? '#003366': 'white'"
        class="ml-n1 mr-1"
        :nudge-down="4"
        :large="largeIcon"
        right
        dark
      >
        {{ icon }}
      </v-icon>
      <span
        :style="getButtonTextStyle()"
        class="ml-1"
      >{{ text }}</span>
    </v-btn>
  </v-hover>
</template>

<script>
export default {
  name: 'PrimaryButton',
  inheritAttrs: false,
  props: {
    class:{
      type: String,
      default: null
    },
    id: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: null
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
      default: null
    },
    width: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    bind: {
      type: Object,
      default: null
    },
    clickAction: {
      type: Function,
      default: null
    },
    largeIcon: {
      type: Boolean,
      default: false
    },
    title:{
      type: String,
      default: null
    }
  },
  methods: {
    getButtonTextStyle(){
      if(this.secondary){
        return 'color: #003366';
      }else if(!this.disabled){
        return 'color: white';
      }
      return '';
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
.v-theme--myCustomLightTheme.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: #003366 !important;
  opacity: 0.298039215686275;
  color: white !important;
}

.v-theme--myCustomLightTheme.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) .v-icon {
  color: white !important;
}
</style>
