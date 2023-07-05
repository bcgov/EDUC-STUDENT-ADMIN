
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

export function insertMacro(macroText, message, input) {
  if(message){
    if(input){
      let cursorLocation = input.selectionEnd;
      message = message.substring(0, cursorLocation) + macroText + message.substring(cursorLocation);
    }else{
      message = message + ' ' + macroText;
    }
  } else {
    message = macroText;
  }
  return message;
}
