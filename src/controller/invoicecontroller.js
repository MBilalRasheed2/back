var config = require("../dbConfig");
const sql = require("mssql");
async function makeInvoice(req, res) {
  try {
    const { invoiceType } = req.body;
    let table;
    if (invoiceType) {
      const {
        ledgerInt,
        items,
        invoiceId,
        contact,
        date,
        party,
        ledgerId,
        gross,
        freight,
        tax,
        discount,
        other,
        grand,
        vNo,
        afterDiscount,
        terms,
        shipping,
        validity,
        payment,
        currency,
        location,
        costCenter,
        pId,
        cvId,
      } = req.body;
      table = returnTableAndId(invoiceType).table;

      if (table) {
        let pool = await sql.connect(config);
        let products = await pool
          .request()
          .query(
            `insert into ${table} (
              invoiceId,
              invoiceType,
              contact,
              date,
              party,
              ledgerId,
              gross,
              freight,
              tax,
              discount,
              other,
              grand,
              vNo,
              afterDiscount,
              terms,
              shipping,
              validity,
              payment,
              currency,
              location,
              costCenter,
              pId,
              cvId
            ) values(
            '${invoiceId}',
            '${invoiceType}',
            '${contact}',
            '${date}',
            '${party}',
            '${ledgerId}',
            '${gross}',
            '${freight}',
            '${tax}',
            '${discount}',
            '${other}',
            '${grand}',
            '${vNo}',
            '${afterDiscount}',
            '${terms}',
            '${shipping}',
            '${validity}',
            '${payment}',
            '${currency}',
            '${location}',
            '${costCenter}',
            '${pId}',
            '${cvId}'
            )`
          )
          .then(() => {
            let ItemsTable = table + "Items";

            if (items && items.length > 0) {
              items.map(async (item, index) => {
                await pool.request().query(
                  `insert into ${ItemsTable}
                  (invoice_id,item_id,quantity,rate,total,vSr,discount) 
                  values('${invoiceId}',
                    '${item.id}','${item.quantity}','${item.rate}','${
                    item.total
                  }','${index + 1}','${item.discount}')`
                );
              });
            }
          })
          .then(() => {
            if (ledgerInt) {
              addLedger(req.body);
            }
          });

        return res.send(products.recordsets[0]);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
function returnTableAndId(invoiceType) {
  let table, iType, secondTable, next;
  if (invoiceType === "Sell") {
    next = "SaleReturn";
    iType = "si";
    table = "SaleInvoice";
    secondTable = "DC";
  } else if (invoiceType === "Purchase") {
    iType = "pu";
    table = "Pur";
    secondTable = "GRN";
    next = "PReturn";
  } else if (invoiceType === "Sell Return") {
    iType = "sr";
    table = "SaleReturn";
    secondTable = "SaleInvoice";
  } else if (invoiceType === "Purchase Return") {
    iType = "pr";
    table = "PReturn";
    secondTable = "Pur";
  } else if (invoiceType === "Good Receipt Note") {
    next = "pur";
    iType = "gr";
    table = "GRN";
    secondTable = "purchaseOrder";
  } else if (invoiceType === "Delivery Challan") {
    next = "SaleInvoice";
    iType = "dc";
    table = "DC";
    secondTable = "ClientOrder";
  } else if (invoiceType === "Purchase Order") {
    next = "GRN";
    iType = "po";
    table = "purchaseOrder";
  } else if (invoiceType === "Client Order") {
    iType = "co";
    table = "ClientOrder";
    next = "DC";
    secondTable = "Offer";
  } else if (invoiceType === "Quotation") {
    next = "ClientOrder";
    iType = "qo";
    table = "Offer";
  } else if (invoiceType === "Cash Receipt") {
    table = "CashReceiptVoucher";
    iType = "cr";
  } else if (invoiceType === "Bank Receipt") {
    table = "BankReceiptVoucher";
    iType = "br";
  } else if (invoiceType === "Cash Payment") {
    table = "CashPaymentVoucher";
    iType = "cp";
  } else if (invoiceType === "Bank Payment") {
    table = "BankPaymentVoucher";
    iType = "bp";
  } else if (invoiceType === "Journal Voucher") {
    table = "JVVoucher";
    iType = "jv";
  }

  return { table, iType, secondTable, next };
}
async function updatePreviusPendingVoucher(items, cvId, type) {
  let secondTable = returnTableAndId(type).secondTable;
  if (secondTable) {
    let pool = await sql.connect(config);
    let previusItemRef = await pool
      .request()
      .query(
        `Select * from ${
          secondTable + "ItemsPending"
        } where invoice_id='${cvId}'`
      );
    let previusItem = previusItemRef.recordsets[0];

    previusItem.map(async (item, index) => {
      const check = items.find((f) => f.id === item.item_id);
      if (check) {
        let issued = item.issued + check.quantity;
        await pool
          .request()
          .query(
            `update ${
              secondTable + "ItemsPending"
            } set issued ='${issued}' where invoice_id='${cvId}' and vSr='${
              index + 1
            }'`
          );
      }
    });
  }
}
async function makeInvoiceNewId(req, res) {
  const { month, year, invoiceType, location } = req.body;
  console.log({ month, year, invoiceType, location });
  let table, iType;
  table = returnTableAndId(invoiceType).table;
  iType = returnTableAndId(invoiceType).iType;

  let pool = await sql.connect(config);

  let query = `Select max(vno) as vNo from ${table} 
  where Month(Date)='${month}' and Year(Date)='${year}' and location='${location}'`;

  if (month && year && invoiceType && location) {
    await pool
      .request()
      .query(query)
      .then((maxIdRef) => {
        maxIdRef = maxIdRef.recordset[0];

        if (maxIdRef && maxIdRef.vNo) {
          maxIdRef = maxIdRef.vNo;
        } else {
          maxIdRef = 0;
        }
        console.log({ maxIdRef });
        return res.send({ iType, vNo: maxIdRef });
      });
  }
}
async function getInvoices(req, res) {
  const { type } = req.body;
  let table = returnTableAndId(type).table;
  let pool = await sql.connect(config);
  let query = `select ${
    table + ".*"
  } ,level3.title as party from ${table} inner join level3 on ${
    table + ".ledgerId"
  } =level3.ID`;

  let invoicesRef = await pool.request().query(query);
  let invoices = invoicesRef.recordsets[0];
  return res.send(invoices);
}
async function getSingleInvoice(req, res) {
  const { type, id } = req.body;
  console.log({ type, id });
  let table = returnTableAndId(type).table;
  let pool = await sql.connect(config);
  let invoicesRef = await pool
    .request()
    .query(`Select * from ${table} where invoiceId='${id}'`);
  let itemsRef = await pool
    .request()
    .query(`Select * from ${table + "Items"} where invoice_Id='${id}'`);
  let invoices = invoicesRef.recordsets[0];
  let items = itemsRef.recordsets[0];
  let data = { ...invoices[0], items: items };
  return res.send(data);
}
async function getInvoiceItems(req, res) {
  const { type, id } = req.body;

  let table = returnTableAndId(type).table;
  table = table + "Items";
  let pool = await sql.connect(config);
  let invoicesRef = await pool.request().query(`
    Select ${table + ".*"}  ,Items.name as name from 
${table} inner join Items on  Items.id=${
    table + ".item_id"
  } where invoice_id='${id}' 
     `);
  let invoices = invoicesRef.recordsets[0];
  return res.send(invoices);
}
async function getPendingInvoice(req, res) {
  const { type } = req.body;
  let table = returnTableAndId(type).table;

  let pool = await sql.connect(config);
  let getPendingInvoicesRef = await pool.request().query(`select ${
    table + "ItemsPending.*"
  } ,${table + ".party"} as party,${table + ".ledgerId"} ,
  ${table + ".date"}  from ${table + "ItemsPending"} inner join ${table} on
  ${table + "ItemsPending.invoice_id"}=${
    table + ".invoiceId "
  }and (quantity-issued>0) 
 
    `);
  let invoices = getPendingInvoicesRef.recordsets[0];

  return res.send(invoices);
}
async function nextVoucherRef(req, res) {
  const { type, id } = req.body;
  let table = returnTableAndId(type).next;

  let pool = await sql.connect(config);
  let invoicesRef = await pool
    .request()
    .query(`select invoiceId from ${table} where cvId='${id}'`);
  let invoices = invoicesRef.recordsets[0];

  return res.send(invoices);
}
async function prevVoucherRef(req, res) {
  const { type, id } = req.body;
  let table = returnTableAndId(type).secondTable;
  let pool = await sql.connect(config);
  let invoicesRef = await pool
    .request()
    .query(`select * from ${table} where invoiceId='${id}'`);
  let itemsRef = await pool
    .request()
    .query(`select * from ${table + "itemspending"} where invoice_Id='${id}'`);
  let invoices = invoicesRef.recordsets[0][0];
  let items = itemsRef.recordset[0];

  if (items && items.length > 0) {
    items.map((item, index) => {
      items[index] = {
        ...item,
        id: item.item_id,
        quantity: item.quantity - item.issued,
      };
    });
  }

  return res.send({ ...invoices, items: items });
}
async function editInvoice(req, res) {
  try {
    const { invoiceType } = req.body;
    console.log({ invoiceType: req.body });
    let table;
    if (invoiceType) {
      const {
        items,
        invoiceId,
        contact,
        date,
        party,
        ledgerId,
        gross,
        freight,
        tax,
        discount,
        other,
        grand,
        vNo,
        afterDiscount,
        terms,
        shipping,
        validity,
        payment,
        currency,
        location,
        costCenter,
        pId,
        cvId,
      } = req.body;
      table = returnTableAndId(invoiceType).table;

      if (table) {
        let pool = await sql.connect(config);
        let products = await pool
          .request()
          .query(
            `update ${table} set
              invoiceId='${invoiceId}',
              invoiceType='${invoiceType}',
              contact='${contact}',
              date='${date}',
              party='${party}',
              ledgerId='${ledgerId}',
              gross='${gross}',
              freight=${freight},
              tax=${tax},
              discount=${discount},
              other=${other},
              grand=${grand},
              vNo=${vNo},
              afterDiscount=${afterDiscount},
              terms=${terms === null ? null : `'${terms}'`},
              shipping=${shipping === null ? null : `'${shipping}'`},
              validity=${validity === null ? null : `'${validity}'`},
              payment=${payment === null ? null : `'${payment}'`},
              currency=${currency === null ? null : `'${currency}'`}, 
              location='${location}',
              costCenter='${costCenter}',
              pId='${pId}',
              cvId='${cvId}'
            `
          )
          .then(() => {
            let ItemsTable = table + "Items";

            if (items && items.length > 0) {
              items.map(async (item, index) => {
                await pool.request().query(
                  `update ${ItemsTable} set invoice_Id='${invoiceId}',
                    item_id='${item.id}',name='${item.name}',quantity='${
                    item.quantity
                  }',rate='${item.rate}',total='${item.total}',vSr='${
                    index + 1
                  }',discount='${item.discount}'
                  `
                );
                await pool.request().query(
                  `update ${
                    ItemsTable + "Pending"
                  } set invoice_Id='${invoiceId}',
                    item_id='${item.id}',name='${item.name}',quantity='${
                    item.quantity
                  }',issued=0,rate='${item.rate}',total='${item.total}',vSr='${
                    index + 1
                  }',discount='${item.discount}'
                  `
                );
              });
            }
          });
        return res.send(products.recordsets[0]);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function invoiceOperation(req, res) {
  try {
    const { id, type, value, operation, reason } = req.body;
    let table = returnTableAndId(type).table;

    let pool = await sql.connect(config);
    let newReason, CancellDate;
    if (id && type) {
      if (parseInt(value) === 0) {
        newReason = null;
        CancellDate = null;
      } else {
        newReason = reason;
        CancellDate = new Date().toLocaleString().split(",")[0];
        console.log({ CancellDate });
      }

      let query = `update  ${table} set ${operation} =${value}, cancelReason=${
        newReason === null ? null : `'${newReason}'`
      }, CancellDate=${CancellDate} where invoiceId='${id}'`;

      let invoicesRef = await pool.request().query(query);

      return res.send(invoicesRef);
    }
  } catch (err) {
    console.log({ err });
  }
}
async function invoiceDelete(req, res) {
  try {
    const { id, type } = req.body;
    let table = returnTableAndId(type).table;
    let secondTable = returnTableAndId(type).next;

    let pool = await sql.connect(config);
    if (id && type) {
      const queryRef = pool.request();
      let invoicesRef = await queryRef
        .query(`delete from ${table + "ItemsPending"} where invoice_id='${id}'`)
        .then(() => {
          queryRef
            .query(`delete from ${table + "Items"} where invoice_id='${id}'`)
            .then(() => {
              queryRef.query(`delete from ${table} where invoiceId='${id}'`);
            });
        });
      return res.send(invoicesRef);
    }
  } catch (err) {
    console.log({ err });
  }
}

async function addLedger(data) {
  console.log({ data });
  let debitAmount, creditAmount;
  if (data.invoiceType === "Sell" || data.invoiceType === "Purchase Return") {
    debitAmount = data.grand ? data.grand : 0;
    creditAmount = 0;
  } else if (
    data.invoiceType === "Purchase" ||
    data.invoiceType === "Sell Return"
  ) {
    debitAmount = 0;
    creditAmount = data.grand ? data.grand : 0;
  }
  let pool = await sql.connect(config);
  console.log({ debitAmount, creditAmount });
  if (debitAmount || creditAmount) {
    let send = await pool
      .request()
      .query(
        `
  insert into ledger (id,date,accCredit,accDebit,narration,ledgerId)
   values('${data.invoiceId}','${data.date}','${creditAmount}','${debitAmount}','','${data.ledgerId}')
  `
      )
      .then(() => {
        console.log({ ok: "ok" });
      });
  }
}
module.exports = {
  makeInvoice: makeInvoice,
  makeInvoiceNewId: makeInvoiceNewId,
  getInvoices: getInvoices,
  getInvoiceItems: getInvoiceItems,
  getPendingInvoice: getPendingInvoice,
  nextVoucherRef: nextVoucherRef,
  prevVoucherRef: prevVoucherRef,
  editInvoice: editInvoice,
  invoiceOperation: invoiceOperation,
  invoiceDelete: invoiceDelete,
  getSingleInvoice: getSingleInvoice,
  returnTableAndId: returnTableAndId,
};
