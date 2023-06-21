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
    title: () => {
      let files = '';
      if(this.multiFiles) {
        let numberOfSelectedFiles = [...new Set(this.selectedIDs?.map(item => item[`${this.requestType}ID`]))]?.length;
        files = `(${numberOfSelectedFiles} ${numberOfSelectedFiles > 1 ? 'files' : 'file'} selected)`;
      }
      return `Record ${this.currentRequest + 1} of ${Object.keys(this.selectedIDs)?.length} ${files}`;
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
