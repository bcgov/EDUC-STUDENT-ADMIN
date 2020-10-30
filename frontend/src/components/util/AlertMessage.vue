<template>
  <v-alert
          v-model="displayAlert"
          dense
          text
          :dismissible="!timeoutMs"
          outlined
          transition="scale-transition"
          :class="`${alertType} flex-grow-1 mx-3`"
  >
    {{ alertMessage }}
  </v-alert>
</template>

<script>
export default {
  name: 'AlertMessage',
  data() {
    return {
      intervalID: null,
    };
  },
  props: {
    alertMessage: {
      type: String,
      default: ''
    },
    alertType: {
      type: String,
      default: ''
    },
    timeoutMs: {
      type: Number
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    displayAlert: {
      get(){
        return this.value;
      },
      set(displayAlert){
        this.$emit('input', displayAlert);
      }
    }
  },
  watch: {
    displayAlert() {
      if(this.displayAlert && this.timeoutMs) {
        this.intervalID = window.setInterval(() => {
          this.displayAlert = false;
          window.clearInterval(this.intervalID);
        }, this.timeoutMs);
      }
    }
  }
};
</script>
