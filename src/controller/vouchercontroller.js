var config = require("../dbConfig");
const sql = require("mssql");
const { returnTableAndId } = require("../controller/invoicecontroller");
async function makeVoucher(req, res) {
  try {
    let response;
    if (req.body) {
      const { jv, jvHeader, ledgerInt, totalJV } = req.body;
      const { jvType } = jvHeader;
      console.log({ jv, jvHeader, ledgerInt, totalJV });
      if (jvType) {
        if (jvType === "Bank Payment" || jvType === "Bank Receipt") {
          response = await makeBankVoucher(jv, jvHeader, ledgerInt, totalJV);
        } else if (jvType === "Cash Payment" || jvType === "Cash Receipt") {
          response = await makeCashVoucher(jv, jvHeader, ledgerInt, totalJV);
        } else if (jvType === "Journal Voucher") {
          response = await makeJvVoucher(jv, jvHeader, ledgerInt, totalJV);
        }
      }
    }
    if (response) {
      return res.send(response);
    }
  } catch (error) {
    console.log(error);
  }
}
async function editVoucher(req, res) {
  try {
    const { jv, jvHeader, ledgerInt, totalJV } = req.body;
    console.log({ jv, jvHeader, ledgerInt, totalJV });
    const { jvId, jvType } = jvHeader;
    let table;
    if (jvType) {
      table = returnTableAndId(jvType).table;
      if (table) {
        let pool = await sql.connect(config);
        let delQuery = `delete  from ${table + "acc"} where jvId='${jvId}'`;
        let delQuery2 = `delete  from ${table} where jvId='${jvId}'`;
        await pool
          .request()
          .query(delQuery)
          .then(async () => {
            await pool.request().query(delQuery2);
          })
          .then(async () => {
            let response;
            if (req.body) {
              const { jv, jvHeader, ledgerInt, totalJV } = req.body;
              const { jvType } = jvHeader;
              console.log({ jv, jvHeader, ledgerInt, totalJV });
              if (jvType) {
                if (jvType === "Bank Payment" || jvType === "Bank Receipt") {
                  response = await makeBankVoucher(
                    jv,
                    jvHeader,
                    ledgerInt,
                    totalJV
                  );
                } else if (
                  jvType === "Cash Payment" ||
                  jvType === "Cash Receipt"
                ) {
                  response = await makeCashVoucher(
                    jv,
                    jvHeader,
                    ledgerInt,
                    totalJV
                  );
                } else if (jvType === "Journal Voucher") {
                  response = await makeJvVoucher(
                    jv,
                    jvHeader,
                    ledgerInt,
                    totalJV
                  );
                }
              }
            }
            if (response) {
              return res.send(response);
            }
          });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
async function getVouchers(req, res) {
  const { type } = req.body;
  console.log({ type });
  let table = returnTableAndId(type).table;
  let pool = await sql.connect(config);
  let query = `select ${table + "acc.*"}  , ${table + ".date"}, ${
    table + ".location"
  } ,level3.title as party from ${table + "acc"} inner join  ${table}  on  ${
    table + "acc.jvId"
  } = ${table + ".jvId"} inner join level3 on ${
    table + "acc.ledgerId"
  }=level3.ID`;

  let voucherRef = await pool.request().query(query);
  let vouchers = voucherRef.recordsets[0];
  return res.send(vouchers);
}
async function getSingleVoucher(req, res) {
  const { type, vNo: id } = req.body;
  console.log({ type, id });
  let table = returnTableAndId(type).table;
  let pool = await sql.connect(config);
  let invoicesRef = await pool
    .request()
    .query(`Select * from ${table} where jvId='${id}'`);
  let accTable = table + "acc";
  let query = `select ${
    accTable + ".*"
  },level3.title as party  from  ${accTable}  

    inner join level3 on  ${accTable + ".ledgerId"}=level3.ID
    where ${accTable + ".jvId"} ='${id}' 
    `;
  let itemsRef = await pool.request().query(query);
  let invoices = invoicesRef.recordsets[0];
  let items = itemsRef.recordsets[0];
  const jvHead = { header: invoices[0], jVItems: items };

  return res.send(jvHead);
}

async function jvOperation(req, res) {
  try {
    const { id, type, value, operation, reason } = req.body;
    let table = returnTableAndId(type).table;
    console.log({ id, type, value, operation, reason });
    let pool = await sql.connect(config);
    let newReason, CancellDate;
    if (id && type) {
      if (parseInt(value) === 0 && !reason) {
        newReason = null;
        CancellDate = null;
      } else {
        newReason = reason;
        CancellDate = new Date().toLocaleString().split(",")[0];
        console.log({ CancellDate });
      }

      let query = `update  ${table} set ${operation} =${value}, 
      cancelReason=${
        newReason === null ? null : `'${newReason}'`
      }, CancellDate=${CancellDate} where jvId='${id}'`;

    
      let voucherRef = await pool.request().query(query);

      return res.send(voucherRef);
    }
  } catch (err) {
    console.log({ err });
  }
}
async function addLedger(data, id, date) {
  let pool = await sql.connect(config);

  data.map(async (d) => {
    let send = await pool
      .request()
      .query(
        `
    insert into ledger (id,date,accCredit,accDebit,narration,ledgerId)
     values('${id}','${date}','${d.accCredit}','${d.accDebit}','${d.lineNarration}','${d.ledgerId}')
    `
      )
      .then(() => {
        console.log({ ok: "ok" });
      });
  });
}
const makeCashVoucher = async (jv, jvHeader, ledgerInt, totalJV) => {
  const { jvId, jvType, vNo, date, location, hAccountID, total } = jvHeader;
  console.log({ jv, jvHeader, ledgerInt, totalJV });
  let table;
  if (jvType) {
    table = returnTableAndId(jvType).table;
    if (table) {
      let pool = await sql.connect(config);
      let query;

      query = `insert into ${table} (jvId,date,jvType,vNo,location,ledgerId,total)
          values('${jvId}','${date}','${jvType}','${vNo}','${location}','${hAccountID}','${total}')`;

      let products = await pool
        .request()
        .query(query)
        .then(() => {
          let ItemsTable = table + "ACC";
          if (jv && jv.length > 0) {
            jv.map(async (item, index) => {
              let query2 = `insert into ${ItemsTable} 
              (jvId,no,voucherAdj,total,lineNarration,ledgerId) values(
                '${jvId}',${index + 1},'${null}',${item.total},'${
                item.lineNarration
              }','${item.ledgerId}')`;

              console.log({ query2 });
              await pool.request().query(query2);
            });
          }
        })
        .then(() => {
          if (ledgerInt) {
            addLedger(jv, jvId, date);
          }
        });
      return products.recordsets[0];
    }
  }
};
const makeBankVoucher = async (jv, jvHeader, ledgerInt, totalJV) => {
  const {
    jvId,
    jvType,
    vNo,
    date,
    location,
    chequeDate,
    chequeRef,
    hAccountID,
  } = jvHeader;
  let table;
  if (jvType) {
    table = returnTableAndId(jvType).table;
    if (table) {
      let pool = await sql.connect(config);
      let query;
      let amount, tax;
      if (totalJV.amount) {
        amount = totalJV.amount;
        tax = totalJV.tax;
      }
      if (chequeDate && chequeRef && hAccountID && amount && tax) {
        query = `insert into ${table} (jvId,date,jvType,vNo,location,checkNo,checkDate,ledgerId,tax,total)
          values('${jvId}','${date}','${jvType}','${vNo}','${location}','${chequeRef}','${chequeDate}','${hAccountID}','${tax}','${amount}')`;
      }
      let products = await pool
        .request()
        .query(query)
        .then(() => {
          let ItemsTable = table + "ACC";
          if (jv && jv.length > 0) {
            jv.map(async (item, index) => {
              let query2;
              if (item.checkNo && item.checkDate) {
                query2 = `insert into ${ItemsTable} 
                  (jvId,no,voucherAdj,checkNo,checkDate,total,tax,lineNarration,ledgerId) values('${jvId}',
                      ${index + 1},'${null}','${item.checkNo}','${
                  item.checkDate
                }',${item.total},${item.tax},'${item.lineNarration}','${
                  item.ledgerId
                }')`;
              }
              console.log({ query2 });
              await pool.request().query(query2);
            });
          }
        })
        .then(() => {
          if (ledgerInt) {
            addLedger(jv, jvId, date);
          }
        });
      return products.recordsets[0];
    }
  }
};
const makeJvVoucher = async (jv, jvHeader, ledgerInt, totalJV) => {
  const { jvId, jvType, vNo, date, location } = jvHeader;

  let table;
  if (jvType) {
    table = returnTableAndId(jvType).table;
    if (table) {
      let pool = await sql.connect(config);
      let query;
      let amount, tax;
      if (totalJV.amount) {
        amount = totalJV.amount;
        tax = totalJV.tax;
      }

      query = `insert into ${table} (jvId,date,jvType,vNo,location)
         values('${jvId}','${date}','${jvType}','${vNo}','${location}')`;

      let products = await pool
        .request()
        .query(query)
        .then(() => {
          let ItemsTable = table + "ACC";
          if (jv && jv.length > 0) {
            jv.map(async (item, index) => {
              let debit = item.accDebit;
              let credit = item.accCredit;
              let query2;

              query2 = `insert into ${ItemsTable} values('${jvId}',
                  '${index + 1}','${null}','${debit}','${credit}','${
                item.lineNarration
              }','${item.ledgerId}')`;

              console.log({ query2 });
              await pool.request().query(query2);
            });
          }
        })
        .then(() => {
          if (ledgerInt) {
            addLedger(jv, jvId, date);
          }
        });
      return products.recordsets[0];
    }
  }
};
module.exports = {
  makeVoucher: makeVoucher,
  getVouchers: getVouchers,
  getSingleVoucher: getSingleVoucher,
  jvOperation: jvOperation,
  editVoucher: editVoucher,
};
