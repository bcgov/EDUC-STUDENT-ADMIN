<template>
    <v-row no-gutters>
        <v-col>
            <v-row no-gutters>
                <v-col>
                    <span style="word-break: break-all;">{{ address.addressLine1 }}</span>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col>
                    <span style="word-break: break-all;">{{ address.addressLine2 }}</span>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col>
                    <span style="word-break: break-all;">{{ address.city + ', ' + address.provinceCode + ', ' +
                            address.countryCode
                    }}</span>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col>
                    <span style="word-break: break-all;">{{ address.postal }}</span>
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
</style>
