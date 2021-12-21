<template>
  <v-row>
    <v-col cols='2'>
      <v-expansion-panels :value="0">
        <v-expansion-panel>
          <v-expansion-panel-header> PEN Team</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-list dense>
              <v-list-item-group v-model="selectedItem" color="primary">
                <v-list-item>
                  <v-list-item-content>Messages</v-list-item-content>
                  <v-list-item-avatar>1</v-list-item-avatar>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Unclaimed Messages</v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
    <v-col>
      <v-card outlined>
        Messages
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'MessagesPage',
  data() {
    return {
      selectedItem: 0
    };
  }
};


</script>

<style scoped>

</style>
