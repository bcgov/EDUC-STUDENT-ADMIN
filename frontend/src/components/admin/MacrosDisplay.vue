<template>
  <v-container fluid class="px-0 mb-4">
    <v-toolbar flat dense>
      <v-toolbar-title><strong>{{title}}</strong></v-toolbar-title>
      <v-spacer></v-spacer>
      <PrimaryButton id="add-macro" text="Add Macro" short></PrimaryButton>
    </v-toolbar>
    <v-divider></v-divider>
    <v-progress-linear
      indeterminate
      color="blue"
      :active="loading"
    ></v-progress-linear>
    <v-row>
      <v-col>
        <v-card-text>
          <v-treeview
            :active.sync="active"
            :items="items"
            :load-children="loadMacros"
            open-on-click
            transition
            activatable
            return-object
          >
          </v-treeview>
        </v-card-text>
      </v-col>

      <v-divider vertical></v-divider>

      <v-col
        cols="8"
        class="macro-col"
      >
        <v-scroll-y-transition mode="out-in">
          <v-simple-table class="macro-list">
            <template v-slot:default>
              <tbody>
                <tr v-for="macro in macros" :key="macro.macroCode">
                  <td class="py-3">{{ macro.macroCode }}</td>
                  <td class="py-3">{{ macro.macroText }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-scroll-y-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import ApiService from '../../common/apiService';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'MacrosDisplay',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  data() {
    return {
      active: [],
      gmpMacroTypes:[],
      umpMacroTypes:[],
      penRegMacroTypes:[
        {
          id: 'penReg-merge',
          name: 'Merge',
          url: Routes.penServices.MACRO_URL,
          key: 'mergeMacros', 
          macros: []
        },
        {
          id: 'penReg-postInfo',
          name: 'Post Info',
          url: Routes.penRequestBatch.STUDENT_INFO_MACROS_URL,
          macros: []
        }
      ],
      loading: false,
    };
  },
  computed: {
    items () {
      return [
        {
          id: 'gmp',
          name: 'Get My PEN',
          url: Routes.penRequest.MACRO_URL,
          keys: {
            returnMacros: 'Request Info',
            rejectMacros: 'Reject',
            completeMacros: 'Provide PEN'
          },
          children: this.gmpMacroTypes,
        },
        {
          id: 'ump',
          name: 'Update My PEN',
          url: Routes.studentRequest.MACRO_URL,
          keys: {
            returnMacros: 'Request Info',
            rejectMacros: 'Reject',
            completeMacros: 'Send Updates'
          },
          children: this.umpMacroTypes,
        },
        {
          id: 'penReg',
          name: 'PEN Registry',
          children: this.penRegMacroTypes,
        },
      ];
    },
    selected() {
      return this.active.length > 0 ? this.active[0] : undefined;
    },
    macros() {
      return this.selected?.macros || [];
    },
    title() {
      let item;
      if(this.selected) {
        item = this.items.find(item => this.selected.id.startsWith(item.id)); 
      }
      return item ? `${item.name} ${this.selected.name}` : 'Macro Management';
    }
  },
  watch: {
    selected(v) {
      if(v && v.macros.length === 0) {
        this.loadMacros(v);
      }
    },
  },
  methods: {
    async loadMacros(item) {
      this.loading = true;
      return ApiService.apiAxios
        .get(item.url)
        .then(response => {
          if (response.data) {
            if(item.children) {  //fetch gump macros
              const children = Object.entries(item.keys).map(([key, value]) => ({id: `${item.id}-${key}`, name: value, macros: response.data[key]}));
              item.children.push(...children);
            } else {  //fetch penReg macros
              item.macros = item.key ? response.data[item.key] : response.data;
            }
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the macro data. Please try again later.');
        })
        .finally(() => (this.loading = false));      
    },
  }
};
</script>

<style scoped>  
  .macro-list {
    max-height: 100vh;
    overflow-y: auto;
  }

  .macro-list /deep/ table td { 
    border-bottom: none !important;
  }
</style>
