<template>
    <div :class="comment.color">
      <v-row class="mr-0">
          <v-col class="pa-0 iconCol" md="auto">
            <v-icon :size="iconSize">{{ comment.icon }}</v-icon>
          </v-col>
          <v-col class="pa-0 header-col">
            <p class="username mb-0" href="#">
              <strong>{{ comment.name }}</strong> at {{ comment.timestamp}}
            </p>
          </v-col>
      </v-row>
      <v-row class="ml-6 ml-sm-7 mr-1">
        <v-col class="content-col">
        <v-row class="mb-1">
          <span :class="{commentContent: comment.content && comment.content.length > 0}">{{ comment.content }}</span>
        </v-row>
        </v-col>
      </v-row>
    </div>
</template>

<script>

export default {
  props: {
    comment: {
      type: Object,
      required: true
    },
    highlight: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    iconSize() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs': return '22px';
      case 'sm': return '25px';
      case 'md': return '25px';
      case 'lg': return '28px';
      case 'xl': return '28px';
      default: return '25px';
      }
    }
  },
  created() {
    if(this.comment.participantId === '1'){
      this.comment.color = 'studentBlue';
      this.comment.icon = '$info';
    } else {
      this.comment.color = 'adminGreen';
      this.comment.icon = '$question';
    }
  }
};
</script>

<style scoped>
.comment .avatar {
    align-self: flex-start;
}
.comment .avatar > img {
    width: 3rem;
    height: 3rem;
    border-radius: 100%;
    align-self: start;
}
.comment .text {
    text-align: left;
    margin-left: 0.5rem;
}
.comment .text span {
    margin-left: 0.5rem;
}
.comment .text .username {
    font-weight: bold;
    color: #333;
}
.username{
  padding-left: 0.5rem;
  padding-right: 0.1rem;
  font-size: 0.85rem;
}
.timestamp{
  font-size: 0.72rem;
  color: rgba(0, 0, 0, 0.38)
}
.header-row{
  padding-bottom: 0;
}
.header-col{
  padding-top: 0;
  padding-bottom: 0;
}
.content-col{
  padding: 0.2rem 0.5rem 0.2rem 1rem;
}
.studentBlue{
  background-color: #F2F2F2;
  padding: 0.5rem;
  align-items: center;
  color: #333;
  border-bottom: 1px solid #97888e;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}
.adminGreen{
  background-color: #E9F2DF;
  padding: 0.5rem;

  align-items: center;
  color: #333;
  border-bottom: 1px solid #97888e;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}
.iconCol{
  flex-grow: 0
}
.commentContent {
  white-space: pre-wrap; 
  word-wrap: break-word;
}
</style>
