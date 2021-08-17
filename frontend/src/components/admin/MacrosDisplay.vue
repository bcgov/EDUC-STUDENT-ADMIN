<template>
  <v-container fluid class="px-0 mb-4">
    <v-toolbar flat dense>
      <v-toolbar-title><strong>{{title}}</strong></v-toolbar-title>
      <v-spacer/>
      <PrimaryButton id="add-macro" text="Add Macro" short :disabled="!this.selected || loading" @click.native="clickAddBtn"></PrimaryButton>
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
            @click.native="clickTreeView"
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
                  <td class="py-3" v-if="macro.editable">
                    <MacroEditor
                      :macro="macro"
                      short
                      :loading="loading"
                      @cancel="clickCancel"
                      @save="updateMacro"
                    />
                  </td>
                  <td class="py-3" v-else @click="clickMacroText(macro)">
                    {{ macro.macroText }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-scroll-y-transition>
      </v-col>
    </v-row>
    <v-dialog
      id="macroDialog"
      v-model="macroDialogOpen"
      max-width="50%"
      persistent
    >
      <v-card>
        <v-toolbar dense flat>
          <v-spacer/>
          <v-btn id="closeMacroDialog" text icon @click.stop="macroDialogOpen=false">
            <v-icon color="#38598A">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <MacroEditor
          class="pb-4 px-4"
          :macro="newMacro"
          rows="10"
          :loading="loading"
          @cancel="macroDialogOpen=false"
          @save="createMacro"
        />
      </v-card>
    </v-dialog>
    <ConfirmationDialog ref="confirmationDialog">
      <template v-slot:message>
        <v-col class="mt-n6">
          <v-row class="mt-n2 mb-0">
            You have unsaved changes. Do you wish to proceed and cancel changes?
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>

<script>
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import ApiService from '../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {deepCloneObject} from '@/utils/common';
import ConfirmationDialog from '../util/ConfirmationDialog';
import MacroEditor from './MacroEditor';

export default {
  name: 'MacrosDisplay',
  components: {
    PrimaryButton,
    ConfirmationDialog,
    MacroEditor,
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
          macros: [],
          storeMutation: 'student/setMergeMacros'
        },
        {
          id: 'penReg-postInfo',
          name: 'Post Info',
          url: Routes.penRequestBatch.STUDENT_INFO_MACROS_URL,
          macros: [],
          storeMutation: 'penRequestBatch/setStudentInfoMacros'
        }
      ],
      loading: false,
      macroDialogOpen: false,
      newMacro: {},
      currentActive: [],
      currentMacro: null,
      originalMacro: null,
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
            returnMacros: {
              name: 'Request Info',
              storeMutation: 'penRequest/setReturnMacros'
            },
            rejectMacros: {
              name: 'Reject',
              storeMutation: 'penRequest/setRejectMacros'
            },
            completeMacros: {
              name: 'Provide PEN',
              storeMutation: 'penRequest/setCompleteMacros'
            },
          },
          children: this.gmpMacroTypes,
        },
        {
          id: 'ump',
          name: 'Update My PEN',
          url: Routes.studentRequest.MACRO_URL,
          keys: {
            returnMacros: {
              name: 'Request Info',
              storeMutation: 'studentRequest/setReturnMacros'
            },
            rejectMacros: {
              name: 'Reject',
              storeMutation: 'studentRequest/setRejectMacros'
            },
            completeMacros: {
              name: 'Send Updates',
              storeMutation: 'studentRequest/setCompleteMacros'
            },
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
      return this.active.length > 0 ? this.activeItem : undefined;
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
    },
    activeItem() {
      return this.active[0];
    },
    isValidForm() {
      return !!this.currentMacro.macroText;
    }
  },
  watch: {
    selected(v) {
      if(v && v.macros.length === 0) {  //fetch penReg macros when intiallly selecting penReg macros
        this.loadMacros(v);
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    this.openConfirmation(() => next(), () => next(false));
  },
  methods: {
    async loadMacros(item) {
      this.loading = true;
      return ApiService.apiAxios
        .get(item.url)
        .then(response => {
          if (response.data) {
            if(item.children) {  //fetch gump macros
              const children = []; 
              Object.entries(item.keys).forEach(([key, value]) => {
                this.$store.commit(value.storeMutation, deepCloneObject(response.data[key]));

                response.data[key].forEach(macro => macro.editable = false);
                children.push({
                  id: `${item.id}-${key}`, 
                  name: value.name, 
                  macros: _.sortBy(response.data[key], ['macroCode']), 
                  url: item.url, 
                  key, 
                  storeMutation: value.storeMutation
                });
              });
              item.children.push(...children);
            } else {  //fetch penReg macros or one type of gump macros
              const macros = item.key ? response.data[item.key] : response.data;
              this.$store.commit(item.storeMutation, deepCloneObject(macros));

              macros.forEach(macro => macro.editable = false);
              item.macros = _.sortBy(macros, ['macroCode']);
            }
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the macro data. Please try again later.');
        })
        .finally(() => (this.loading = false));      
    },
    hasAnyEdits() {
      return this.currentMacro && this.originalMacro && JSON.stringify(this.currentMacro) !== JSON.stringify(this.originalMacro);
    },
    revertChanges() {
      if(this.hasAnyEdits()) {
        Object.assign(this.currentMacro, this.originalMacro);
      }
      this.resetCurrentMacro();
    },
    setCurrentMacro(macro) {
      this.resetCurrentMacro();

      this.currentActive = [...this.active];
      this.currentMacro = macro;
      if(!macro.editable) {
        macro.editable = true;
        this.originalMacro = deepCloneObject(macro);
      }
    },
    resetCurrentMacro() {
      if(this.currentMacro) {
        this.currentMacro.editable = false;
        this.currentMacro = null;
      }
    },
    openConfirmation(cancel, save) {
      if(this.hasAnyEdits() && !this.loading) {
        this.$refs.confirmationDialog.open(null, null, {
          color: '#fff', width: 480, closeIcon: true, dark: false, resolveText: 'Save Changes', resolveDisabled: !this.isValidForm
        }).then((result) => {
          if (result) {
            this.updateMacro(this.currentMacro);
            save && save();
          } else {
            this.clickCancel();
            cancel && cancel();
          }
        });
      } else {
        cancel && cancel();
      }
    },
    clickTreeView() {
      const activeItems = [...this.active];
      this.active = [...this.currentActive];
      this.openConfirmation(() => {
        this.resetCurrentMacro();
        this.active = [...activeItems];
      });
    },
    clickMacroText(macro) {
      this.openConfirmation(() => this.setCurrentMacro(macro));
    },
    clickCancel() {
      this.revertChanges();
    },
    clickAddBtn() {
      this.openConfirmation(() => {
        this.resetCurrentMacro();
        this.macroDialogOpen = true;
        this.newMacro = {
          macroText: ''
        };
      });
    },
    updateMacro(macro) {
      this.loading = true;
      const activeItem = this.activeItem;
      return ApiService.apiAxios.put(`${this.activeItem.url}/${macro.macroId}`, macro)
        .then(() => {
          this.resetCurrentMacro();
          this.loadMacros(activeItem);
          this.setSuccessAlert('Macro data updated successfully.');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while updating the Macro data. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    createMacro(macro) {
      this.loading = true;

      if(this.activeItem.macros.length > 0 && this.activeItem.macros[0].macroTypeCode) {
        macro.macroTypeCode = this.activeItem.macros[0].macroTypeCode;
      }
      const activeItem = this.activeItem;

      return ApiService.apiAxios.post(this.activeItem.url, macro)
        .then((response) => {
          this.macroDialogOpen = false;
          this.loadMacros(activeItem);
          this.setSuccessAlert(`New Macro ${response.data.macroCode} added successfully.`);
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while adding the Macro data. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
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
