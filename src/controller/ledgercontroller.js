var config = require("../dbConfig");
const sql = require("mssql");

async function makeLedger(req, res) {
  try {
    const { id, start, end, loc } = req.body;

    let search;
    if (loc === "null") {
      search = "";
    } else {
      search = loc;
    }
    console.log({ search });
    let pool = await sql.connect(config);
    let request = await pool.request().query(`
      select * from f_GeneralLedger('${id}','${start}','${end}','${search}') where LedgerID!=''
      `);
    let opBalance = await pool.request().query(`
    select SUM(Balance) as balance from f_OpeningBalances('${id}','${search}') 
      `);

    return res.send({
      ledger: request.recordsets[0],
      opBalance: opBalance.recordset[0].balance,
    });
  } catch (error) {
    console.log(error);
  }
}
async function makeTrialBalance(req, res) {
  try {
    const { id, start, end, location } = req.body;
    console.log({ id, start, end });
    let loc;
    let pool = await sql.connect(config);
    if (location) {
      loc = location;
    } else {
      loc = "";
    }
    let request = await pool.request().query(`
    select LedgerID, max(Party) Party, sum(Credit) Credit, Sum(Debit) Debit, (select SUM(Balance)  from f_OpeningBalances('','') 
where f_OpeningBalances.LedgerID=f_GeneralLedger.LedgerID ) as Balance 
from f_GeneralLedger('','${start}','${end}','${loc}') where Credit>0 or Debit>0 and LedgerID<>''
Group By LedgerID
   
      `);
    return res.send(request.recordsets[0]);
  } catch (error) {
    console.log(error);
  }
}
async function makeReceiptDetails(req, res) {
  try {
    const { docId, start, end, listName } = req.body;
    console.log({ docId, start, end });
    let pool = await sql.connect(config);
    let request = await pool.request().query(`
    select * from f_receiptdetails('${
      docId ? docId : ""
    }','${start}','${end}','${listName ? listName : ""}')
      `);
    return res.send(request.recordsets[0]);
  } catch (error) {
    console.log(error);
  }
}
async function makePaymentDetails(req, res) {
  try {
    const { docId, start, end, listName } = req.body;
    console.log({ docId, start, end });
    let pool = await sql.connect(config);
    let request = await pool.request().query(`
    select * from f_paymentdetails('${
      docId ? docId : ""
    }','${start}','${end}','${listName ? listName : ""}')
      `);
    return res.send(request.recordsets[0]);
  } catch (error) {
    console.log(error);
  }
}
async function makePostDatedCheques(req, res) {
  try {
    const { start } = req.body;
    let pool = await sql.connect(config);
    let request = await pool.request().query(`
    select * from f_PostDatedChq('','${start}','')
      `);
    return res.send(request.recordsets[0]);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  makeLedger: makeLedger,
  makeTrialBalance: makeTrialBalance,
  makeReceiptDetails: makeReceiptDetails,
  makePaymentDetails: makePaymentDetails,
  makePostDatedCheques: makePostDatedCheques,
};
