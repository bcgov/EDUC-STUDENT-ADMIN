<template>
  <v-hover v-slot="{ hover }">
    <v-btn
      :id="id"
      :class="classModifier"
      color="#38598A"
      :small="short"
      :disabled="disabled"
      :dark="!disabled"
      :to="to"
      :width="width"
      @click="$emit('clickAction')"
      variant="text"
      :min-width="minWidth"
      v-bind="bind"
    >
      <v-icon
        v-if="icon"
        :class="[iconStyle, 'mr-1']"
        left
        :icon="icon"
      >
      </v-icon>
      <strong>{{ text }}</strong>
    </v-btn>
  </v-hover>
</template>

<script>
export default {
  emits: ['clickAction'],
  name: 'TertiaryButton',
  props: {
    id: {
      type: String
    },
    text: {
      type: String
    },
    classModifier: {
      type: String
    },
    short: {
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
    icon: {
      type: String,
    },
    iconStyle: {
      type: String
    },
    minWidth: {
      type: String
    },
    bind: {
      type: Object
    },
    on: {
      type: Object
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-btn {
    text-transform: none;
}

.button-hover {
    color: #003366 !important;
}

.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
    background-color: #38598A !important;
    opacity: 0.3;
    color: white !important;
}
</style>
