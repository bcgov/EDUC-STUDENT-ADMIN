'use strict';

const {LocalDate, DateTimeFormatter} = require('@js-joda/core');

function generateDistrictObject(district) {
  return {
    districtId: district.districtId,
    districtNumber: district.districtNumber,
    name: district.displayName,
    districtRegionCode: district.districtRegionCode,
    districtStatusCode: district.districtStatusCode,
    phoneNumber: district.phoneNumber,
  };
}

function isDistrictActive(district) {
  return (district?.districtStatusCode?.toUpperCase() === 'ACTIVE');
}

function generateAuthorityObject(authority) {
  return {
    authorityID: authority.independentAuthorityId,
    authorityNumber: authority.authorityNumber,
    name: authority.displayName,
    openedDate: authority.openedDate,
    closedDate: authority.closedDate,
    authorityTypeCode: authority.authorityTypeCode
  };
}

function isAuthorityActive(authority) {
  const currentTime = LocalDate.now();
  const openedDate = authority?.openedDate;
  const closedDate = authority?.closedDate;
  return !(!authority || !authority.name || !openedDate || currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || (closedDate && currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
}

function generateSchoolObject(school) {
  return {
    schoolID: school.schoolId,
    mincode: school.mincode,
    schoolName: school.displayName,
    schoolCategoryCode: school.schoolCategoryCode,
    facilityTypeCode: school.facilityTypeCode,
    openedDate: school.openedDate,
    closedDate: school.closedDate,
    districtID: school.districtId,
    authorityID: school.independentAuthorityId,
    schoolNumber: school.schoolNumber,
    phoneNumber: school.phoneNumber,
    facilityTypeCode: school.facilityTypeCode,
    email: school.email,
    schoolReportingRequirementCode: school.schoolReportingRequirementCode
  };
}

function isSchoolActive(school) {
  const currentTime = LocalDate.now();
  const openedDate = school?.openedDate;
  const closedDate = school?.closedDate;
  return !(!school || !school.schoolName || !openedDate || currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || (closedDate && (currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || currentTime.isEqual(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)))));
}

/**
 * Returns true if the school/authority status is never opened or is closed.
 * @param schoolOrAuthority
 * @returns boolean
 */
function isSchoolOrAuthorityClosedOrNeverOpened(schoolOrAuthority) {
  const currentTime = LocalDate.now();
  const openedDate = schoolOrAuthority?.openedDate;
  const closedDate = schoolOrAuthority?.closedDate;

  if (!openedDate) {
    //never opened
    return true;
  } else if (closedDate && (currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || currentTime.isEqual(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)))) {
    //closed
    return true;
  } else {
    return false;
  }
}

function isSchoolCategoryActive(schoolCategory){
  const currentTime = LocalDate.now();
  const openedDate = schoolCategory?.effectiveDate;
  const closedDate = schoolCategory?.expiryDate;
  return !(!schoolCategory || !schoolCategory.schoolName || !openedDate || currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || (closedDate && currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
}

// The logic to identify each data as an active record based on effective and expiry date.
function isActiveRecord(record) {
  const currentTime = LocalDate.now();
  const openedDate = record?.effectiveDate;
  const closedDate = record?.expiryDate;
  return !(!record || !openedDate || currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || (closedDate && currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
}

module.exports = {
  generateDistrictObject,
  generateSchoolObject,
  generateAuthorityObject,
  isSchoolActive,
  isDistrictActive,
  isAuthorityActive,
  isSchoolCategoryActive,
  isActiveRecord,
  isSchoolOrAuthorityClosedOrNeverOpened
};
