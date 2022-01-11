var config = require("../dbConfig");
const sql = require("mssql");
async function getCategories(req, res) {
  try {
    const { option } = req.params;
    let table;
    if (option) {
      if (option === "category") {
        table = "categoryTable";
      } else {
        table = "typeTable";
      }
      let pool = await sql.connect(config);
      let products = await pool.request().query(`SELECT * from ${table}`);
      return res.send(products.recordsets[0]);
    }
  } catch (error) {
    console.log(error);
  }
}
async function insertCategories(req, res) {
  try {
    const { option } = req.params;
    let table;
    if (option) {
      if (option === "category") {
        console.log("category");
        table = "categoryTable";
      } else {
        table = "typeTable";
      }
    }
    const id = req.body.id;
    const title = req.body.title;
    let pool = await sql.connect(config);
    let maxRef = await pool
      .request()
      .query(`select max(id) as Id from ${table}`);
    let max = maxRef.recordset[0].Id;
    let parseMax = parseInt(max);
    let increament = parseMax + 1;
    if (increament.toString().length === 1) {
      increament = `00${increament}`;
    }
    if (increament.toString().length === 2) {
      increament = `0${increament}`;
    }
    if (increament.toString().length === 3) {
      increament = `${increament}`;
    }

    let products = await pool
      .request()
      .query(`insert into ${table} values('${increament}','${title}')`)
      .then(() => {
        return res.send({ category: { Id: increament, Title: title } });
      });
  } catch (error) {
    console.log(error);
  }
}
async function deleteCategories(req, res) {
  try {
    const id = req.body.id;
    const { option } = req.params;
    console.log({id})
    let table;
    if (option) {
      if (option === "category") {
        console.log("category");
        table = "categoryTable";
      } else {
        table = "typeTable";
      }
    }
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
async function updateCategories(req, res) {
  try {
    let id = req.body.id;
    let title = req.body.title;
    const { option } = req.params;
    let table;
    if (option) {
      if (option === "category") {
        console.log("category");
        table = "categoryTable";
      } else {
        table = "typeTable";
      }
    }
    console.log({ id, title });
    let pool = await sql.connect(config);
    let products = await pool
      .request()
      .query(`update ${table} set Title='${title}' where Id='${id}'`);
  
  
    return res.send(products);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getCategories: getCategories,
  insertCategories: insertCategories,
  deleteCategories: deleteCategories,
  updateCategories: updateCategories,
};
