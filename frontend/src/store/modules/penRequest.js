export default {
  state: {
    selectedRequest: null,
    headerSearchParams: {
      initialSubmitDate: [],
      status: '',
      legalLastName: '',
      legalFirstName: '',
      reviewer: '',
    },
    headerSortParams: {
      currentSort:'initialSubmitDate',
      currentSortDir: false
    },
    defaultSelected:[],
    documentTypes: [],
  }
};
