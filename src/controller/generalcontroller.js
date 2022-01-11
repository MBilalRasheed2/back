var config = require("../dbConfig");
const sql = require("mssql");

async function getlocations(req, res) {
  const { month, year, invoiceType } = req.body;
  let table, iType;

  let pool = await sql.connect(config);
  let locations = await pool.request().query(`select Id as id ,title as title from Locations`);
  let def = await pool.request().query(`select * from currentlocation`);
  
  return res.send({locations:locations.recordsets[0],def:def.recordset[0].ID});
}
async function getdefaultLocation(req, res) {
  const { month, year, invoiceType } = req.body;
  let table, iType;

  let pool = await sql.connect(config);
 

  return res.send(locations.recordsets[0]);
}

module.exports = { getlocations: getlocations,getdefaultLocation:getdefaultLocation };
