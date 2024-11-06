/**
 * Filters
 */


export const SESSION_CODE_FILTER = Object.freeze(
  {
    heading: 'Session',
    id: 'sessionTypeCode',
    multiple: true,
    key: 'sessionTypeCode',
    filterOptions: [
    ]
  }
);

export const ASSESSMENT_TYPE_CODE_FILTER = Object.freeze(
  {
    heading: 'Assessment / Course',
    id: 'assessmentTypeCode',
    multiple: true,
    key: 'assessmentTypeCode',
    filterOptions: [
    ]
  }
);

export const SPECIAL_CASE_FILTER = Object.freeze(
  {
    heading: 'Special Case',
    id: 'specialCaseCode',
    multiple: true,
    key: 'specialCaseCode',
    filterOptions: [
      {
        title: 'Aegrotat',
        id: 'aegrotat',
        value: 'A'
      },
      {
        title: 'Exemption',
        id: 'exemption',
        value: 'E'
      },
      {
        title: 'Disqualified',
        id: 'disqualified',
        value: 'D'
      }
    ]
  }
);

export const PROFICIENCY_SCORE_FILTER = Object.freeze(
  {
    heading: 'Proficiency Score',
    id: 'proficiencyScore',
    multiple: true,
    key: 'proficiencyScore',
    filterOptions: [
      {
        title: 'Have Results',
        id: 'results',
        value: 'true'
      },
      {
        title: 'No Results Received',
        id: 'noResults',
        value: 'false'
      }
    ]
  }
);

export const SCHOOL_YEAR_REGISTRATIONS_VIEW = Object.freeze(
  {
    tableHeaders: [
      { title: 'Session', key: 'sessionName'},
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Assessment Center', key: 'assessmentCenterName' },
      { title: 'PEN', key: 'pen' },
      { title: 'Local ID', key: 'localID' },
      { title: 'Surname', key: 'surName' },
      { title: 'Course Name (Code)', key: 'assessmentTypeName' },
      { title: 'Special Case', key: 'provincialSpecialCaseName' },
      { title: 'Proficiency Score', key: 'proficiencyScore' },
    ],
    allowedFilters: {
      sessions: SESSION_CODE_FILTER,
      assessmentTypeCode: ASSESSMENT_TYPE_CODE_FILTER,
      specialCaseCode: SPECIAL_CASE_FILTER,
      proficienyScore: PROFICIENCY_SCORE_FILTER
    }
  });


export const SESSION_REGISTRATIONS_VIEW = Object.freeze(
  {
    tableHeaders: [
      { title: 'District', key: 'districtName' },
      { title: 'School', key: 'schoolName' },
      { title: 'Assessment Center', key: 'assessmentCenterName' },
      { title: 'PEN', key: 'pen' },
      { title: 'Local ID', key: 'localID' },
      { title: 'Surname', key: 'surName' },
      { title: 'Course Name (Code)', key: 'assessmentTypeName' },
      { title: 'Special Case', key: 'provincialSpecialCaseName' },
      { title: 'Proficiency Score', key: 'proficiencyScore' },
    ],
    allowedFilters: {
      assessmentTypeCode: ASSESSMENT_TYPE_CODE_FILTER,
      specialCaseCode: SPECIAL_CASE_FILTER,
      proficienyScore: PROFICIENCY_SCORE_FILTER
    }
  });
  
