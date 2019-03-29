const credentials = require('../credentials');
var oracledb = require("oracledb");

const authentication = async (req, res, next) => {
  try {
    const connection = await oracledb.getConnection(credentials);
    req.connection = connection;
    next();
  } catch (e) {
    console.log(e)
    res.send({ error: e })
  }
}

module.exports = authentication;
