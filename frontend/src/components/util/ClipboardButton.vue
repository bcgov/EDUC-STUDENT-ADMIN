<template>
  <v-tooltip v-model="showTooltip" right>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          :id="id"
          color="#38598A"
          :disabled="disabled"
          :dark="!disabled"
          icon
          v-bind="attrs"
          @click.native.stop="copy(copyText)"
          :title="`copy ${copyText} to clipboard`"
      >
        <v-icon v-if="icon" :class="iconStyle" small>
          {{ icon }}
        </v-icon>
      </v-btn>
    </template>
    <span>{{ 'copied ' + copyText}}</span>
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
