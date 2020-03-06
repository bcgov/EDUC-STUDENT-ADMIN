/**
 * Converting bytes to human readable values (KB, MB, GB, TB, PB, EB, ZB, YB)
 * @param {*} bytes 
 * @param {*} decimals 
 */

export function humanFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get extension from file name
 * https://stackoverflow.com/a/12900504
 * ""                            -->   ""
 * "name"                        -->   ""
 * "name.txt"                    -->   "txt"
 * ".htpasswd"                   -->   ""
 * "name.with.many.dots.myext"   -->   "myext"
 * @param {*} fileName 
 */
export function getFileExtension(fileName) {
  return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2);
}
