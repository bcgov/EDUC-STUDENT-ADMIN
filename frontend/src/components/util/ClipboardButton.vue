<template>
  <v-tooltip
    v-model="showTooltip"
    right
    :open-on-hover="false"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        :id="id"
        color="#38598A"
        :disabled="disabled"
        :dark="!disabled"
        icon
        size="x-small"
        class="ml-1"
        v-bind="attrs"
        @click.prevent.stop="copy(copyText)"
        :title="`Copy ${copyText} to clipboard`"
      >
        <v-icon
          v-if="icon"
          color="white"
          :class="iconStyle ? iconStyle : undefined"
          size="large"
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
