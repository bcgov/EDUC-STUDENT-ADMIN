<template>
  <v-row justify="center">
    <v-dialog
      v-model="mapSchoolCodeDialog"
      max-width="60%"
    >
      <template #activator="{ props }">
        <TertiaryButton
          id="add-school-code"
          icon="mdi-plus-circle"
          short
          class-modifier="mt-4 pr-0 pl-1 ml-2"
          min-width="20px"
          :bind="props"
        />
      </template>
      <v-card fluid>
        <v-card-title>
          <v-row>
            <v-col class="mt-2">
              <span style="font-size: x-large;font-weight: bold">Map School Code</span>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-btn
                id="mapSchoolCodeDialogCloseBtn"
                text
                variant="flat"
                icon="mdi-close"
                @click="mapSchoolCodeDialog = false"
              >
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-spacer/>
        <v-card-text>
          <v-form
            ref="addSchoolCodeForm"
            v-model="isValidForm"
          >
            <v-row
              dense
              no-gutters
              class="py-3"
            >
              <v-col
                cols="6"
                class="pt-2"
              >
                <v-row
                  dense
                  no-gutters
                >
                  <strong>Federal School Code</strong>
                </v-row>
                <v-row
                  dense
                  no-gutters
                >
                  <v-col cols="10">
                    <v-text-field
                      id="federalCodeTxtField"
                      v-model="federalCode"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                      tabindex="1"
                      disabled
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                cols="6"
                class="pt-2"
              >
                <v-row
                  dense
                  no-gutters
                >
                  <strong>Mincode</strong>
                </v-row>
                <v-row
                  dense
                  no-gutters
                >
                  <v-col cols="10">
                    <v-autocomplete
                      id="schoolNameTxtField"
                      v-model="mincode"
                      :items="schools"
                      item-title="text"
                      item-value="value"
                      :rules="requiredRules"
                      tabindex="2"
                      clearable
                      variant="outlined"
                      density="compact"
                    >
                    </v-autocomplete>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="mr-4 pb-6">
          <v-spacer/>
          <PrimaryButton
            id="mapSchoolCodeDialogCancelBtn"
            text="Cancel"
            secondary
            @click-action="mapSchoolCodeDialog = false"
          />
          <PrimaryButton
            id="mapSchoolCodeDialogAddBtn"
            text="Add"
            :disabled="!isValidForm"
            :loading="processing"
            @click-action="createFedProvSchoolCode"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {mapState} from 'pinia';
import TertiaryButton from '../util/TertiaryButton.vue';
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {appStore} from '@/store/modules/app';
import {nominalRollStore} from '@/store/modules/nominalRoll';
import _ from 'lodash';

export default {
  name: 'MapSchoolCodeModal',
  components: {
    TertiaryButton,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    fedCode: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      mapSchoolCodeDialog: false,
      isValidForm: false,
      mincode: null,
      federalCode: null,
      requiredRules: [v => !!v?.trim() || 'Required'],
      processing: false,
    };
  },
  computed: {
    ...mapState(appStore, ['schoolApiMincodeSchoolNames']),
    ...mapState(nominalRollStore, ['fedProvSchoolCodes']),
    schools() {
      return _.sortBy(Array.from(this.schoolApiMincodeSchoolNames.entries()).map(school => ({
        text: `${school[0]} - ${school[1]}`,
        value: school[0]
      })), ['value']);
    },
  },
  beforeMount() {
    this.federalCode = this.fedCode;
  },
  methods: {
    createFedProvSchoolCode() {
      if (this.$refs.addSchoolCodeForm.validate()) {
        if (this.fedProvSchoolCodes.find(obj => obj.federalCode === this.federalCode)) {
          this.setFailureAlert('Federal School Code already exists');
          return;
        }

        this.processing = true;

        const payload = {
          key: 'NOM_SCHL',
          federalCode: this.federalCode,
          provincialCode: this.mincode
        };

        return ApiService.apiAxios.post(`${Routes.nominalRoll.ROOT_ENDPOINT}/fedProvSchoolCode`, payload)
          .then((response) => {
            this.mapSchoolCodeDialog = false;
            this.setSuccessAlert('Success! Your request to map school code is completed.');
            this.fedProvSchoolCodes.push(payload);
            this.$emit('addFedProvCode', response.data);
          })
          .catch(error => {
            console.log(error);
            this.setFailureAlert('An error occurred while mapping the school code. Please try again later.');
          })
          .finally(() => {
            this.processing = false;
          });
      }
    },
  }
};
</script>

<style scoped>
.v-select-list /deep/ .v-list-item__mask {
    color: rgb(0, 0, 0);
    font-weight: bold;
    background: rgba(238, 238, 238, 0.02);
}
</style>
