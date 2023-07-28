<template>
  <v-dialog
    v-model="dialog"
    :content-class="contentClass"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <slot
        name="title"
        v-if="showTitleBar"
        :cancel="cancel"
      >
        <v-toolbar
          :dark="options.dark"
          :color="options.color"
          density="compact"
          flat
        >
          <span class="pb-2 pl-3" style="font-size: 1.15em" :class="{'white--text': options.dark, 'align-self-end': options.closeIcon, 'font-weight-bold': options.titleBold, 'dialog-subtitle': options.subtitle}">
            {{ title }}
          </span>
          <v-spacer />
          <v-btn
            v-if="options.closeIcon"
            id="closeBtn"
            text
            icon
            @click-action="cancel"
          >
            <v-icon color="#38598A">
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>
      </slot>
      <v-card-text :class="[options.messagePadding, { 'black--text': !options.dark }]">
        {{ message }}
        <slot name="message" />
        <v-divider
          v-if="options.divider"
          class="mt-1"
        />              
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <PrimaryButton
          id="rejectBtn"
          secondary
          :text="options.rejectText || 'Cancel'"
          @click-action="cancel"
        />
        <PrimaryButton
          id="resolveBtn"
          :text="options.resolveText || 'Yes'"
          :disabled="options.resolveDisabled"
          @click-action="agree"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from './PrimaryButton.vue';
export default {
  name: 'ConfirmationDialog',
  components: {PrimaryButton},
  props: {
    contentClass: {
      type: String,
      default: '',
    },
    showTitleBar:{
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    message: null,
    title: null,
    options: {
      color: 'primary',
      width: 290,
      zIndex: 20000,
      dark: true,
      dense: true,
      closeIcon: false,
      messagePadding: 'pa-4',
      titleBold: false,
      subtitle: false,
      divider: false,
      resolveDisabled: false,
    }
  }),
  methods: {
    open(title, message, options) {
      this.dialog = true;
      this.title = title;
      this.message = message;
      this.options = Object.assign(this.options, options);
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    agree() {
      this.resolve(true);
      this.dialog = false;
    },
    cancel() {
      this.resolve(false);
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
  .dialog-subtitle {
    font-size: 1rem;
  }

  .white--text{
      color: white;
  }
</style>
