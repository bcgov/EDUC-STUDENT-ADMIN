<template>
  <v-container fluid class="fill-height pa-0 mb-4">
    <div style="width: 100%;" :overlay=false>
      <v-row class="pt-0">
        <v-col cols="12 pt-0">
          <v-progress-linear
              absolute
              top
              indeterminate
              color="blue"
              :active="loading"
          ></v-progress-linear>
          <div v-if="!loading && secureExchange" style="width: 100%;" :overlay=false>

            <v-row no-gutters
                   class="pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 d-flex"
            >
              <PrimaryButton id="go-back-action"
                             icon="mdi-arrow-left"
                             to="/edx/exchange"
                             secondary
              >
                Return To Inbox
              </PrimaryButton>
              <v-spacer></v-spacer>
              <div :class="['d-flex', 'align-center']">
                <TertiaryButton id="update-status-action"
                                text="IN PROGRESS"
                                icon="mdi-chevron-down"
                ></TertiaryButton>
                <div v-if="secureExchange.reviewer">{{ `Claimed by ${secureExchange.reviewer}` }}</div>
                <PrimaryButton v-else id="modify-search-action" class="mx-2"
                               text="Claim"
                ></PrimaryButton>
              </div>
            </v-row>
            <v-row class="full-width">
              <v-col cols='6'>
                <v-row>
                  <v-col>
                    <v-card>
                      <v-card-title>
                        <div>{{ secureExchange.subject }}</div>
                        <v-spacer></v-spacer>
                        <primary-button :disabled="secureExchangeStatusIsClosed()">Read/Unread</primary-button>
                      </v-card-title>
                      <v-card-text>{{ getContactName(secureExchange) }}</v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-card v-if="!secureExchangeStatusIsClosed()">
                      <v-row :class="['pa-3']" no-gutters>
                        <v-col>
                          <v-form ref="newCommentForm" v-model="isValidForm">
                            <v-textarea id="new-comment-textArea"
                                        outlined
                                        clearable
                                        rows="5"
                                        maxlength="4000"
                                        dense
                                        :rules="requiredRules"
                                        hide-details="auto"
                                        placeholder="sending comments not implemented yet"
                                        :disabled="secureExchangeStatusIsClosed()"
                            ></v-textarea>
                          </v-form>
                        </v-col>
                      </v-row>
                      <v-row :class="['pa-1', 'd-flex', 'justify-end']" no-gutters>
                        <primary-button id="send-comment-button" :disabled="!isValidForm">
                          Send Message
                        </primary-button>
                      </v-row>
                    </v-card>
                    <v-card v-else :class="['pa-3']">
                          <strong>{{ secureExchange.subject }}</strong>
                          <div>{{ getContactName(secureExchange) }}</div>
                          <div>Secure Exchange cannot be edited because status is closed</div>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-timeline v-if="secureExchange.commentsList.length > 0" >
                      <div v-for="comment in secureExchange.commentsList"
                           :key="comment.secureExchangeID">
                        <v-timeline-item v-bind="timelineItemProps(comment)" small>
                          <v-card>
<!--                            <v-card-title class="comment-title">{{ commentTitleGenerator(comment) }}</v-card-title>-->
                            <v-card-title class="comment-title">
                              <div>{{commentTitleGenerator(comment)}}</div>
                              <v-spacer></v-spacer>
                              <div>{{ dateTimeFormatter(comment.commentTimestamp) }}</div>
                            </v-card-title>
                            <v-card-text>{{ comment.content }}</v-card-text>
                          </v-card>
                        </v-timeline-item>
                      </div>
                    </v-timeline>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="3">
                <v-card>
                  <v-card-title>Students</v-card-title>
                  <v-card-text>Adding a student will allow the school to see the student's demographic details</v-card-text>
                  <v-card-actions :class="['d-flex', 'align-start']">
                    <v-text-field class="ma-0" solo label="Not functional yet" dense></v-text-field>
                    <PrimaryButton>Add Student</PrimaryButton>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col cols="3">
                <DocumentUpload/>
                <v-row dense>
                  <v-col>
                    <v-card :class="['pl-3', 'pr-3']">
                      <v-card-title>
                        Notes
                      </v-card-title>
                      <v-card-text>
                        <p>notes are only visible to other ministry staff members</p>
                        <v-form ref="newNoteForm" v-model="isValidNoteForm">
                          <v-textarea outlined auto-grow clearable dense rows="2"
                                      :rules="requiredRules"
                                      placeholder="sending notes not implemented yet"
                                      hide-details="auto"></v-textarea>
                        </v-form>
                      </v-card-text>
                      <v-card-actions :class="['d-flex', 'justify-end']">
                        <PrimaryButton :disabled="!isValidNoteForm">Add Note</PrimaryButton>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import {mapState} from 'vuex';
import PrimaryButton from '../util/PrimaryButton';
import TertiaryButton from '../util/TertiaryButton';
import DocumentUpload from '../common/DocumentUpload';
import ApiService from '../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import getSecureExchangeContactMixin from '@/mixins/getSecureExchangeContactMixin';
import {Routes, Statuses} from '@/utils/constants';
import {formatDateTime} from '@/utils/format';

export default {
  name: 'NomRollStudentDetailsDisplay',
  components: {
    PrimaryButton,
    TertiaryButton,
    DocumentUpload,
  },
  mixins: [alertMixin, getSecureExchangeContactMixin],
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
      requiredRules: [v => !!v?.trim() || 'Required'],
      isValidForm: false,
      isValidNoteForm: false,
    };
  },
  computed: {
    ...mapState('edx', ['ministryTeams']),
    ...mapState('app', ['mincodeSchoolNames']),
  },
  created() {
    ApiService.apiAxios.get(Routes.edx.EXCHANGE_URL+`/${this.secureExchangeID}`)
      .then(response => {
        this.secureExchange = response.data;
      })
      .catch(error => {
        this.setFailureAlert('Error loading secure exchange message. Please try again');
        console.log(error);
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    commentTitleGenerator: function(comment) {
      let commentUser = '';

      //if there is an edxUserID, comment is from a school otherwise the comment is from the ministry
      if (comment.edxUserID) {
        commentUser = this.getContactName(this.secureExchange);
      } else {
        commentUser = this.getMinistryTeamNameByID(this.secureExchange.ministryOwnershipTeamID);
      }

      return commentUser;
    },
    dateTimeFormatter: function (timestamp = '') {
      return formatDateTime(timestamp,'uuuu-MM-dd\'T\'HH:mm:ss','uuuu/MM/dd', true);
    },
    secureExchangeStatusIsClosed: function () {
      return this.secureExchange.secureExchangeStatusCode === Statuses.exchange.CLOSED;
    },
    timelineItemProps: function (comment) {
      let props = {
        left: !!comment.edxUser,
        right: comment.edxUser,
        color: comment.edxUser ? '#F2F2F2' : '#38598A'
      };

      return props;
    }
  }
};
</script>

<style scoped>
.pre-style {
  white-space: pre-wrap; /* Since CSS 2.1 */
  white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word;
  max-height: 10em;
  overflow-y: auto;
}

pre {
  font-family: inherit;
  font-size: inherit;
}

.comment-title {
  font-size: 1.023rem;
}

/*this makes the primary button not have a grey background when a to property is added.*/
.theme--dark.v-btn--active::before {
  opacity: 0;
}

</style>
