  <template>
  <v-container fluid class="fill-height pa-0 mb-4">

    <div style="width: 100%;" :overlay=false>
      <div class="full-width">
        <v-row class="pt-0">
          <v-col cols="12 pt-0">
            <v-progress-linear
              absolute
              top
              indeterminate
              color="blue"
              :active="loading"
            ></v-progress-linear>
            <div>{{secureExchangeID}}</div>
            <div v-if="!loading && secureExchange" style="width: 100%;" :overlay=false>

              <v-row no-gutters
                class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 d-flex align-center"
                style="background-color:white;"
              >
                <TertiaryButton id="go-back-action"
                                icon="mdi-arrow-left" 
                ></TertiaryButton>
                <v-spacer></v-spacer>
                <TertiaryButton id="update-status-action" 
                                text="IN PROGRESS"
                                icon="mdi-chevron-down"
                ></TertiaryButton>
                <TertiaryButton id="claim-action" 
                                text="Tester"
                                icon="mdi-chevron-down"
                ></TertiaryButton>
                <PrimaryButton id="modify-search-action" :secondary="true" class="mx-2"
                               text="Claim"
                ></PrimaryButton>
              </v-row>
              <!-- <v-row v-if="isLoading">
                <v-container fluid class="full-height">
                  <article id="message-container" class="top-banner full-height">
                    <v-row align="center" justify="center">
                      <v-progress-circular
                          :size="70"
                          :width="7"
                          color="primary"
                          indeterminate
                      ></v-progress-circular>
                    </v-row>
                  </article>
                </v-container>
              </v-row> -->
              <v-row class="full-width">
                <v-col cols='8'>
                  <v-card outlined>
                    <v-row no-gutters>
                      <span>
                        <strong>{{ secureExchange.subject }}</strong>
                      </span>
                      <v-spacer></v-spacer>
                      <v-icon
                        large
                      >
                        mdi-email-mark-as-unread
                      </v-icon>
                      <v-icon
                        large
                      >
                        mdi-plus
                      </v-icon>
                    </v-row>
                      
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script>
// import {mapMutations, mapState} from 'vuex';
import PrimaryButton from '../util/PrimaryButton';
import TertiaryButton from '../util/TertiaryButton';
// import ApiService from '../../common/apiService';
// import {
//   Routes,
// } from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
// import {
//   deepCloneObject,
// } from '@/utils/common';
import router from '../../router';
import Mousetrap from 'mousetrap';

export default {
  name: 'NomRollStudentDetailsDisplay',
  components: {
    PrimaryButton,
    TertiaryButton,
  },
  mixins: [alertMixin],
  props: {
    secureExchangeID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      secureExchange: null,
      loading: true,
    };
  },
  computed: {
    
  },
  // created() {
  //   //Go back to Files page if refresh button is pressed
  //   if(Object.keys(this.selectedIDs).length > 0) {
  //     this.initializeDetails();
  //   } else {
  //     router.push({name: 'nominal-roll-list'});
  //   }
  // },
  mounted() {
    Mousetrap.bind('ctrl+b', () => {
      router.push({name: 'nominal-roll'});
      return false;
    });
  },
  methods: {
  }
};
</script>

<style scoped>
.batch-title {
  font-size: 1.065rem;
}

.pre-style {
  white-space: pre-wrap; /* Since CSS 2.1 */
  white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word;
  max-height: 10em;
  overflow-y: auto;
}

.pen-placeholder {
  margin-right: 5.7em;
}

#bottom-table /deep/ table th,
#top-table /deep/ table th {
  border-bottom: none !important;
  font-size: 0.875rem;
  font-weight: normal;
  color: rgba(0, 0, 0, 0.87) !important;
  height: 1.5rem;
}


.details-table /deep/ table > tbody > tr > td {
  height: 1.5rem;
}

.details-table /deep/ table > tbody > tr:hover {
  background: transparent !important;
}

.details-table /deep/ table > tbody > tr:not(:last-child) > td {
  border-bottom: none !important;
}

.full-width {
  margin-left: -32px;
  margin-right: -32px;
}

pre {
  font-family: inherit;
  font-size: inherit;
}
</style>
