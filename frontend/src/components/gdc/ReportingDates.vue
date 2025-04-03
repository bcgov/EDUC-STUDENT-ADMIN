<template>
  <v-col cols="9">
    <h3 class="subHeading">
      Reporting Cycle
    </h3>
    <p>
      Month Year - Month Year
    </p>
  </v-col>
  <v-col cols="9">
    <h3 class="subHeading">
      Reporting Periods
    </h3>
    <v-table>
      <thead>
        <tr>
          <th
            class="text-left"
            scope="col"
          >
            Reporting Period
          </th>
          <th
            class="text-left"
            scope="col"
          >
            Open Date
          </th>
          <th
            class="text-left"
            scope="col"
          >
            Close Date
          </th>
          <th
            class="text-left"
            scope="col"
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>School Year</td>
          <td>{{ collectionObject?.schYrStart }}</td>
          <td>{{ collectionObject?.schYrEnd }}</td>
          <td>
            <v-btn
              variant="text"
              icon="mdi-pencil-outline"
            />
          </td>
        </tr>
        <tr>
          <td>Summer</td>
          <td>{{ collectionObject?.summerStart }}</td>
          <td>{{ collectionObject?.summerEnd }}</td>
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
// todo
//import getStatusColorGdcSession from '../../utils/constants';
export default {
  name: 'ReportingDates',
  props: {
    collectionObject: {
      type: Object,
      required: false,
      default: null
    },
  }
};
</script>
<style scoped>
.subHeading {
  color: #38598a;
}
</style>
