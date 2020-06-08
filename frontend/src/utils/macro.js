
export function replaceMacro(comment, macros) {
  if(comment && comment.includes('!')) {
    let macroText = comment.match(/![^!]?[^!]?[^!]?/g);
    comment = checkForMacro(comment, macroText, macros);
  }
  return comment;
}

function checkForMacro(comment, macroText, macros){
  macroText.forEach(text => {
    macros.forEach(element => {
      if (element['macroCode'] === text.substring(1)) {
        comment = comment.replace(text, element.macroText);
      }
    });
  });
  return comment;
}
