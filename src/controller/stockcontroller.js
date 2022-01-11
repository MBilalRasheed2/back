var config = require("../dbConfig");
const sql = require("mssql");

async function stockReportStarting(req, res) {
  let pool = await sql.connect(config);
  const { location, start, end } = req.body;
  console.log({ location, start, end });
  let query;
  if (
    start !== undefined &&
    end !== undefined &&
    location !== undefined &&
    location !== ""
  ) {
    query = `select received as Received ,issued as Issued, id as ID ,name as Name ,op_qty as OP from f_StockReport('${start}','${end}','${location}') where Issued>0 or Received>0`;
  } else {
    if (start !== undefined && end !== undefined) {
      query = `select received as Received ,issued as Issued, id as ID ,name as Name ,op_qty as OP from f_StockReport_All_Location('${start}','${end}') where Issued>0 or Received>0`;
    }
  }
  if (query) {
    console.log({ query });
    await pool
      .request()
      .query(query)
      .then((getStock) => {
        let data = getStock.recordsets[0];

        return res.send(data);
      });
  }
}
async function stockReportStartingWithValue(req, res) {
  let pool = await sql.connect(config);
  const { location, start, end } = req.body;
  console.log({ location, start, end });
  let query;
  if (
    start !== undefined &&
    end !== undefined &&
    location !== undefined &&
    location !== ""
  ) {
    query = `select received as Received ,issued as Issued, id as ID ,name as Name ,op_qty as OP,rTotal,iTotal, openRate  from f_StockReport_withvalue('${start}','${end}','${location}') where Issued>0 or Received>0`;
  } else {
    if (start !== undefined && end !== undefined) {
      query = `select received as Received ,issued as Issued, id as ID ,name as Name ,op_qty as OP,rTotal,iTotal,openRate from f_StockReport_withvalue_All_Location('${start}','${end}') where Issued>0 or Received>0`;
    }
  }
  if (query) {
    console.log({ query });
    await pool
      .request()
      .query(query)
      .then((getStock) => {
        let data = getStock.recordsets[0];

        return res.send(data);
      });
  }
}

module.exports = {
  stockReportStarting: stockReportStarting,
  stockReportStartingWithValue: stockReportStartingWithValue,
};
