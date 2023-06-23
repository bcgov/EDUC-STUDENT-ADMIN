<template>
  <v-container fluid class="px-0 mb-4">
    <v-toolbar flat density="compact">
      <v-toolbar-title><strong>{{title}}</strong></v-toolbar-title>
      <v-spacer/>
      <PrimaryButton id="add-macro" text="Add Macro" short :disabled="!this.selected || loading || processing" :click-action="clickAddBtn"></PrimaryButton>
    </v-toolbar>
    <v-divider></v-divider>
    <v-progress-linear
      indeterminate
      color="blue"
      :active="loading || processing"
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
            :click-action="clickTreeView"
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
            <template v-slot>
              <tbody>
                <tr v-for="macro in macros" :key="macro.macroCode">
                  <td class="py-3">{{ macro.macroCode }}</td>
                  <td class="py-3" v-if="macro.editable">
                    <MacroEditor
                      :macro="macro"
                      short
                      :loading="macro.sagaInProgress"
                      :disabled="loading || processing"
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
    >
      <v-card>
        <v-toolbar density="compact" flat>
          <v-spacer/>
          <v-btn id="closeMacroDialog" text icon @click.stop="macroDialogOpen=false">
            <v-icon color="#38598A">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <MacroEditor
          class="pb-4 px-4"
          :macro="newMacro"
          rows="10"
          :loading="processing"
          @cancel="macroDialogOpen=false"
          @save="createMacro"
        />
      </v-card>
    </v-dialog>
    <ConfirmationDialog ref="confirmationDialog">
      <template #message>
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
import { mapState } from 'pinia';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {deepCloneObject} from '@/utils/common';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import MacroEditor from './MacroEditor.vue';
import {notificationsStore} from '@/store/modules/notifications';

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
      gmpMacros:[],
      umpMacros:[],
      penRegMacros:[],
      edxMacros:[],
      loading: false,
      processing: false,
      macroDialogOpen: false,
      newMacro: {},
      currentActive: [],
      currentMacro: null,
      originalMacro: null,
      itemInProcess: null,
    };
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
    items () {
      return [
        {
          id: 'gmp',
          name: 'Get My PEN',
          macroTypes: {
            MOREINFO: {
              name: 'Request Info',
              storeMutation: 'penRequest/setReturnMacros'
            },
            REJECT: {
              name: 'Reject',
              storeMutation: 'penRequest/setRejectMacros'
            },
            COMPLETE: {
              name: 'Provide PEN',
              storeMutation: 'penRequest/setCompleteMacros'
            },
          },
          children: this.gmpMacros,
        },
        {
          id: 'ump',
          name: 'Update My PEN',
          macroTypes: {
            MOREINFO: {
              name: 'Request Info',
              storeMutation: 'studentRequest/setReturnMacros'
            },
            REJECT: {
              name: 'Reject',
              storeMutation: 'studentRequest/setRejectMacros'
            },
            COMPLETE: {
              name: 'Send Updates',
              storeMutation: 'studentRequest/setCompleteMacros'
            },
          },
          children: this.umpMacros,
        },
        {
          id: 'penReg',
          name: 'PEN Registry',
          macroTypes: {
            MERGE: {
              name: 'Merge',
              storeMutation: 'student/setMergeMacros'
            },
            INFOREQ: {
              name: 'Post Info',
              storeMutation: 'penRequestBatch/setStudentInfoMacros'
            },
          },
          children: this.penRegMacros,
        },
        {
          id: 'edx',
          name: 'EDX',
          macroTypes: {
            MESSAGE: {
              name: 'Message',
              storeMutation: 'edx/setMessageMacros'
            }
          },
          children: this.edxMacros
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
    notification(val) {
      if (val) {
        const notificationData = val;
        if (this.itemInProcess && notificationData && this.itemInProcess.sagaId === notificationData.sagaId  && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'MACRO_UPDATE_SAGA') {
            this.setSuccessAlert('Success! Your request to update macro data is completed.');
          } else if (notificationData.sagaName === 'MACRO_CREATE_SAGA') {
            this.setSuccessAlert('Success! Your request to add new macro is completed.');
          }
          this.processing = false;
          this.loadMacrosByMacroType(this.itemInProcess.item);
        }
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    this.openConfirmation(() => next(), () => next(false));
  },
  methods: {
    async loadMacros(item) {
      this.loading = true;
      const params = {
        params: {
          businessUseTypeCode: item.id.toUpperCase()
        }
      };
      return ApiService.apiAxios
        .get(Routes.MACRO_URL, params)
        .then(response => {
          if (response.data) {
            const children = []; 
            const macros = _.groupBy(response.data, 'macroTypeCode');
            Object.entries(item.macroTypes).forEach(([macroTypeCode, value]) => {
              this.$store.commit(value.storeMutation, deepCloneObject(macros[macroTypeCode]));

              macros[macroTypeCode].forEach(macro => macro.editable = false);
              children.push({
                id: `${item.id}-${macroTypeCode}`, 
                name: value.name, 
                macros: _.sortBy(macros[macroTypeCode], ['macroCode']), 
                businessUseTypeCode: item.id.toUpperCase(),
                macroTypeCode, 
                storeMutation: value.storeMutation
              });
            });
            item.children.push(...children);
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the macro data. Please try again later.');
        })
        .finally(() => (this.loading = false));      
    },
    async loadMacrosByMacroType(item) {
      this.loading = true;
      const params = {
        params: {
          businessUseTypeCode: item.businessUseTypeCode,
          macroTypeCode: item.macroTypeCode
        }
      };
      return ApiService.apiAxios
        .get(Routes.MACRO_URL, params)
        .then(response => {
          if (response.data) {
            const macros = response.data;
            this.$store.commit(item.storeMutation, deepCloneObject(macros));

            macros.forEach(macro => macro.editable = false);
            item.macros = _.sortBy(macros, ['macroCode']);
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
      this.processing = true;
      macro.sagaInProgress = true;
      const activeItem = this.activeItem;
      return ApiService.apiAxios.post(`${Routes.MACRO_URL}/${macro.macroId}/updateMacro`, macro)
        .then((response) => {
          this.resetCurrentMacro();
          this.setSuccessAlert('Your request to update macro data is accepted.');
          this.itemInProcess = {
            sagaId: response.data,
            item: activeItem
          };
        })
        .catch(error => {
          console.log(error);
          this.processing = false;
          macro.sagaInProgress = false;
          if (error?.response?.status === 409 && error?.response?.data?.message) {
            this.setFailureAlert(error?.response?.data?.message);
          } else {
            this.setFailureAlert('An error occurred while updating the macro data. Please try again later.');
          }
        });
    },
    createMacro(macro) {
      this.processing = true;

      if(this.activeItem.macros.length > 0 && this.activeItem.macros[0].macroTypeCode) {
        macro.macroTypeCode = this.activeItem.macros[0].macroTypeCode;
        macro.businessUseTypeCode = this.activeItem.macros[0].businessUseTypeCode;
      }
      const activeItem = this.activeItem;

      return ApiService.apiAxios.post(`${Routes.MACRO_URL}/createMacro`, macro)
        .then((response) => {
          this.macroDialogOpen = false;
          this.setSuccessAlert('Your request to add new macro is accepted.');
          this.itemInProcess = {
            sagaId: response.data,
            item: activeItem
          };
        })
        .catch(error => {
          console.log(error);
          this.processing = false;
          if (error?.response?.status === 409 && error?.response?.data?.message) {
            this.setFailureAlert(error?.response?.data?.message);
          } else {
            this.setFailureAlert('An error occurred while adding the macro data. Please try again later.');
          }
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
