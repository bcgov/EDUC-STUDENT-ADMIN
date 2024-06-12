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
      { title: 'Status', key: 'penMatchResult' },
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
