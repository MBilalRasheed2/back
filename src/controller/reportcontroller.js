const config = require("../dbConfig");
const sql = require("mssql");
const { returnTableAndId } = require("./invoicecontroller");

async function saleReportPartyWise(req, res) {
  const { type } = req.body;
  const table = returnTableAndId(type).table;
  const pool = await sql.connect(config);

  let query = `select  
  ${table + ".gross"},
  ${table + ".tax"},
  ${table + ".discount"},
  ${table + ".grand"},
  ${table + ".other"},
  ${table + ".ledgerId"},
  ${table + ".date"},

    level3.title as party from ${table}   inner join level3 on  
    ${table + ".ledgerId"}=level3.ID`;
  await pool
    .request()
    .query(query)
    .then((result) => {
      return res.send(result.recordsets[0]);
    });
}

async function saleReportItemWise(req, res) {
  const pool = await sql.connect(config);
  const { type } = req.body;
  
  const table = returnTableAndId(type).table;
  
  let query = `select 
  ${table + "Items.invoice_id"},
  items.name,
  items.uom,
    categoryTable.Title as catTitle ,typeTable.Title as typeTitle , 
    ${table + "Items.quantity"},
    ${table + "Items.rate"},
    ${table + "Items.total"}
  from ${table + "Items"}  left join  Items on
  ${table + "Items.item_id"}=Items.id 
  left join  categoryTable on Items.category=categoryTable.Id 
   left join typeTable on Items.type=typeTable.Id`;
  
  await pool
    .request()
    .query(query)
    .then((result) => {
      
      return res.send(result.recordsets[0]);
    });
}
async function saleReportItemWisePartyWise(req, res) {
  const { type } = req.body;
  const table = returnTableAndId(type).table;
  const pool = await sql.connect(config);
  let itemsTable = table + "Items";
  let query = `select Items.id, Items.name, Items.uom,
   categoryTable.Title as catTitle ,typeTable.Title as typeTitle , 
 ${table + ".ledgerId"} as ledgerId, level3.title as Party,
   ${itemsTable + ".quantity"} ,  ${itemsTable + ".rate"},${
    itemsTable + ".total"
  }
    from ${itemsTable}  left join  Items on ${
    itemsTable + ".item_id"
  } =Items.id 
    left join ${table}  on ${table + ".invoiceId"} = ${
    itemsTable + ".invoice_id"
  }
    left join level3 on level3.ID=${table + ".ledgerId"}
    left join 
     categoryTable on Items.category=categoryTable.Id  
     left join typeTable on Items.type=typeTable.Id`;
  await pool
    .request()
    .query(query)
    .then((result) => {
      return res.send(result.recordsets[0]);
    });
}
async function saleReportInvoiceWise(req, res) {
  const pool = await sql.connect(config);
  const { type } = req.body;
  const table = returnTableAndId(type).table;
  let query = `select
  ${table + ".invoiceId"},
  ${table + ".gross"},
  ${table + ".tax"},
  ${table + ".discount"},
  ${table + ".grand"},
  ${table + ".other"},
  ${table + ".ledgerId"},
  ${table + ".date"},
  level3.title as party from ${table}  inner join level3 on ${
    table + ".ledgerId"
  }=level3.ID`;
  await pool
    .request()
    .query(query)
    .then((result) => {
      return res.send(result.recordsets[0]);
    });
}

module.exports = {
  saleReportItemWise: saleReportItemWise,
  saleReportItemWisePartyWise: saleReportItemWisePartyWise,
  saleReportPartyWise: saleReportPartyWise,
  saleReportInvoiceWise: saleReportInvoiceWise,
};
