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
      if (from.includes('.SSS')) {
        const fallbackFrom = from.replace('.SSS', '');
        try {
          const fallbackFormatter = getDateFormatter(fallbackFrom);
          const date = localDateTime.parse(datetime, fallbackFormatter);
          result = date.format(toFormatter);
          return result;
        } catch (fallbackErr) {
          console.info(`could not parse date ${datetime}: ${from} to ${to} as date provided is invalid`);
        }
      } else {
        console.info(`could not parse date ${datetime}: ${from} to ${to} as date provided is invalid`);
      }
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

export function formatReportingDateTime(rawDate, from='uuuu-MM-dd\'T\'HH:mm:ss', to='uuuu/MM/dd HH:mm'){
  return formatDateTime(rawDate, from, to, true);
}

export function formatIsoDateTime(isoString, to='uuuu-MM-dd HH:mm:ss') {
  if (!isoString) return '-';

  const normalizedDate = isoString.split('.')[0];

  return formatDateTime(normalizedDate, 'uuuu-MM-dd\'T\'HH:mm:ss', to, true);
}

export function formatDisplayDate(date) {
  if (!date) return null;
  const [year, month, day] = date.split('-');
  return `${year}/${month}/${day}`;
}

export function formatContactName(contact) {
  return contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.lastName;
}

export function formatCollectionTypeCode(code) {
  let lowercaseCollectionType = code.toLowerCase();
  return lowercaseCollectionType.replace(lowercaseCollectionType[0], lowercaseCollectionType[0].toUpperCase());
}

export function displayName(first, middle, last) {
  let name = '';
  if (last) {
    name += last;
  }

  if (first && last) {
    name +=  `, ${first}` ;
  } else if (first) {
    name += first;
  }

  if ((first && middle) || (last && middle)) {
    name += ` (${middle})`;
  } else if (middle) {
    name += `(${middle})`;
  }

  return name;
}

// Format a date string to 'Month YYYY'
export function formatDateAsMonthYear(dateStr) {
  if (!dateStr) return '';
  // Accepts ISO date or 'yyyy-MM-dd' or 'yyyy-MM-ddTHH:mm:ss'
  let datePart = dateStr.split('T')[0];
  try {
    const [year, month, day] = datePart.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    return dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) {
    console.info(`could not parse date ${dateStr} as 'Month YYYY': ${e}`);
    return dateStr;
  }
}
