<template>
  <div v-if="this.myself.name == null"></div>
  <div v-else>
    <Chat
      :participants="this.participants"
      :myself="this.myself"
      :messages="this.messages"
      :on-message-submit="onMessageSubmit"
      :placeholder="placeholder"
      :colors="colors"
      :border-style="borderStyle"
      :hide-close-button="hideCloseButton"
      :close-button-icon-size="closeButtonIconSize"
      :on-close="onClose"
      :submit-icon-size="submitIconSize"
      :load-more-messages="toLoad.length > 0 ? loadMoreMessages : null"
      :async-mode="asyncMode"
      :scroll-bottom="scrollBottom"
      :display-header="displayHeader">
    </Chat>
  </div>
</template>
<script>
import { Chat } from 'vue-quick-chat';
import 'vue-quick-chat/dist/vue-quick-chat.css';
import { Routes } from '@/utils/constants';
import ApiService from '@/common/apiService';
export default {
  components: {
    Chat
  },
  props: {
    myself: {
      type: Object,
      required: true
    },
    participants: {
      type: Array,
      required: true
    },
    messages: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      visible: true,
      placeholder: 'send your message',
      colors: {
        header: {
          bg: '#38598a',
          text: '#fff'
        },
        message: {
          myself: {
            bg: '#fff',
            text: '#38598a'
          },
          others: {
            bg: '#38598a',
            text: '#fff'
          },
          messagesDisplay: {
            bg: '#fafafa'
          }
        },
        submitIcon: '#036'
      },
      borderStyle: {
        topLeft: '10px',
        topRight: '10px',
        bottomLeft: '10px',
        bottomRight: '10px',
      },
      hideCloseButton: true,
      submitIconSize: '30px',
      closeButtonIconSize: '20px',
      asyncMode: false,
      toLoad: [],
      scrollBottom: {
        messageSent: true,
        messageReceived: true
      },
      displayHeader:false
    };
  },
  mounted() {
    console.log('HERE');
    console.log(this.participants);
    console.log('THERE');
    console.log(this.myself.name);
  },
  methods: {
    /*onType: function (event) {
      //here you can set any behavior
    },*/
    loadMoreMessages(resolve) {
      setTimeout(() => {
        resolve(this.toLoad); //We end the loading state and add the messages
        //Make sure the loaded messages are also added to our local messages copy or they will be lost
        this.messages.unshift(...this.toLoad);
        this.toLoad = [];
      }, 1000);
    },
    onMessageSubmit: function (message) {
      ApiService.apiAxios
        .post(Routes.PEN_REQUEST_ENDPOINT + '/' + this.$route.params.id + '/comments', message)
        .then(() => {
          this.messages.push(message);
        })
        .catch(error => {
          console.log(error);
        });
    },
    onClose() {
      this.visible = false;
    }
  }
};
</script>
