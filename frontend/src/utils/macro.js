
export function replaceMacro(comment, macros) {
  if(comment?.length > 1 && comment.includes('!')) {
    let macroText = comment.match(/![^!^ ]+ /g);
    if(macroText) {
      comment = checkForMacro(comment, macroText, macros);
    }
  }
  return comment;
}

function checkForMacro(comment, macroText, macros){
  macroText.forEach(text => {
    macros.forEach(element => {
      if (element['macroCode'] === text.substring(1).trim()) {
        comment = comment.replace(text, element.macroText);
      }
    });
  });
  return comment;
}
