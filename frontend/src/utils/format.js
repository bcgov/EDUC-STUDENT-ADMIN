import {LocalDate, DateTimeFormatterBuilder, ResolverStyle} from '@js-joda/core';

export function formatPen(pen) {
  return pen && (pen.substring(0, 3) + ' ' + pen.substring(3, 6) + ' ' + pen.substring(6)) || '';
}

function getDateFormatter(pattern) {
  return (new DateTimeFormatterBuilder)
    .appendPattern(pattern)
    .toFormatter(ResolverStyle.STRICT);
}

export function formatDateTime(datetime, from='uuuuMMdd', to='uuuu/MM/dd') {
  const fromFormatter = getDateFormatter(from);
  const toFormatter = getDateFormatter(to);
  let result = datetime;
  try {
    const date = LocalDate.parse(datetime, fromFormatter);
    result = date.format(toFormatter);
  } catch (err) {
    console.log(`${datetime}: ${from} to ${to}`);
    console.log(err);
  }
  return result;
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
