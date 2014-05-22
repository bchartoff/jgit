var base64 = exports;
 
base64.encode = function (unencoded) {
  return new Buffer(unencoded || '').toString('base64');
};
 
base64.decode = function (encoded) {
  return new Buffer(encoded || '', 'base64').toString('utf8');
};




// console.log(base64.decode("dGVzdA=="))