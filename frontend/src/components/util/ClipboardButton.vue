<template>
  <v-tooltip
    v-model="showTooltip"
    location="right"
    :open-on-hover="false"
  >
    <template #activator="{ props }">
      <v-btn
        :id="id"
        color="#38598A"
        :disabled="disabled"
        :dark="!disabled"
        icon
        size="30"
        class="ml-1"
        v-bind="props"
        :title="`Copy ${copyText} to clipboard`"
        @click.prevent.stop="copy(copyText)"
      >
        <v-icon
          v-if="icon"
          color="white"
          :class="iconStyle ? iconStyle : undefined"
          size="18"
        >
          {{ icon }}
        </v-icon>
      </v-btn>
    </template>
    <span>{{ 'Copied ' + copyText }}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'ClipboardButton',
  props: {
    id: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
    },
    iconStyle: {
      type: String
    },
    copyText: {
      type: String
    },
  },
  data() {
    return {
      showTooltip: false
    };
  },
  methods: {
    copy(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showTooltip = true;
        setTimeout(() => this.showTooltip = false, 2000);
      });
    }
  }
};
</script>
