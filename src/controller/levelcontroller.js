var config = require("../dbConfig");
const sql = require("mssql");
async function getLevel1(req, res) {
  try {
    let table = "level1";
    let pool = await sql.connect(config);
    const products = await pool.request().query(
      `SELECT *
        FROM level1`
    );
    return res.send(products.recordsets[0]);
  } catch (error) {
    console.log(error);
  }
}
async function insertLevel1(req, res) {
  try {
    let table = "level1";

    const { level1Title, type } = req.body;

    let pool = await sql.connect(config);
    let maxRef = await pool
      .request()
      .query(`select max(id) as Id from ${table}`);
    let max = maxRef.recordset[0].Id;
    if (max === null) {
      max = 0;
    }
    let parseMax = parseInt(max);
    let increament = parseMax + 1;
    if (increament.toString().length === 1) {
      increament = `0${increament}`;
    }
    if (increament.toString().length === 2) {
      increament = `${increament}`;
    }

    await pool
      .request()
      .query(
        `insert into ${table} values('${increament}','${level1Title}','${type}')`
      )
      .then(() => {
        return res.send({ id: increament, title: level1Title, Atp: type });
      });
  } catch (error) {
    console.log(error);
  }
}

async function deleteLevel1(req, res) {
  try {
    const id = req.body.id;
    let table = "level1";
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
async function updateLevel1(req, res) {
  try {
    let table = "level1";
    const { id, title } = req.body;
    let pool = await sql.connect(config);
    let products = await pool
      .request()
      .query(`update ${table} set title='${title}' where id='${id}'`);
    console.log(products.recordsets); // return 12345

    console.log(products.rowsAffected);
    return res.send(products);
  } catch (error) {
    console.log(error);
  }
}
async function insertLevel2(req, res) {
  try {
    let table = "level2";
    const { title, parentId } = req.body;
    console.log({ title, parentId, bodt: req.body });
    let pool = await sql.connect(config);
    let maxRef = await pool
      .request()
      .query(`select max(id2) as Id from ${table} where id1='${parentId}'`);
    let max = maxRef.recordset[0].Id;
    if (max === null) {
      max = 0;
    }
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
      .query(
        `insert into level2 values('${parentId}','${increament}','${title}')`
      );
    return res.send({ p: products.recordsets });
  } catch (error) {
    console.log(error);
  }
}
async function getLevel2(req, res) {
  try {
    let pool = await sql.connect(config);
    const products = await pool.request().query(
      `SELECT *
        FROM level2`
    );
    return res.send(products.recordsets[0]);
  } catch (error) {
    console.log(error);
  }
}
async function deleteLevel2(req, res) {
  try {
    const id = req.body.id;
    let table = "level2";
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
async function updateLevel2(req, res) {
  try {
    let table = "level2";
    const { id, title } = req.body;
    let pool = await sql.connect(config);
    let products = await pool
      .request()
      .query(`update ${table} set title='${title}' where id='${id}'`);
    console.log(products.recordsets); // return 12345

    console.log(products.rowsAffected);
    return res.send(products);
  } catch (error) {
    console.log(error);
  }
}

async function insertLevel3(req, res) {
  try {
    let table = "level3";
    const { id1, id2, title } = req.body;
    console.log({ id1, id2, title });
    let pool = await sql.connect(config);
    let maxRef = await pool
      .request()
      .query(
        `select count(id) as Id from ${table} where id1='${id1}' and id2='${id2}'`
      );
    let max = maxRef.recordset[0].Id;
    console.log(max);
    if (max === null) {
      max = 0;
    }
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
    let id = `${id1}${id2}${increament}`;
    let products = await pool
      .request()
      .query(
        `insert into ${table} (id,id1,id2,title,credit,debit) values('${id}','${id1}','${id2}','${title}','0','0')`
      )
      .then(async () => {
        let insertLevel3_LW = `insert into Level3_LW (ID,Location_ID) select Td.ID ,
        T.ID  from Locations T , level3 Td  where Td.id='${id}'`;
        await pool.request().query(insertLevel3_LW);
      });
    return res.send({ id: id });
  } catch (error) {
    console.log(error);
  }
}
async function getLevel3(req, res) {
  try {
    let pool = await sql.connect(config);
    let products = await pool.request().query(
      `SELECT *
        FROM level3`
    );
    return res.send(products.recordsets[0]);
  } catch (error) {
    console.log(error);
  }
}
async function deleteLevel3(req, res) {
  try {
    const id = req.body.id;
    let table = "level3";
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
async function updateLevel3(req, res) {
  try {
    let table = "level3";
    const { id, title } = req.body;
    let pool = await sql.connect(config);
    let products = await pool
      .request()
      .query(`update ${table} set title='${title}' where id='${id}'`);
    console.log(products.recordsets); // return 12345

    console.log(products.rowsAffected);
    return res.send(products);
  } catch (error) {
    console.log(error);
  }
}


async function updateOpeningBalance(req, res) {
  try {
    const { updateList, locationId } = req.body;
    console.log({ updateList });
    const pool = await sql.connect(config);
    if (updateList && updateList.length > 0) {
      updateList.map(async (item) => {
        let query = `update Level3_LW set credit=${item.credit}, debit=${item.debit} where ID='${item.showId}' and Location_ID='${locationId}'`;
        console.log({ query });
        await pool.request().query(query);
      });
    }
  } catch (error) {
    console.log({ error });
  }
}
module.exports = {
  getLevel1: getLevel1,
  getLevel2: getLevel2,
  getLevel3: getLevel3,
  insertLevel1: insertLevel1,
  insertLevel2: insertLevel2,
  insertLevel3: insertLevel3,
  deleteLevel1: deleteLevel1,
  deleteLevel2: deleteLevel2,
  deleteLevel3: deleteLevel3,
  updateLevel1: updateLevel1,
  updateLevel2: updateLevel2,
  updateLevel3: updateLevel3,

  updateOpeningBalance: updateOpeningBalance,
};
