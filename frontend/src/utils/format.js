import {DateTimeFormatterBuilder, LocalDate, LocalDateTime, ResolverStyle} from '@js-joda/core';

export function formatPen(pen) {
  if(pen?.length === 9) {
    return pen && (pen.substring(0, 3) + ' ' + pen.substring(3, 6) + ' ' + pen.substring(6)) || '';
  }
  return pen;
}

export function getDateFormatter(pattern) {
  return (new DateTimeFormatterBuilder)
    .appendPattern(pattern)
    .toFormatter(ResolverStyle.STRICT);
}


export function formatDateTime(datetime, from='uuuuMMdd', to='uuuu/MM/dd', hasTimePart=false) {
  const fromFormatter = getDateFormatter(from);
  const toFormatter = getDateFormatter(to);
  let result = datetime;
  const localDateTime = hasTimePart ? LocalDateTime : LocalDate;
  if (datetime && datetime.length > 0) {
    try {
      const date = localDateTime.parse(datetime, fromFormatter);
      result = date.format(toFormatter);
    } catch (err) {
      console.info(`could not parse date ${datetime}: ${from} to ${to} as date provided is invalid`);
    }
  }
  return result;
}

export function formatTableColumn(format, column) {
  return (format && column) ? format(column) : (column || ' ');
}

export function formatMincode(mincode) {
  return mincode;
}

export function formatDob(dob, from='uuuuMMdd', to='uuuu/MM/dd') {
  return formatDateTime(dob, from, to);
}

export function formatPostalCode(postalCode) {
  return postalCode;
}

const GRADE_CODE_MAP = Object.freeze(
  {
    K: 'KF',
    UE: 'EU',
    US: 'SU',
  }
);

export function formatGrade(grade) {
  return GRADE_CODE_MAP[grade] || grade.padStart(2, '0');
}

export function formatDistrictNumber(districtNumber) {
  return districtNumber.padStart(3, '0');
}

export function sortByNameValue(list, valueToSortBy){
  return list.sort(function(a, b) {
    if (a[valueToSortBy] > b[valueToSortBy]) {
      return 1;
    } else if (a[valueToSortBy] < b[valueToSortBy]) {
      return -1;
    }
    return 0;
  });
}

export function formatPhoneNumber(phoneNumber) {

  if (!phoneNumber) {
    return '';
  }

  if (phoneNumber?.length === 10) {
    return `${phoneNumber.substring(0,3)}-${phoneNumber.substring(3,6)}-${phoneNumber.substring(6)}`;
  }

  return 'Phone number format not recognized';
}

//used in institution schools/districts/authorities date formatting
export function formatDate(rawDate, from='uuuu-MM-dd\'T\'HH:mm:ss', to='uuuu/MM/dd'){
  return formatDateTime(rawDate,from, to);
}

export function formatDisplayDate(date) {
  if (!date) return null;
  const [year, month, day] = date.split('-');
  return `${year}/${month}/${day}`;
}

export function formatContactName(contact) {
  return contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.lastName;
}

export function formatVSelectOption({ title, value }) {
  return obj => {
    if (obj[title] === undefined || obj[value] === undefined) {
      console.warn('Undefined values in VSelectOption', obj);
      console.warn(`Make sure the ${title} and ${value} accessors exist`);
    }

    return { title: obj[title], value: obj[value] };
  };
}
