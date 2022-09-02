'use strict';
const { LocalDate, DateTimeFormatter } = require('@js-joda/core');

function generateSchoolObject(school) {
  return {
    schoolID: school.schoolId,
    mincode: school.mincode,
    schoolName: school.displayName,
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

module.exports = {
  generateSchoolObject: generateSchoolObject,
  isSchoolActive
};
