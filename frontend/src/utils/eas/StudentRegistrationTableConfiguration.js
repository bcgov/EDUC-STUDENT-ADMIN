/**
 * Filters
 */


export const SESSION_CODE_FILTER = Object.freeze(
  {
    heading: 'Session',
    id: 'sessionTypeCode',
    multiple: false,
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
    multiple: false,
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

export const PROFICIENCY_SCORE_RANGE_FILTER = Object.freeze(
  {
    heading: '',
    id: 'proficiencyScoreValue',
    multiple: true,
    key: 'proficiencyScoreValue',
    filterOptions: [
      {
        title: '1',
        id: '1',
        value: '1'
      },
      {
        title: '2',
        id: '2',
        value: '2'
      },
      {
        title: '3',
        id: '3',
        value: '3'
      },
      {
        title: '4',
        id: '4',
        value: '4'
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
      session: SESSION_CODE_FILTER,
      assessmentTypeCode: ASSESSMENT_TYPE_CODE_FILTER,
      specialCaseCode: SPECIAL_CASE_FILTER,
      proficienyScore: PROFICIENCY_SCORE_FILTER,
      proficienyScoreValue: PROFICIENCY_SCORE_RANGE_FILTER
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
      session: SESSION_CODE_FILTER,
      assessmentTypeCode: ASSESSMENT_TYPE_CODE_FILTER,
      specialCaseCode: SPECIAL_CASE_FILTER,
      proficienyScore: PROFICIENCY_SCORE_FILTER,
      proficienyScoreValue: PROFICIENCY_SCORE_RANGE_FILTER      
    }
  });
  
