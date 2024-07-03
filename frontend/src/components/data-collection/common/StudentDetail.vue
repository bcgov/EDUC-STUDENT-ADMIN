<template>
  <v-card
    class="mb-3"
    variant="tonal"
  >
    <v-row class="mt-1 mb-1">
      <v-col class="d-flex justify-center">
        {{ student?.schoolName }}
      </v-col>
    </v-row>
  </v-card>

  <v-row>
    <v-col cols="3">
      <span class="label">Assigned PEN:</span>
    </v-col>
    <v-col cols="3">
      <span>{{ student?.assignedPen }}</span>
    </v-col>

    <v-col cols="3">
      <span class="label">Local ID:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.localID }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Birthdate:</span>
    </v-col>
    <v-col cols="3">
      {{ formatDate(student?.dob) }}
    </v-col>

    <v-col cols="3">
      <span class="label">Gender:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.gender }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Legal Surname:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.legalLastName }}
    </v-col>

    <v-col cols="3">
      <span class="label">Usual Surname:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.usualLastName }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Legal Given:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.legalFirstName }}
    </v-col>

    <v-col cols="3">
      <span class="label">Usual Given:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.usualFirstName }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Legal Middle:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.legalMiddleNames }}
    </v-col>

    <v-col cols="3">
      <span class="label">Usual Middle:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.usualMiddleNames }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Grade:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.enrolledGradeCode }}
    </v-col>

    <v-col cols="3">
      <span class="label">Funding code:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.mappedSchoolFunding }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Number of Courses:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.numberOfCoursesDec }}
    </v-col>

    <v-col cols="3">
      <span class="label">Other Courses:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.otherCourses }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Support Blocks:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.supportBlocks }}
    </v-col>

    <v-col cols="3">
      <span class="label">Special Ed Category:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.mappedSpedCode }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Indigenous Ancestry:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.mappedAncestryIndicator }}
    </v-col>

    <v-col cols="3">
      <span class="label">Band of Residence:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.mappedBandCode }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Home Language:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.mappedHomelanguageCode }}
    </v-col>

    <v-col cols="3">
      <span class="label">Postal Code:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.postalCode }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Career Code:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.mappedCareerProgramCode }}
    </v-col>

    <v-col cols="3">
      <span class="label">Program Codes:</span>
    </v-col>
    <v-col cols="3">
      {{ enrolledPrograms(student) }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Graduated:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.isGraduated === true ? 'Yes' : 'No' }}
    </v-col>
  </v-row>

  <v-row class="mt-n4">
    <v-col cols="3">
      <span class="label">Adult:</span>
    </v-col>
    <v-col cols="3">
      {{ student?.isAdult === true ? 'Yes': 'No' }}
    </v-col>
  </v-row>
</template>


<script>

import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import {enrolledProgram}  from '@/utils/sdc/enrolledProgram';
import {formatDateTime} from '@/utils/format';

export default {
  name: 'StudentDetail',
  components: {
  },
  props: {
    student: {
      type: Object,
      required: true,
      default: null
    },
    duplicateTypeCode: {
      type: String,
      required: true,
      default: null
    }
  },
  async mounted() {
    await sdcCollectionStore().getCodes();
  },
  methods: {
    formatDate(inputDate) {
      return formatDateTime(inputDate,'uuuuMMdd','uuuu/MM/dd', false);
    },
    mapEnrolledProgram(student, enrolledProgramFilter) {
      return student.enrolledProgramCodes
        ?.match(/.{1,2}/g)
        .filter(programCode => enrolledProgramFilter.includes(programCode))
        .map(programCode => {
          const enrolledProgram = sdcCollectionStore().enrolledProgramCodesMap.get(programCode);
          return {code: programCode, description: `${programCode} - ${enrolledProgram.description}`};
        });
    },
    enrolledPrograms(student) {
      let code = this.mapEnrolledProgram(student, [...enrolledProgram.INDIGENOUS_ENROLLED_PROGRAM_CODES, ...enrolledProgram.CAREER_ENROLLED_PROGRAM_CODES, ...enrolledProgram.LANGUAGE_PROGRAM_CODES]);
      return code?.map(val => val.description).join(',');
    }   
  }
};
</script>
  
  <style scoped>
   .label {
    color: grey;
   }

   .release-button {
    width: 100%;
   }
  
  </style>
  
