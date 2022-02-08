<template>
  <v-row justify="center">
    <v-dialog v-model="mapSchoolCodeDialog"
              max-width="60%"
              persistent
    >
      <template v-slot:activator="{ on, attrs }">
        <TertiaryButton id="add-school-code"
                        icon="$plus"
                        short
                        class="mx-0 mt-1 pl-2 pr-0"
                        min-width="20px"
                        :bind="attrs"
                        :on="on"
        ></TertiaryButton>
      </template>
      <v-card fluid>
        <v-card-title>
          <span> Map school code </span>
          <v-spacer/>
          <v-btn id="mapSchoolCodeDialogCloseBtn" text icon
                 @click="mapSchoolCodeDialog = false"
          >
            <v-icon large color="#38598A">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-spacer/>
        <v-card-text>
          <v-form ref="addSchoolCodeForm" v-model="isValidForm">
            <v-row dense no-gutters class="py-3">
              <v-col cols="6" class="pt-2">
                <v-row dense no-gutters>
                  <strong>Federal School Code</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="10">
                    <v-text-field id="federalCodeTxtField" outlined dense filled
                                  :rules="requiredRules"
                                  required tabindex="1"
                                  disabled
                                  v-model="federalCode"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="6" class="pt-2">
                <v-row dense no-gutters>
                  <strong>Mincode</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="10">
                    <v-autocomplete
                      id='schoolNameTxtField'
                      v-model="mincode"
                      :items="schools"
                      :messages="mincode && mincodeSchoolNames.get(mincode)"
                      :rules="requiredRules"
                      tabindex="2"
                      clearable
                      filled
                      outlined
                      dense
                    >
                      <template v-slot:selection="{ item }">
                        <span> {{ item.value }} </span>
                      </template>
                    </v-autocomplete>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="mr-4 pb-6">
          <v-spacer/>
          <PrimaryButton id="mapSchoolCodeDialogCancelBtn" text="Cancel" secondary @click.native="mapSchoolCodeDialog = false"></PrimaryButton>
          <PrimaryButton id="mapSchoolCodeDialogAddBtn" text="Add" :disabled="!isValidForm" :loading="processing" @click.native="createFedProvSchoolCode"></PrimaryButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {mapState} from 'vuex';
import TertiaryButton from '../util/TertiaryButton';
import PrimaryButton from '../util/PrimaryButton';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'MapSchoolCodeModal',
  mixins: [alertMixin],
  components: {
    TertiaryButton,
    PrimaryButton
  },
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
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('nominalRoll', ['fedProvSchoolCodes']),
    schools() {
      return _.sortBy(Array.from(this.mincodeSchoolNames.entries()).map(school => ({ text: `${school[0]} - ${school[1]}`, value: school[0]})), ['value']);
    },
  },
  beforeMount() {
    this.federalCode = this.fedCode;
  },
  methods: {
    createFedProvSchoolCode() {
      if (this.$refs.addSchoolCodeForm.validate()) {
        if(this.fedProvSchoolCodes.find(obj => obj.federalCode === this.federalCode)) {
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
