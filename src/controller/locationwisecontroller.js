var config = require("../dbConfig");
const sql = require("mssql");

async function locationWiseBalances(req, res) {
  let pool = await sql.connect(config);
  let query = `
 
select Level3_LW.* ,level3.title ,level1.Atp from Level3_LW  inner join level3 on level3.ID=Level3_LW.ID inner join level1 on level1.id=level3.id1


`;
  let getStock = await pool.request().query(query);
  return res.send(getStock.recordsets[0]);
}

module.exports = {
  locationWiseBalances: locationWiseBalances,
};
