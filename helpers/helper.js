var crypto = require("crypto"); //node js module for data encryption

var algorithm = 'AES-128-CBC-HMAC-SHA1',
    key = 'ziciGGle';

module.exports.encrypt = function(password) {
    var cipher = crypto.createCipher(algorithm, key)
    var crypted = cipher.update(password, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
};