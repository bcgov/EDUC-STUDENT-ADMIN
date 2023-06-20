import {defineStore} from 'pinia';

export const navigationStore = defineStore('navigation', {
  namespaced: true,
  state: () => ({
    selectedIDs: [],
    currentRequest: 0,
    archived: false,
    requestType: 'penRequestBatch',
    multiFiles: true,
  }),
  getters: {
    title: state => {
      let files = '';
      if(state.multiFiles) {
        let numberOfSelectedFiles = [...new Set(state.selectedIDs?.map(item => item[`${state.requestType}ID`]))]?.length;
        files = `(${numberOfSelectedFiles} ${numberOfSelectedFiles > 1 ? 'files' : 'file'} selected)`;
      }
      return `Record ${state.currentRequest + 1} of ${Object.keys(state.selectedIDs)?.length} ${files}`;
    },
  },
  actions: {
    /**
     * call the clearNavigation in the beforeDestroy method of a component to hide SetNavigation component
     */
    async clearNavigation() {
      this.selectedIDs = [];
      this.currentRequest = 0;
      this.archived = false;
      this.requestType = 'penRequestBatch';
      this.multiFiles = true;
    },
    async setSelectedIDs(selectedIDs) {
      this.selectedIDs = selectedIDs;
    },
    async setCurrentRequest(currentRequest) {
      this.currentRequest = currentRequest;
    },
    async setArchived(archived) {
      this.archived = archived;
    },
    async setRequestType(requestType) {
      this.requestType = requestType;
    },
    async setMultiFiles(multiFiles) {
      this.multiFiles = multiFiles;
    }
  },
});
