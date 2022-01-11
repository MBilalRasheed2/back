var config = require("../dbConfig");
const sql = require("mssql");
async function getuserroutes(req, res) {
  try {
    let pool = await sql.connect(config);
    let routes = await pool.request().query(`select *  from routes`);
    let users = await pool.request().query(`select *  from users`);
    return res.send({ routes: routes.recordsets[0], user: users.recordset[0] });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getuserroutes: getuserroutes,
};
