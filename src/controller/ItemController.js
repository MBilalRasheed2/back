var config = require("../dbConfig");
const sql = require("mssql");
async function getItems(req, res) {
  try {
    let table = "Items";
    let pool = await sql.connect(config);
    let products = await pool
      .request()
      .query(
        `SELECT Items.Id as id, Items.name,Items.uom,Items.purchaseRate,Items.openingStock, categoryTable.Title as category,typeTable.Title  as type FROM Items inner JOIN  categoryTable on categoryTable.Id=Items.category inner JOIN typeTable on  items.type=typetable.id`
      );
    return res.send(products.recordsets[0]);
  } catch (error) {
    console.log(error);
  }
}
async function insertItems(req, res) {
  try {
    let table = "Items";
    const {
      name,
      openingStock,
      serial,
      barcode,
      des,
      uom,
      subunit,
      packSize,
      purchaseRate,
      saleRate,
      minLevel,
      maxLevel,
      category,
      type,
    } = req.body;
    console.log({ body: req.body });
    let pool = await sql.connect(config);
    let maxRef = await pool
      .request()
      .query(
        `select count(id) as Id from ${table} where category='${category}' and type='${type}'`
      );
    let max = maxRef.recordset[0].Id;
    console.log({ max });
    let parseMax = parseInt(max);
    let increament = parseMax + 1;
    if (increament.toString().length === 1) {
      increament = `000${increament}`;
    }
    if (increament.toString().length === 2) {
      increament = `00${increament}`;
    }
    if (increament.toString().length === 3) {
      increament = `0${increament}`;
    }
    if (increament.toString().length === 4) {
      increament = `${increament}`;
    }
    increament = category + type + increament;
    let query = `insert into ${table}  (id,name,openingStock,serial,barcode,des,uom,subunit,packSize, purchaseRate,saleRate,minLevel,maxLevel,category,type)  values('${increament}','${name}', ${openingStock},'${serial}','${barcode}','${des}','${uom}', '${subunit}', ${packSize}, ${purchaseRate}, ${saleRate}, ${minLevel},${maxLevel}, '${category}','${type}')`;
    
    let products = await pool.request().query(query);
    return res.send({ p: products.recordsets });
  } catch (error) {
    console.log(error);
  }
}
async function deleteItems(req, res) {
  try {
    const id = req.body.id;
    let table = "Items";
    let pool = await sql.connect(config);
    let products = await pool
      .request()
      .query(`delete from ${table}  where Id='${id}'`);
    // console.log(products.recordsets); // return 12345
    // console.log(products.rowsAffected);
    return res.send(products);
  } catch (error) {
    console.log(error);
  }
}
async function updateItem(req, res) {
  try {
    let table = "Items";
    const { id, cat_id, type_id, title, uom } = req.body;
    let pool = await sql.connect(config);
    let products = await pool.request()
      .query(`update ${table} set Title='${title}',
       Cat_id='${cat_id}' Type_id='${type_id}' Uom='${uom}' where Id='${id}'`);
    console.log(products.recordsets); // return 12345
    console.log(products.rowsAffected);
    return res.send(products);
  } catch (error) {
    console.log(error);
  }
}
async function updateOpeningQuantity(req, res) {
  try {
    const { updateList } = req.body;
    console.log({ updateList });
    const pool = await sql.connect(config);
    if (updateList && updateList.length > 0) {
      updateList.map(async (item) => {
        console.log({id:item.id})
        await pool
          .request()
          .query(
            `update items set openingStock=${parseInt(item.openingStock)} where id='${item.id}'`
          );
      });
    }
  } catch (error) {
    console.log({ error });
  }
}
module.exports = {
  getItems: getItems,
  insertItems: insertItems,
  deleteItems: deleteItems,
  updateItem: updateItem,
  updateOpeningQuantity: updateOpeningQuantity,
};
