<template>
  <v-container
    fluid
    class="my-16 full-height"
  >
    <!-- login article -->
    <article
      id="login-banner"
      class="top-banner"
    >
      <v-row
        align="center"
        justify="center"
        width="100%"
      >
        <v-col
          cols="12"
          xs="12"
          sm="12"
          md="12"
          lg="12"
          xl="12"
        >
          <v-main>
            <v-container fluid>
              <v-row
                align="center"
                justify="center"
              >
                <v-col
                  xs="10"
                  sm="10"
                  md="10"
                  lg="10"
                  xl="10"
                >
                  <v-card
                    class="error-card"
                    elevation="5"
                  >
                    <v-card-title class="gov-header">
                      <h4
                        id="error_text"
                        style="color:red;"
                      >
                        Unauthorized Access
                      </h4>
                    </v-card-title>
                    <v-card-text id="error_message">
                      <span style="color: black; font-weight: bold">You do not have required roles to perform action on this site.</span>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-main>
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>


<style scoped>
  .error-card{
    margin-top: 5%;
  }
  .gov-header{
    color: #003366;
  }
</style>
