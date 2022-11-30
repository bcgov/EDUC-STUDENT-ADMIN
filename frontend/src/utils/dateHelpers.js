import {LocalDate} from '@js-joda/core';

export function findUpcomingDate(month, day) {
  let currentDate = LocalDate.now();
  let defaultUpcomingDate = new LocalDate(currentDate.year(), month, day);
  defaultUpcomingDate = defaultUpcomingDate.isBefore(currentDate) ? defaultUpcomingDate.plusYears(1) : defaultUpcomingDate;
  return defaultUpcomingDate;
}
