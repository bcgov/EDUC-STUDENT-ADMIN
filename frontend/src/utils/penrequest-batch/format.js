import {formatMinCode, formatPen, formatDob, formatPostalCode} from '../format';

export function formatPrbStudent(student) {
  student.mincode && (student.mincode = formatMinCode(student.mincode));
  student.bestMatchPEN && (student.bestMatchPEN = formatPen(student.bestMatchPEN));
  student.submittedPen && (student.submittedPen = formatPen(student.submittedPen));
  student.assignedPEN && (student.assignedPEN = formatPen(student.assignedPEN));
  student.dob && (student.dob = formatDob(student.dob));
  student.postalCode && (student.postalCode = formatPostalCode(student.postalCode));
  return student;
}

export function formatPrbStudents(students) {
  students.forEach(student => {
    formatPrbStudent(student);
  });
  return students;
}

