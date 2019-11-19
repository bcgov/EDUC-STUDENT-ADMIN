<template>
    <v-card class="welcome-card">
        <v-card-title class="gov-header">
          <h4 id="login_text">Yay! You logged in!</h4>
        </v-card-title>
    </v-card>
</template>

<script>
export default {
  name: 'Welcome',
  data() {
    return {
            
    };
  },
};
</script>

<style scoped>
    .v-icon{
        padding-left: 10px;
    }
    .welcome-card{
        
        max-width: 400px;
    }
    .gov-header{
        color: #003366;
    }
</style>
