<template>
  <div>
    <Chat 
      :participants="participants"
      :myself="this.myselfProp"
      :messages="messages"
      :on-type="onType"
      :on-message-submit="onMessageSubmit"
      :chat-title="chatTitle"
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
      :display-header="displayHeader"/>
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
    myselfProp: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      visible: true,
      participants: [
        {
          name: 'Arnaldo',
          id: 1
        },
        {
          name: 'José',
          id: 2
        }
      ],
      messages: [
        {
          content: 'received messages',
          myself: false,
          participantId: 1,
          timestamp: {year: 2019, month: 3, day: 5, hour: 20, minute: 10, second: 3, millisecond: 123}
        },
        {
          content: 'sent messages',
          myself: true,
          participantId: 'e6df3063e5104583aa0477db774a7216',
          timestamp: {year: 2019, month: 4, day: 5, hour: 19, minute: 10, second: 3, millisecond: 123}
        },
        {
          content: 'other received messages',
          myself: false,
          participantId: 2,
          timestamp: {year: 2019, month: 5, day: 5, hour: 10, minute: 10, second: 3, millisecond: 123}
        }
      ],
      chatTitle: 'Discussion',
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
      toLoad: [
        {
          content: 'Hey, John Doe! How are you today?',
          myself: false,
          participantId: 2,
          timestamp: {year: 2011, month: 3, day: 5, hour: 10, minute: 10, second: 3, millisecond: 123},
          uploaded: true,
          viewed: true
        },
        {
          content: 'Hey, Adam! I\'m feeling dreally fine this evening.',
          myself: true,
          participantId: 'e6df3063e5104583aa0477db774a7216',
          timestamp: {year: 2010, month: 0, day: 5, hour: 19, minute: 10, second: 3, millisecond: 123},
          uploaded: true,
          viewed: true
        },
      ],
      scrollBottom: {
        messageSent: true,
        messageReceived: true
      },
      displayHeader:false
    };
  },
  mounted() {
    /*ApiService.apiAxiosss
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.$route.params.id + '/comments')
      .then(response => {
        this.request = response.data;
        this.participants = response.data.participants;
        this.myself = response.data.myself;
        this.messages = response.data.messages;
      })
      .catch(error => {
        console.log(error);
      });*/
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
      /*
      * example simulating an upload callback. 
      * It's important to notice that even when your message wasn't send 
      * yet to the server you have to add the message into the array
      */
      console.log('this');
      const request = {
        penRetrievalRequestID: this.$route.params.id,
        staffMemberIDIRGUID: this.myself.id,
        staffMemberName: this.myself.name,
        commentContent: message.content,
        commentTimestamp: message.timestamp
      };
      ApiService.apiAxios
        .post(Routes.PEN_REQUEST_ENDPOINT + '/' + this.$route.params.id + '/comments', request)
        .then(() => {
          this.messages.push(message);
        })
        .catch(error => {
          console.log(error);
        });
      /*
      * you can update message state after the server response
      */
      // timeout simulating the request
      setTimeout(() => {
        message.uploaded = true;
      }, 2000);
    },
    onClose() {
      this.visible = false;
    }
  }
};
</script>
