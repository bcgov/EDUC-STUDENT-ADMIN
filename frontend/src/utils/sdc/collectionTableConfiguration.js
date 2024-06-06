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
