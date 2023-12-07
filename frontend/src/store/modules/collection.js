import { defineStore } from 'pinia';
import {COLLECTION_CLOSURE_STEPS} from '@/utils/institute/collectionClosureSteps';
import {Routes} from "@/utils/constants";
import ApiService from "@/common/apiService";
import {capitalize} from "vue";

export const collectionStore = defineStore('collection', {
    id: 'collection',
    state: () => ({
        currentStepInCollectionClosureProcess: null,
        stepsInCollectionClosureProcess: COLLECTION_CLOSURE_STEPS,
        activeCollectionTypeCode: null,
        activeCollectionYear: null,
        totalStepsInCollectionClosure: COLLECTION_CLOSURE_STEPS.length,
        activeCollection: null
    }),
    getters: {
        getCurrentStepInCollectionClosureProcess: state => state.currentStepInCollectionClosureProcess,
        getStepsInCollectionClosureProcess: state => state.stepsInCollectionClosureProcess,
        getActiveCollectionTypeCode: state => state.activeCollectionTypeCode,
        getActiveCollectionYear: state => state.activeCollectionYear,
        getTotalStepsInCollectionClosure: state => state.totalStepsInCollectionClosure,
    },
    actions: {
        setActiveCollection(collection){
            this.activeCollection = collection;
        },
        setStepsInCollectionClosureProcess(stepsInCollectionClosureProcess) {
            this.stepsInCollectionClosureProcess = stepsInCollectionClosureProcess;
        },
        setCurrentStepInCollectionClosureProcess(currentStepInCollectionClosureProcess) {
            this.currentStepInCollectionClosureProcess = currentStepInCollectionClosureProcess;
        },
        setActiveCollectionTypeCode(currentCollectionTypeCode) {
            this.activeCollectionTypeCode = currentCollectionTypeCode;
        },
        setActiveCollectionYear(year){
            this.activeCollectionYear = year;
        },
        async getActiveCollection() {
            if(this.activeCollection == null) {
                const response = await ApiService.apiAxios.get(`${Routes.sdc.ACTIVE_COLLECTION}`)
                this.setActiveCollection(response.data);
                this.setActiveCollectionTypeCode(capitalize(response.data.collectionTypeCode));
                this.setActiveCollectionYear(response.data.openDate.slice(0, 4));
            }
        },
    }
});
