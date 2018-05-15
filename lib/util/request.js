function fixBody(body){
  if(typeof(body) === 'string')
    body = JSON.parse(body);
  return body;
}

module.exports = {
  fixBody: fixBody
}
