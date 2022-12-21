<template>
    <v-row no-gutters>
        <v-col>
            <v-row no-gutters>
                <v-col>
                    <span class="format-text">{{ address.addressLine1 }}</span>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col>
                    <span class="format-text">{{ address.addressLine2 }}</span>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col>
                    <span class="format-text">{{ address.city + ', ' + address.provinceCode + ', ' +
                            address.countryCode
                    }}</span>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col>
                    <span class="format-text">{{ address.postal }}</span>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>
  
<script>
export default {
  name: 'FormattedAddress',
  props: {
    address: {
      type: Object,
      required: true
    }
  },
};
</script>
  
<style scoped>
.format-text {
    word-break: break-all;
}
</style>
