var config = require("../dbConfig");
const sql = require("mssql");

async function itemledgerhandler(req, res) {
  const { id, start, end, location } = req.body;

  let loc;
  if (location) {
    loc = location;
  } else {
    loc = "";
  }

  console.log("itemledgerhandler", { id, start, end, loc });
  if (
    id !== undefined &&
    start !== undefined &&
    end !== undefined &&
    loc !== undefined
  ) {
    let pool = await sql.connect(config);
    let query = `
    select * from f_ItemLedger('${id}','${start}','${end}','${loc}')
    `;
    let getitemledger = await pool.request().query(query);
    console.log({ getitemledger });
    return res.send(getitemledger.recordsets[0]);
  }
}
async function itemledgerwithavg(req, res) {
  const { id, start, end, location } = req.body;
 
  let loc;
  if (location) {
    loc = location;
  } else {
    loc = "";
  }
  console.log("itemledgerwithavg", { id, start, end, loc });
  if (
    id !== undefined &&
    start !== undefined &&
    end !== undefined &&
    loc !== undefined
  ) {
    let pool = await sql.connect(config);
    let query = `
  select * from f_ItemLedgerwithmyavg('${id}','${start}','${end}','${loc}')
  `;
    let getitemledger = await pool.request().query(query);
    console.log({ getitemledger });
    return res.send(getitemledger.recordsets[0]);
  }
}

module.exports = {
  itemledgerhandler: itemledgerhandler,
  itemledgerwithavg: itemledgerwithavg,
};
