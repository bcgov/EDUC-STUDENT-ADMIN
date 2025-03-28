<template>
  <v-col cols="6">
    <h3 class="subHeading">
      Reporting Cycle
    </h3>
    <p>
      Month Year - Month Year
    </p>
  </v-col>
  <v-col cols="6">
    <h3 class="subHeading">
      Reporting Periods
    </h3>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">
            Reporting Period
          </th>
          <th class="text-left">
            Open Date
          </th>
          <th class="text-left">
            Close Date
          </th>
          <th class="text-left">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>School Year</td>
          <td>{{ collectionsObject.schoolYear ? collectionsObject.schoolYear.openDate : '' }}</td>
          <td>{{ collectionsObject.schoolYear ? collectionsObject.schoolYear.closeDate : '' }}</td>
          <td>
            <v-btn
              variant="text"
              icon="mdi-pencil-outline"
            />
          </td>
        </tr>
        <tr>
          <td>Summer</td>
          <td>{{ collectionsObject.summer ? collectionsObject.summer.openDate : '' }}</td>
          <td>{{ collectionsObject.summer ? collectionsObject.summer.closeDate : '' }}</td>
          <td>
            <v-btn
              variant="text"
              icon="mdi-pencil-outline"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-col>
</template>
<script>
import getStatusColorGdcSession from '../../utils/constants';
export default {
  name: 'ReportingDates',
  props: {
    collectionsObject: {
      type: Object,
      required: true
    },
  }
};
</script>
<style scoped>
.subHeading {
  color: #38598a;
}
</style>
