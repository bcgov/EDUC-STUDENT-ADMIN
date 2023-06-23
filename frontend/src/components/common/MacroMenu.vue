<template>
  <v-menu id="chooseMessageMenu" max-height="30%" offset-y :max-width="menuMaxWidth">
    <template #activator="{ on, attrs }">
      <div :class="[margin, padding]">
        <PrimaryButton
          :id="id"
          :text="text"
          icon="fa-angle-down"
          secondary
          :bind="attrs"
          :on="on"
          icon-left
          width="13em"
          :disabled="disabled"
        >
        </PrimaryButton>
      </div>
    </template>
    <v-list class="py-0 overflow-y-auto">
      <v-list-item
        v-for="(item, index) in macros"
        :key="index"
        density="compact"
        class="macroListItem"
        @click="clickMacroItem(item.macroText)"
      >
        <v-list-item-title>
          <v-row class="macroRow">
            <v-col :cols="small ? '2' : '1'" class="py-2 pr-0"><strong>{{ item.macroCode }}</strong></v-col>
            <v-col :cols="small ? '10' : '11'" class="text-wrap py-2 pl-0">{{ item.macroText }}</v-col>
          </v-row>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'macroMenu',
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {
    macros: {
      type: Array,
      required: true
    },
    text: {
      type: String,
      default: 'Choose Message'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: 'chooseMessageBtn'
    },
    padding: {
      type: String,
      default: 'pt-0'
    },
    margin: {
      type: String,
      default: 'ml-3'
    },
    menuMaxWidth: {
      type: String,
      default: '50%'
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    clickMacroItem(macroText) {
      this.$emit('select', macroText);
    }
  }
};
</script>

<style scoped>
.macroListItem {
  min-height: 0;
}

.macroListItem:hover {
  cursor: pointer;
  background-color: #F2F2F2;
}
</style>
