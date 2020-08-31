export function formatMinCode(minCode) {
  return minCode && (minCode.substring(0, 3) + ' ' + minCode.substring(3)) || '';
}

export function formatPen(pen) {
  return pen && (pen.substring(0, 3) + ' ' + pen.substring(3, 6) + ' ' + pen.substring(6)) || '';
}
