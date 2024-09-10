/**
 * Filters
 */

export const WARNING_FILTER = Object.freeze(
  {
    heading: 'Student Status',
    id: 'warnings',
    multiple: true,
    key: 'warnings',
    filterOptions: [
      {
        title: 'Has Funding Warnings',
        id: 'hasFundingWarning',
        value: 'FUNDWARN'
      },
      {
        title: 'Has Info Warnings',
        id: 'hasInfoWarning',
        value: 'INFOWARN'
      },
      {
        title: 'Has Errors',
        id: 'hasErrors',
        value: 'ERROR'
      },
      {
        title: 'Is removed from the collection',
        id: 'isDeleted',
        value: 'DELETED'
      }
    ]
  }
);

export const STUDENT_TYPE_FILTER = Object.freeze(
  {
    heading: 'Student Type',
    id: 'studentType',
    multiple: true,
    key: 'studentType',
    filterOptions: [
      {
        title: 'Adult',
        id: 'isAdult',
        value: 'isAdult'
      },
      {
        title: 'School Aged',
        id: 'isSchoolAged',
        value: 'isSchoolAged'
      },
      {
        title: 'Preschool Aged',
        id: 'isUnderSchoolAged',
        value: 'isUnderSchoolAged'
      }
    ]
  },
);

export const FTE_FILTER = Object.freeze(
  {
    heading: 'FTE',
    id: 'fte',
    multiple: true,
    key: 'fte',
    filterOptions: [
      {
        title: 'FTE = 0',
        id: 'fteEq0',
        value: 'fteEq0'
      },
      {
        title: 'FTE < 1',
        id: 'fteLt1',
        value: 'fteLt1'
      },
      {
        title: 'FTE > 0',
        id: 'fteGt0',
        value: 'fteGt0'
      }
    ]
  },
);

export const FUNDING_TYPE_FILTER = Object.freeze(
  {
    heading: 'Funding Type',
    id: 'fundingtype',
    multiple: true,
    key: 'fundingType',
    filterOptions: [
      {
        title: '14 - Out of Province/International',
        id: 'funding14',
        value: '14'
      },
      {
        title: '20 - Living on Reserve',
        id: 'funding20',
        value: '20'
      },
      {
        title: '16 - Newcomer Refugee',
        id: 'funding16',
        value: '16'
      },
      {
        title: 'No Funding Code',
        id: 'noFunding',
        value: 'No Funding'
      }
    ]
  },
);

export const GRADE_FILTER = Object.freeze(
  {
    heading: 'Grade',
    id: 'grade',
    multiple: true,
    key: 'grade',
    filterOptions: [
      {
        title: 'Kind. Half',
        id: 'gradeKH',
        value: 'KH'
      },
      {
        title: 'Kind. Full',
        id: 'gradeKF',
        value: 'KF'
      },
      {
        title: 'Gr. 1',
        id: 'grade1',
        value: '01'
      },
      {
        title: 'Gr. 2',
        id: 'grade2',
        value: '02'
      },
      {
        title: 'Gr. 3',
        id: 'grade3',
        value: '03'
      },
      {
        title: 'Gr. 4',
        id: 'grade4',
        value: '04'
      },
      {
        title: 'Gr. 5',
        id: 'grade5',
        value: '05'
      },
      {
        title: 'Gr. 6',
        id: 'grade6',
        value: '06'
      },
      {
        title: 'Gr. 7',
        id: 'grade7',
        value: '07'
      },
      {
        title: 'Elem. Ungraded',
        id: 'gradeEU',
        value: 'EU'
      },
      {
        title: 'Gr. 8',
        id: 'grade8',
        value: '08'
      },
      {
        title: 'Gr. 9',
        id: 'grade9',
        value: '09'
      },
      {
        title: 'Gr. 10',
        id: 'grade10',
        value: '10'
      },
      {
        title: 'Gr. 11',
        id: 'grade11',
        value: '11'
      },
      {
        title: 'Gr. 12',
        id: 'grade12',
        value: '12'
      },
      {
        title: 'Sec. Ungraded',
        id: 'gradeSU',
        value: 'SU'
      },
      {
        title: 'Graduated Adult',
        id: 'gradeGA',
        value: 'GA'
      },
      {
        title: 'Home School',
        id: 'gradeHS',
        value: 'HS'
      },
    ]
  },
);

export const SUPPORT_BLOCKS_FILTER = Object.freeze(
  {
    heading: 'Support Blocks',
    id: 'supportblocks',
    multiple: false,
    key: 'support',
    filterOptions: [
      {
        title: 'Has Support Blocks',
        id: 'hasSupportBlocks',
        value: 'hasSupportBlocks'
      },
      {
        title: 'No Support Blocks',
        id: 'noSupportBlocks',
        value: 'noSupportBlocks'
      }
    ]
  }
);

export const FTE_ZERO_FILTER = Object.freeze(
  {
    heading: 'Reasons for FTE = 0 ',
    id: 'zeroFteReasons',
    multiple: true,
    key: 'fteZero',
    filterOptions: [
      {
        title: 'Out of Province International ',
        id: 'outOfprov',
        value: 'OUTOFPROV'
      },
      {
        title: 'Nominal Roll Eligible',
        id: 'nomRoll',
        value: 'NOMROLL'
      },
      {
        title: 'Student Too Young',
        id: 'tooYoung',
        value: 'TOOYOUNG'
      },
      {
        title: 'Graduated Adult',
        id: 'indyAdult',
        value: 'INDYADULT'
      },
      {
        title: 'No new active courses',
        id: 'inactive',
        value: 'INACTIVE'
      },
      {
        title: 'District already received funding',
        id: 'distdup',
        value: 'DISTDUP'
      },
      {
        title: 'Authority already received funding',
        id: 'authdup',
        value: 'AUTHDUP'
      }
    ]
  }
);

export const FRENCH_PROGRAMS_FILTER = Object.freeze(
  {
    heading: 'French Programs',
    id: 'frenchPrograms',
    multiple: true,
    key: 'frenchProgram',
    filterOptions: [
      {
        title: '11 - Early French Immersion',
        id: 'french11',
        value: '11'
      },
      {
        title: '14 - Late French Immersion',
        id: 'french14',
        value: '14'
      },
      {
        title: '08 - Core French',
        id: 'french08',
        value: '08'
      }
    ]
  }
);

export const ENGLISH_PROGRAMS_FILTER = Object.freeze(
  {
    heading: 'English Language Learning',
    id: 'englishPrograms',
    multiple: false,
    key: 'englishProgram',
    filterOptions: [
      {
        title: '17 - English Language Learning',
        id: 'english17',
        value: '17'
      },
      {
        title: 'No English Language Learning',
        id: 'noEnglish17',
        value: 'noEnglish17'
      }
    ]
  }
);

export const FRENCH_FUNDING_FILTER = Object.freeze(
  {
    heading: 'French Program Funding Eligibility',
    id: 'frenchFunding',
    multiple: false,
    key: 'frenchFunding',
    filterOptions: [
      {
        title: 'Funding Eligible',
        id: 'frenchFundingElig',
        value: 'true'
      },
      {
        title: 'Not Funding Eligible',
        id: 'frenchFundingNotElig',
        value: 'false'
      }
    ]
  }
);

export const CAREER_CODE_FILTER = Object.freeze(
  {
    heading: 'Career Code',
    id: 'careerCode',
    multiple: true,
    key: 'careerCode',
    filterOptions: [
      {
        title: 'XA - Business & Applied Business',
        id: 'codeXA',
        value: 'XA'
      },
      {
        title: 'XB - Fine Arts, Design, & Media',
        id: 'codeXB',
        value: 'XB'
      },
      {
        title: 'XC - Fitness & Recreation',
        id: 'codeXC',
        value: 'XC'
      },
      {
        title: 'XD - Health & Human Services',
        id: 'codeXD',
        value: 'XD'
      },
      {
        title: 'XE - Liberal Arts & Humanities',
        id: 'codeXE',
        value: 'XE'
      },
      {
        title: 'XF - Science & Applied Science ',
        id: 'codeXF',
        value: 'XF'
      },
      {
        title: 'XG - Tourism, Hospitality, & Foods',
        id: 'codeXG',
        value: 'XG'
      },
      {
        title: 'XH - Trades & Technology',
        id: 'codeXH',
        value: 'XH'
      }
    ]
  },
);

export const CAREER_PROGRAM_FILTER = Object.freeze(
  {
    heading: 'Career Programs',
    id: 'careerPrograms',
    multiple: true,
    key: 'careerPrograms',
    filterOptions: [
      {
        title: '40 - Career Preparation',
        id: 'career40',
        value: '40'
      },
      {
        title: '41 - Co-Operative Education',
        id: 'career41',
        value: '41'
      },
      {
        title: '42 - Youth Work in Trades Program',
        id: 'career42',
        value: '42'
      },
      {
        title: '43 - Career Technical or Youth Train in Trades',
        id: 'career43',
        value: '43'
      },
    ]
  }
);

export const CAREER_FUNDING_FILTER = Object.freeze(
  {
    heading: 'Career Program Funding Eligibility',
    id: 'careerFunding',
    multiple: false,
    key: 'careerProgramsFunding',
    filterOptions: [
      {
        title: 'Funding Eligible',
        id: 'isCareerFundingEligible',
        value: 'isCareerFundingEligible'
      },
      {
        title: 'Not Funding Eligible',
        id: 'isNotCareerFundingEligible',
        value: 'isNotCareerFundingEligible'
      }
    ]
  }
);

export const INDIGENOUS_PROGRAM_FILTER = Object.freeze(
  {
    heading: 'Indigenous Support Programs',
    id: 'indigenousPrograms',
    multiple: true,
    key: 'indigenousPrograms',
    filterOptions: [
      {
        title: '29 - Language & Culture',
        id: 'indigenous29',
        value: '29'
      },
      {
        title: '33 - Support Services',
        id: 'indigenous33',
        value: '33'
      },
      {
        title: '36 - Other Approved Programs',
        id: 'indigenous36',
        value: '36'
      },
    ]
  }
);

export const ANCESTRY_FILTER = Object.freeze(
  {
    heading: 'Indigenous Ancestry',
    id: 'ancestry',
    multiple: false,
    key: 'ancestry',
    filterOptions: [
      {
        title: 'Has Indigenous Ancestry',
        id: 'hasIndiAncestry',
        value: 'true'
      },
      {
        title: 'No Indigenous Ancestry',
        id: 'hasNoIndAncestry',
        value: 'false'
      }
    ]
  }
);

export const INDIGENOUS_FUNDING_FILTER = Object.freeze(
  {
    heading: 'Indigenous Support Program Funding Eligibility',
    id: 'indigenousFunding',
    multiple: false,
    key: 'indigenousProgramsFunding',
    filterOptions: [
      {
        title: 'Funding Eligible',
        id: 'indFundingEligible',
        value: 'true'
      },
      {
        title: 'Not Funding Eligible',
        id: 'indFundingNotEligible',
        value: 'false'
      }
    ]
  }
);

export const BAND_FILTER = Object.freeze(
  {
    heading: 'Band of Residence',
    id: 'band',
    multiple: true,
    key: 'bandCode',
    filterOptions: [
      {
        title: 'Has Band Code',
        id: 'hasBandCode',
        value: 'true'
      },
      {
        title: 'No Band Code',
        id: 'hasNoBandCode',
        value: 'false'
      },
    ]
  }
);

export const SPED_FILTER = Object.freeze(
  {
    heading: 'Inclusive Education',
    id: 'sped',
    multiple: true,
    key: 'sped',
    filterOptions: [
      {
        title: 'A - Physically Dependent',
        id: 'spedA',
        value: 'A'
      },
      {
        title: 'B - Deafblind',
        id: 'spedB',
        value: 'B'
      },
      {
        title: 'C - Moderate to Profound Intellectual Disability',
        id: 'spedC',
        value: 'C'
      },
      {
        title: 'D - Physical Disability or Chronic Health Impairment',
        id: 'spedD',
        value: 'D'
      },
      {
        title: 'E - Visual Impairment',
        id: 'spedE',
        value: 'E'
      },
      {
        title: 'F - Deaf or Hard of Hearing',
        id: 'spedF',
        value: 'F'
      },
      {
        title: 'G - Autism Spectrum Disorder',
        id: 'spedG',
        value: 'G'
      },
      {
        title: 'H - Intensive Behaviour Intervention/Serious Mental Illness',
        id: 'spedH',
        value: 'H'
      },
      {
        title: 'K - Mild Intellectual Disability',
        id: 'spedK',
        value: 'K'
      },
      {
        title: 'P - Gifted',
        id: 'spedP',
        value: 'P'
      },
      {
        title: 'Q - Learning Disability',
        id: 'spedQ',
        value: 'Q'
      },
      {
        title: 'R - Moderate Behaviour Support/Mental Illness',
        id: 'spedR',
        value: 'R'
      },
    ]
  }
);

export const SPED_FUNDING_FILTER = Object.freeze(
  {
    heading: 'Inclusive Education Funding Eligibility',
    id: 'spedFunding',
    multiple: false,
    key: 'spedFunding',
    filterOptions: [
      {
        title: 'Funding Eligible',
        id: 'spedFundingEligible',
        value: 'true'
      },
      {
        title: 'Not Funding Eligible',
        id: 'spedFundingNotEligible',
        value: 'false'
      }
    ]
  }
);

export const ELL_FUNDING_FILTER = Object.freeze(
  {
    heading: 'English Language Learning Funding Eligibility',
    id: 'ellFunding',
    multiple: false,
    key: 'ellFunding',
    filterOptions: [
      {
        title: 'Funding Eligible',
        id: 'ellFundingEligible',
        value: 'true'
      },
      {
        title: 'Not Funding Eligible',
        id: 'ellFundingNotEligible',
        value: 'false'
      }
    ]
  }
);

export const REFUGEE_FUNDING_FILTER = Object.freeze(
  {
    heading: 'Refugee Funding Eligibility',
    id: 'refugeeFunding',
    multiple: false,
    key: 'refugeeFunding',
    filterOptions: [
      {
        title: 'Funding Eligible',
        id: 'refugeeFundingEligible',
        value: 'true'
      },
      {
        title: 'Not Funding Eligible',
        id: 'refugeeFundingNotEligible',
        value: 'false'
      }
    ]
  }
);

export const ELL_YEARS_FILTER = Object.freeze(
  {
    heading: 'Years in ELL',
    id: 'ellYears',
    multiple: true,
    key: 'ellYears',
    filterOptions: [
      {
        title: '1-5 years in ELL',
        id: 'ell1Between5',
        value: 'ell1Between5'
      },
      {
        title: '6+ years in ELL',
        id: 'ellGtEq6',
        value: 'ellGtEq6'
      }
    ]
  }
);

export const COURSE_FILTER = Object.freeze(
  {
    heading: 'Number of Courses',
    id: 'numCourses',
    key: 'courses'
  }
);

export const MONITORING = Object.freeze(
  {
    allowedFilters: {
      uploadDataFilter: {
        heading: 'Upload Data',
        id: 'uploadDataFilter',
        multiple: false,
        key: 'uploadDataFilter',
        filterOptions: [
          {
            title: '1701 Data Uploaded',
            id: 'uploadDate',
            value: 'uploadDate'
          },
          {
            title: '1701 Data Not Uploaded',
            id: 'notUploadDate',
            value: 'notUploadDate'
          }
        ]
      },
      issuesFilter: {
        heading: 'Errors & Warnings',
        id: 'issuesFilter',
        multiple: true,
        key: 'issuesFilter',
        filterOptions: [
          {
            title: 'Errors',
            id: 'errors',
            value: 'errors'
          },
          {
            title: 'Info Warnings',
            id: 'infoWarnings',
            value: 'infoWarnings'
          },
          {
            title: 'Funding Warnings',
            id: 'fundingWarnings',
            value: 'fundingWarnings'
          }
        ]
      },
      submittedFilter: {
        heading: 'Submitted to District',
        id: 'submittedFilter',
        multiple: false,
        key: 'submittedFilter',
        filterOptions: [
          {
            title: 'Submitted to District',
            id: 'submittedToDistrict',
            value: 'submittedToDistrict'
          },
          {
            title: 'Not Submitted to District',
            id: 'notSubmittedToDistrict',
            value: 'notSubmittedToDistrict'
          }
        ]
      }
    }
  }
);

export const PROVINCIAL_DUPLICATES = Object.freeze(
  {
    nonAllowableTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInELL' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' },
    ],
    allowableTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInELL' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' },
    ],
    resolvedTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Birthdate', key: 'dob' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInELL' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
      { title: 'FTE', key: 'fte' },
    ],
  }
);
export const PEN_MATCHING = Object.freeze(
  {
    defaultFilter: { label: 'REVIEW_PEN', description: '' },
    penReviewTableHeaders: [
      { title: 'select', key: 'select' },
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Submitted PEN', key: 'studentPen' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Birthdate', key: 'dob', subHeader: { title: 'Gender', key: 'gender' } },
      { title: 'Grade', key: 'enrolledGradeCode' },
      { title: 'Status', key: 'mappedPenMatchResult' },
    ]
  }
);

export const NEW_PEN = Object.freeze(
  {
    defaultFilter: { label: 'NEW_PEN', description: '' },
    newPenTableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Local ID', key: 'localID', subHeader: { title: 'Submitted PEN', key: 'studentPen' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Birthdate', key: 'dob', subHeader: { title: 'Gender', key: 'gender' } },
      { title: 'Grade', key: 'enrolledGradeCode' },
    ]
  }
);

export const FTE = Object.freeze(
  {
    tableHeaders: [
      { key: 'sdcSchoolCollectionStudentStatusCode' },
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Assigned PEN', key: 'assignedPen', subHeader: { title: 'Local ID', key: 'localID' } },
      { title: 'Legal Surname, Given (Middle)', key: 'legalName', subHeader: { title: 'Usual Surname, Given (Middle)', key: 'usualName' } },
      { title: 'Birthdate', key: 'dob', subHeader: { title: 'Gender', key: 'gender' } },
      { title: 'Adult', key: 'isAdult', subHeader: { title: 'Grad', key: 'isGraduated' } },
      { title: 'Grade', key: 'enrolledGradeCode', subHeader: { title: 'Funding Code', key: 'mappedSchoolFunding' } },
      { title: 'Courses For Grad', key: 'mappedNoOfCourses', subHeader: { title: 'Support Blocks', key: 'supportBlocks' } },
      { title: 'Language Program', key: 'mappedLanguageEnrolledProgram', subHeader: { title: 'Years in ELL', key: 'yearsInEll' } },
      { title: 'Career Program', key: 'mappedCareerProgram', subHeader: { title: 'Career Code', key: 'mappedCareerProgramCode' } },
      { title: 'Indigenous Ancestry', key: 'mappedAncestryIndicator', subHeader: { title: 'Band Code', key: 'mappedBandCode' } },
      { title: 'Indigenous Support Program', key: 'mappedIndigenousEnrolledProgram', subHeader: { title: 'Inclusive Education Category', key: 'mappedSpedCode' } },
    ],
    summaryReport: [
      { title: 'Eligible Enrolment & Eligible FTE', endpoint:'enrollment'},
      { title: 'Grade Enrolment & FTE per School', endpoint:'grade-enrollment'}
    ],
    allowedFilters: {
      warnings: WARNING_FILTER,
      studentType: STUDENT_TYPE_FILTER,
      fte: FTE_FILTER,
      grade: GRADE_FILTER,
      fundingType: FUNDING_TYPE_FILTER,
      courses: COURSE_FILTER,
      support: SUPPORT_BLOCKS_FILTER,
      fteZero: FTE_ZERO_FILTER,
      frenchProgram: {
        ...FRENCH_PROGRAMS_FILTER,
        filterOptions: [
          ...FRENCH_PROGRAMS_FILTER.filterOptions,
          {
            title: '05 - Programme Francophone',
            id: 'french05',
            value: '05'
          },
          {
            title: 'No French Programs',
            id: 'noFrenchProgram',
            value: 'noFrenchPrograms'
          }
        ]
      },
      englishProgram: ENGLISH_PROGRAMS_FILTER,
      ellYears: ELL_YEARS_FILTER,
      careerPrograms: {
        ...CAREER_PROGRAM_FILTER,
        filterOptions: [
          ...CAREER_PROGRAM_FILTER.filterOptions,
          {
            title: 'No Career Programs',
            id: 'noCareerProgram',
            value: 'noCareerPrograms'
          }
        ]
      },
      careerCode: {
        ...CAREER_CODE_FILTER,
        filterOptions: [
          ...CAREER_CODE_FILTER.filterOptions,
          {
            title: 'No Career Code',
            id: 'noCareerCode',
            value: 'noCareerCodes'
          }
        ]
      },
      indigenousPrograms: {
        ...INDIGENOUS_PROGRAM_FILTER,
        filterOptions: [
          ...INDIGENOUS_PROGRAM_FILTER.filterOptions,
          {
            title: 'No Indigenous Support Programs',
            id: 'noIndigenousPrograms',
            value: 'noIndigenousPrograms'
          }
        ]
      },
      bandCode: BAND_FILTER,
      ancestry: ANCESTRY_FILTER,
      sped: {
        ...SPED_FILTER,
        filterOptions: [
          ...SPED_FILTER.filterOptions,
          {
            title: 'No Inclusive Education Category',
            id: 'noSpedCategory',
            value: 'noSpedCode'
          }
        ]
      }
    }
  }
);

export const MIN_REPORTS = Object.freeze(
  {
    fsaReportHeadersforFeb: [
      { title: 'Student PEN', key: 'assignedPen'},
      { title: 'District Number', key: 'districtNumber' },
      { title: 'School Number', key: 'schoolNumber' },
      { title: 'Next Year Grade', key: 'enrolledGradeCode'},
      { title: 'Student Local ID', key: 'localID' },
      { title: 'Legal First Name', key: 'legalFirstName'},
      { title: 'Legal Last Name', key: 'legalLastName' }
    ],
    fsaReportHeadersforSept: [
      { title: 'Student PEN', key: 'assignedPen'},
      { title: 'District Number', key: 'districtNumber' },
      { title: 'School Number', key: 'schoolNumber' },
      { title: 'Year Grade', key: 'enrolledGradeCode'},
      { title: 'Student Local ID', key: 'localID' },
      { title: 'Legal First Name', key: 'legalFirstName'},
      { title: 'Legal Last Name', key: 'legalLastName' }
    ]
  }
);