import {formatMinCode, formatPen, formatDob, formatPostalCode} from '../format';

export function formatPrbStudent(student) {
  student.minCode && (student.minCode = formatMinCode(student.minCode));  
  student.bestMatchPEN && (student.bestMatchPEN = formatPen(student.bestMatchPEN));
  student.submittedPen && (student.submittedPen = formatPen(student.submittedPen));
  student.assignedPEN && (student.assignedPEN = formatPen(student.assignedPEN));
  student.dob && (student.dob = formatDob(student.dob));
  student.postalCode && (student.postalCode = formatPostalCode(student.postalCode));
  student.infoRequest = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  return student;
}

export function formatPrbStudents(students) {
  students.forEach(student => {
    formatPrbStudent(student);
  });
  return students;
}

