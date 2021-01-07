import {LocalDate, DateTimeFormatterBuilder, ResolverStyle} from '@js-joda/core';

export function formatMincode(mincode) {
  return mincode && (mincode.substring(0, 3) + ' ' + mincode.substring(3)) || '';
}

export function formatPen(pen) {
  return pen && (pen.substring(0, 3) + ' ' + pen.substring(3, 6) + ' ' + pen.substring(6)) || '';
}

function getDateFormatter(pattern) {
  return (new DateTimeFormatterBuilder)
    .appendPattern(pattern)
    .toFormatter(ResolverStyle.STRICT);
}

export function formatDob(dob, from='uuuuMMdd', to='uuuu/MM/dd') {
  const fromFormatter = getDateFormatter(from);
  const toFormatter = getDateFormatter(to);
  let result = dob;
  try {
    const date = LocalDate.parse(dob, fromFormatter);
    result = date.format(toFormatter);
  } catch (err) {
    console.log(err);
  }
  return result;
}

export function formatPostalCode(postalCode) {
  return postalCode?.replace(/.{3}$/, ' $&');
}
