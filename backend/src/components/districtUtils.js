'use strict';

function generateDistrictObject(district) {
  return {
    districtId: district.districtId,
    districtNumber: district.districtNumber,
    name: district.displayName,
    districtRegionCode: district.districtRegionCode,
    districtStatusCode: district.districtStatusCode
  };
}

function isDistrictActive(district) {
  return (district?.districtStatusCode?.toUpperCase() === 'ACTIVE');
}

module.exports = {
  generateDistrictObject,
  isDistrictActive
};
