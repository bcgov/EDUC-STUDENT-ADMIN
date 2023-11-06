<template>
  <v-container
    fluid
    class="px-0 mb-4"
  >
    <v-row>
      <v-col>
        <v-toolbar
          flat
          density="compact"
        >
          <v-toolbar-title><strong>{{ title }}</strong></v-toolbar-title>
          <v-spacer />
          <PrimaryButton
            id="add-macro"
            text="Add Macro"
            short
            :disabled="!selected || loading || processing"
            @click-action="clickAddBtn"
          />
        </v-toolbar>
        <v-progress-linear
          indeterminate
          color="blue"
          :active="loading || processing"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list lines="one">
          <v-list-group
            v-for="item in items"
            :key="item.id"
            :title="item.name"
          >
            <v-list-item
              v-for="child in item.children"
              :key="child.name"
              :title="child.name"
              :style="child.isSelected ? 'background-color: #E1F5FE' : ''"
              @click="selectMacroType(child)"
            />
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :title="item.name"
              />
            </template>
          </v-list-group>
        </v-list>
      </v-col>

      <v-divider vertical />

      <v-col
        cols="10"
        class="macro-col"
      >
        <v-scroll-y-transition mode="out-in">
          <v-data-table class="macro-list">
            <template #default>
              <tbody>
                <tr
                  v-for="macro in macros"
                  :key="macro.macroCode"
                >
                  <td class="py-3">
                    {{ macro.macroCode }}
                  </td>
                  <td
                    v-if="macro.editable"
                    class="py-3"
                  >
                    <MacroEditor
                      :macro="macro"
                      short
                      :loading="macro.sagaInProgress"
                      :disabled="loading || processing"
                      @cancel="clickCancel"
                      @save="updateMacro"
                    />
                  </td>
                  <td
                    v-else
                    class="py-3"
                    @click="clickMacroText(macro)"
                  >
                    {{ macro.macroText }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-data-table>
        </v-scroll-y-transition>
      </v-col>
    </v-row>
    <v-dialog
      id="macroDialog"
      v-model="macroDialogOpen"
      max-width="50%"
    >
      <v-card>
        <v-toolbar
          density="compact"
          color="#FFF"
          flat
        >
          <v-spacer />
          <v-btn
            id="closeMacroDialog"
            text
            icon
            @click.stop="macroDialogOpen=false"
          >
            <v-icon color="#38598A">
              mdi-close
            </v-icon>
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
import {mapState} from 'pinia';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {deepCloneObject} from '@/utils/common';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import MacroEditor from './MacroEditor.vue';
import _ from 'lodash';
import {notificationsStore} from '@/store/modules/notifications';
import {edxStore} from '@/store/modules/edx';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';
import {studentStore} from '@/store/modules/student';
import {umpRequestStore} from '@/store/modules/umpRequest';
import {gmpRequestStore} from '@/store/modules/gmpRequest';

export default {
  name: 'MacrosDisplay',
  components: {
    PrimaryButton,
    ConfirmationDialog,
    MacroEditor
  },
  mixins: [alertMixin],
  data() {
    return {
      gmpMacros: [],
      umpMacros: [],
      penRegMacros: [],
      edxMacros: [],
      loading: false,
      processing: false,
      macroDialogOpen: false,
      newMacro: {},
      macros: [],
      selected: null,
      currentActive: [],
      currentMacro: null,
      originalMacro: null,
      itemInProcess: null,
    };
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
    items() {
      return [
        {
          name: 'Get My PEN',
          children: [
            {
              id: 'gmp',
              dbVal: 'MOREINFO',
              name: 'Request Info',
              storeMutation: 'gmpRequestInfo'
            },
            {
              id: 'gmp',
              dbVal: 'REJECT',
              name: 'Reject',
              storeMutation: 'gmpReject'
            },
            {
              id: 'gmp',
              dbVal: 'COMPLETE',
              name: 'Provide PEN',
              storeMutation: 'gmpComplete'
            }
          ],
          macros: this.gmpMacros
        },
        {
          name: 'Update My PEN',
          children: [
            {
              id: 'ump',
              dbVal: 'MOREINFO',
              name: 'Request Info',
              storeMutation: 'umpRequestInfo'
            },
            {
              id: 'ump',
              dbVal: 'REJECT',
              name: 'Reject',
              storeMutation: 'umpReject'
            },
            {
              id: 'ump',
              dbVal: 'COMPLETE',
              name: 'Send Updates',
              storeMutation: 'umpComplete'
            }
          ],
          macros: this.umpMacros
        },
        {
          name: 'PEN Registry',
          children: [
            {
              id: 'penReg',
              dbVal: 'MERGE',
              name: 'Merge',
              storeMutation: 'merge'
            },
            {
              id: 'penReg',
              dbVal: 'INFOREQ',
              name: 'Post Info',
              storeMutation: 'batch'
            }
          ],
          macros: this.penRegMacros
        },
        {
          name: 'EDX',
          children: [
            {
              id: 'edx',
              dbVal: 'MESSAGE',
              name: 'Message',
              storeMutation: 'edx'
            }
          ],
          macros: this.edxMacros
        },
      ];
    },
    title() {
      let item;
      if (this.selected) {
        item = this.items.find(item => this.selected.id.startsWith(item.id));
      }
      return item ? `${item.name} ${this.selected.name}` : 'Macro Management';
    },
    isValidForm() {
      return !!this.currentMacro.macroText;
    }
  },
  watch: {
    notification(val) {
      if (val) {
        const notificationData = val;
        if (this.itemInProcess && notificationData && this.itemInProcess.sagaId === notificationData.sagaId && notificationData.sagaStatus === 'COMPLETED') {
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
    saveMacrosInStore(store, macros){
      if(store === 'edx'){
        edxStore().setMessageMacros(macros);
      }else if(store === 'batch'){
        penRequestBatchStore().setStudentInfoMacros(macros);
      }else if(store === 'merge'){
        studentStore().setMergeMacros(macros);
      }else if(store === 'umpRequestInfo'){
        umpRequestStore().setReturnMacros(macros);
      }else if(store === 'umpReject'){
        umpRequestStore().setRejectMacros(macros);
      }else if(store === 'umpComplete'){
        umpRequestStore().setCompleteMacros(macros);
      }else if(store === 'gmpRequestInfo'){
        gmpRequestStore().setReturnMacros(macros);
      }else if(store === 'gmpReject'){
        gmpRequestStore().setRejectMacros(macros);
      }else if(store === 'gmpComplete'){
        gmpRequestStore().setCompleteMacros(macros);
      }
    },
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
            const macros = _.groupBy(response.data, 'macroTypeCode');
            const selectedMacros = macros[item.dbVal];
            this.saveMacrosInStore(selectedMacros.storeMutation, deepCloneObject(selectedMacros));
            selectedMacros.forEach(macro => macro.editable = false);
            this.macros = selectedMacros;
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
            this.saveMacrosInStore(item.storeMutation, deepCloneObject(macros[item.dbVal]));

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
      if (this.hasAnyEdits()) {
        Object.assign(this.currentMacro, this.originalMacro);
      }
      this.resetCurrentMacro();
    },
    setCurrentMacro(macro) {
      this.resetCurrentMacro();

      this.currentActive = macro;
      this.currentMacro = macro;
      if (!macro.editable) {
        macro.editable = true;
        this.originalMacro = deepCloneObject(macro);
      }
    },
    resetCurrentMacro() {
      if (this.currentMacro) {
        this.currentMacro.editable = false;
        this.currentMacro = null;
      }
    },
    openConfirmation(cancel, save) {
      if (this.hasAnyEdits() && !this.loading) {
        this.$refs.confirmationDialog.open(null, null, {
          color: '#fff',
          width: 480,
          closeIcon: true,
          dark: false,
          resolveText: 'Save Changes',
          resolveDisabled: !this.isValidForm
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
    selectMacroType(item){
      this.loadMacros(item);
      this.deselectAll();
      item.isSelected = true;
      this.selected = item;
    },
    deselectAll(){
      this.items.forEach(item => {
        item.children.forEach(child => {
          child.isSelected = false;
        });
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
      return ApiService.apiAxios.post(`${Routes.MACRO_URL}/${macro.macroId}/updateMacro`, macro)
        .then((response) => {
          this.resetCurrentMacro();
          this.setSuccessAlert('Your request to update macro data is accepted.');
          this.itemInProcess = {
            sagaId: response.data,
            item: macro
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

      if (this.macros.length > 0 && this.macros[0].macroTypeCode) {
        macro.macroTypeCode = this.macros[0].macroTypeCode;
        macro.businessUseTypeCode = this.macros[0].businessUseTypeCode;
      }

      return ApiService.apiAxios.post(`${Routes.MACRO_URL}/createMacro`, macro)
        .then((response) => {
          this.macroDialogOpen = false;
          this.setSuccessAlert('Your request to add new macro is accepted.');
          this.itemInProcess = {
            sagaId: response.data,
            item: macro
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

:deep(.v-list-item-title){
  font-size: 0.85em;
}

:deep(.v-list-item__content){
  cursor: pointer;
}

:deep(.v-list-item:hover){
    background-color:  #E1F5FE !important;
}
:deep(tr){
    font-size: 0.85em;
}

:deep(.v-data-table-footer){
    display: none;
}
</style>
