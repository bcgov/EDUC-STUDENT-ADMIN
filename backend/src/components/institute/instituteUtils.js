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
    effectiveDate: authority.openedDate,
    expiryDate: authority.closedDate,
  };
}

function isAuthorityActive(authority) {
  const currentTime = LocalDate.now();
  const openedDate = authority?.effectiveDate;
  const closedDate = authority?.expiryDate;
  return !(!authority || !authority.name || !openedDate || currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || (closedDate && currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
}

function generateSchoolObject(school) {
  return {
    schoolID: school.schoolId,
    mincode: school.mincode,
    schoolName: school.displayName,
    schoolCategoryCode: school.schoolCategoryCode,
    effectiveDate: school.openedDate,
    expiryDate: school.closedDate,
  };
}

function isSchoolActive(school) {
  const currentTime = LocalDate.now();
  const openedDate = school?.effectiveDate;
  const closedDate = school?.expiryDate;
  return !(!school || !school.schoolName || !openedDate || currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || (closedDate && currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
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
  isActiveRecord
};
