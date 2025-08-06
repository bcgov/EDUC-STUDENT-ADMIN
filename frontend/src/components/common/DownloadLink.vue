<template>
  <a
    :class="{ 'disabled-link': loading || disabled }"  
    :aria-disabled="disabled || loading"
    :tabindex="disabled || loading ? -1 : 0"            
    @click="handleClick"       
  >
    <template v-if="loading">
      <v-progress-circular
        size="20"
        indeterminate
        color="primary"
        class="mr-1"
      />
    </template>
    <template v-else>
      <v-icon
        :icon="icon"
        class="mr-1"
      />
    </template>
    {{ label }}
  </a>
</template>

<script>
export default {
  name: 'DownloadLink',
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'mdi-download'
    },
    downloadAction: {
      type: Function,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    async handleClick() {
      if (this.loading) return;
      this.loading = true;
      try {
        await this.downloadAction();
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.disabled-link {
  pointer-events: none;
  color: grey;
}
</style>
