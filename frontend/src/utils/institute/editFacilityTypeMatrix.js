const CATEGORY_FACILITY_TYPE_MATRIX = Object.freeze([
  {
    selectedSchoolCategory: ['PUBLIC', 'INDEPEND', 'OFFSHORE', 'INDP_FNS', 'FED_BAND', 'YUKON'],
    selectedFacilityType: ['STANDARD'],
    allowedFacilityTypes: ['STANDARD']
  },
  {
    selectedSchoolCategory: ['PUBLIC'],
    selectedFacilityType: ['CONT_ED'],
    allowedFacilityTypes: ['CONT_ED']
  },
  {
    selectedSchoolCategory: ['PUBLIC'],
    selectedFacilityType: ['DIST_LEARN'],
    allowedFacilityTypes: ['DIST_LEARN', 'DISTONLINE']
  },
  {
    selectedSchoolCategory: ['INDEPEND', 'YUKON'],
    selectedFacilityType: ['DIST_LEARN'],
    allowedFacilityTypes: ['DIST_LEARN']
  },
  {
    selectedSchoolCategory: ['PUBLIC'],
    selectedFacilityType: ['DISTONLINE'],
    allowedFacilityTypes: ['DIST_LEARN', 'DISTONLINE']
  },
  {
    selectedSchoolCategory: ['PUBLIC'],
    selectedFacilityType: ['ALT_PROGS'],
    allowedFacilityTypes: ['ALT_PROGS']
  },
  {
    selectedSchoolCategory: ['EAR_LEARN'],
    selectedFacilityType: ['STRONG_CEN', 'STRONG_OUT', 'JUSTB4PRO'],
    allowedFacilityTypes: ['STRONG_CEN' , 'STRONG_OUT', 'JUSTB4PRO']
  },
  {
    selectedSchoolCategory: ['PUBLIC'],
    selectedFacilityType: ['SHORT_PRP', 'LONG_PRP'],
    allowedFacilityTypes: ['SHORT_PRP', 'LONG_PRP']
  },
  {
    selectedSchoolCategory: ['PUBLIC', 'YUKON'],
    selectedFacilityType: ['SUMMER'],
    allowedFacilityTypes: ['SUMMER']
  },
  {
    selectedSchoolCategory: ['PUBLIC'],
    selectedFacilityType: ['YOUTH'],
    allowedFacilityTypes: ['YOUTH']
  },
  {
    selectedSchoolCategory: ['POST_SEC'],
    selectedFacilityType: ['POST_SEC'],
    allowedFacilityTypes: ['POST_SEC']
  },
]);

export const fetchAllowedFacilityTypes = (categoryCode, facilityType) => {
  let matchedRecord = CATEGORY_FACILITY_TYPE_MATRIX.find(val => val.selectedSchoolCategory.includes(categoryCode) && val.selectedFacilityType.includes(facilityType));
  return matchedRecord.allowedFacilityTypes;
};
