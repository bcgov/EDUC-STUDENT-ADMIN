<template>
  <v-container class="pa-0">
    <v-card
      height="100%"
      width="100%"
    >
      <v-toolbar
        flat
        color="#036"
        class="white--text"
      >
        <v-toolbar-title><h2>Discussion</h2></v-toolbar-title>
      </v-toolbar>
      <v-card id="chat-box">
        <v-progress-linear
          v-if="loading"
          indeterminate
          absolute
          top
          color="indigo darken-2"
        />
        <SingleComment
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
        />
      </v-card>
    </v-card>
  </v-container>
</template>
<script>
import SingleComment from './Single-comment.vue';
import ApiService from '../common/apiService';
import {mapActions, mapState} from 'pinia';
import {Routes} from '../utils/constants';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';

export default {
  components: {
    SingleComment
  },
  props: {
    requestType: {
      type: String,
      required: true
    },
    requestId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      toLoad: [],
      loading: true,
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['messages']),
    myself() {
      return { name: this.userInfo.userName, id: this.userInfo.userGuid };
    },
    comments() {
      return this.messages;
    }
  },
  created() {
    this.setParticipants();
    this.setMessages();
    ApiService.apiAxios
      .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId + '/comments')
      .then(response => {
        this.setParticipants(response.data.participants);
        this.setMessages(response.data.messages);
      })
      .catch(error => {
        console.log(error);
        this.alert = true;
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    ...mapActions(appStore, ['setMessages', 'setParticipants'])
  }
};
</script>

<style scoped>
  #chat-box {
    height:385px;
    overflow-y: auto;
  }
  a {
    text-decoration: none;
  }
  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ececec;
    margin: 1em;
    padding: 0;
  }
  h2 {
    font-size: 1.25rem
  }
  .comments-outside {
    /* box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3); */
    margin-top: 0;
    max-width: 100%;
    height:100%;
    width: 100%;
    position: relative;
    overflow-y: hidden;

  }
  .comments-header {
    background-color: #C8C8C8;
    padding: 1rem;
    align-items: center;
    display: flex;
    justify-content: space-between;
    color: #333;
    min-height: 80px;
    font-size: 2rem;
  }
  .comments-header .comments-stats span {
    margin-left: 1rem;
  }
  .post-owner {
    display: flex;
    align-items: center;
  }

  .post-owner .username > a {
    color: #333;
  }

  .custom-scrollbar::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    -moz-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: #fff;
  }
  .custom-scrollbar::-webkit-scrollbar
  {
    width: 0.8rem;
    background-color: #fff;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb
  {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    -moz-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: #555;
  }

  .v-toolbar /deep/ .v-toolbar__content {
    padding-left: 20px !important;
  }
</style>
