var config = require("../dbConfig");
const sql = require("mssql");

async function getuserroutes(req, res) {
  try {
    const { email } = req.body;
    let pool = await sql.connect(config);
    let userRoutes = await pool
      .request()
      .query(`select * from userRights where email='${email}'`);
    let user = await pool
      .request()
      .query(`select * from users where email='${email}'`);

    return res.send({
      routes: userRoutes.recordsets[0],
      user: user.recordset[0],
    });
  } catch (error) {
    console.log(error);
  }
}
async function adduser(req, res) {
  try {
    const { email, password, name, role } = req.body;
    let pool = await sql.connect(config);
    let addUser = await pool
      .request()
      .query(
        `insert into users(email,password,name,role,picture) 
    values('${email}','${password}','${name}','${role}','${null}')`
      )
      .then(async () => {
        let addUserRights = `INSERT INTO userrights(email,routeId) 
        SELECT w.email AS email, m.id AS id
        FROM users w, routes m where w.email='${email}'`;
        await pool.request().query(addUserRights);
      });
  } catch (error) {
    console.log(error);
  }
}
async function signin(req, res) {
  try {
    const { email, password } = req.body;
    let pool = await sql.connect(config);
    let userRoutes = await pool.request().query(`select 
        routes.title,
        routes.href,
        routes.parentId,
        routes.no,
        routeId as id,
        ViewComp as views,
        EnableCom as enable,
        SaveCom as saved,
        Edit as edit,
        DeleteCom as deleted,
        PrintCom as prints,
        CheckCom as checked,
        Approve as approve,
        Cancel as cancel,
        Visible as visible from userRights inner join routes on userRights.routeId=routes.id  where email='bilal@email.com'`);
    let user = await pool
      .request()
      .query(
        `select * from users where email='${email}' and password='${password}'`
      );
    if (user) {
      if (user.rowsAffected > 0) {
        return res.send({
          routes: userRoutes.recordsets[0],
          user: user.recordset[0],
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
async function getAllUsers(req, res) {
  try {
    let email = "superadmin@email.com";
    let pool = await sql.connect(config);
    let userRoutes = await pool.request().query(`select 
      routes.title,
      routes.href,
      routes.parentId,
      routes.no,
      routeId as id,
      userRights.email,
      ViewComp as views,
      EnableCom as enable,
      SaveCom as saved,
      Edit as edit,
      DeleteCom as deleted,
      PrintCom as prints,
      CheckCom as checked,
      Approve as approve,
      Cancel as cancel,
      Visible as visible from userRights inner join routes on userRights.routeId=routes.id  where email!='${email}'`);
    let user = await pool
      .request()
      .query(`select * from users where email!='${email}'`);
    console.log({ ri: userRoutes });
    return res.send({
      routes: userRoutes.recordsets[0],
      user: user.recordsets[0],
    });
  } catch (error) {
    console.log(error);
  }
}
function mapFields(name) {
  let returnName;
  let lowerName = name ? name.toLowerCase() : null;
  if (lowerName === "views") {
    returnName = "ViewComp";
  }
  if (lowerName === "enable") {
    returnName = "EnableCom";
  }
  if (lowerName === "saved") {
    returnName = "SaveCom";
  }
  if (lowerName === "edit") {
    returnName = "Edit";
  }
  if (lowerName === "deleted") {
    returnName = "DeleteCom";
  }
  if (lowerName === "prints") {
    returnName = "PrintCom";
  }
  if (lowerName === "checked") {
    returnName = "CheckCom";
  }
  if (lowerName === "approve") {
    returnName = "Approve";
  }
  if (lowerName === "cancel") {
    returnName = "Cancel";
  }
  if (lowerName === "visible") {
    returnName = "Visible";
  }

  return returnName;
}
async function updateuserrights(req, res) {
  try {
    const { email, value, name, id } = req.body;
    let dbName = mapFields(name);
    console.log({ email, value, name, id });
    let chValue = value === 0 ? 1 : 0;
    const pool = await sql.connect(config);
    let query = `update userRights set ${dbName} ='${chValue}'
     where email='${email}' and routeId='${id}'
    `;
    const updateQuery = await pool.request().query(query);

    return res.send({ result: updateQuery.rowsAffected });
  } catch (err) {
    console.log({ err });
  }
}
async function updateuserrightsAllFields(req, res) {
  try {
    const { data, val } = req.body;
    const id = data.id;
    console.log({ id });

    const pool = await sql.connect(config);
    let query = ` 
    update userRights set
    ViewComp ='${val}',
    EnableCom ='${val}',
    SaveCom ='${val}',
    Edit ='${val}',
    DeleteCom ='${val}',
    PrintCom ='${val}',
    CheckCom ='${val}',
    Approve ='${val}',
    Cancel ='${val}',
    Visible ='${val}' where email='${data.email}' and routeId='${data.id}'
    `;
    const updateQuery = await pool.request().query(query);

    return res.send({ result: updateQuery.rowsAffected });
  } catch (err) {
    console.log({ err });
  }
}
async function updateuserrightsAllChilds(req, res) {
  try {
    const { data, val } = req.body;
    const id = data.id;
    console.log({ id });
    let rowsAffected = 0;
    const pool = await sql.connect(config);
    let ids = [];

    if (data.children && data.children.length > 0) {
      data.children.map((ch) => {
        ids.push(ch.id);
        if (ch.children && ch.children.length > 0) {
          ch.children.map((grand) => {
            ids.push(grand.id);
          });
        }
      });
    }
 
    ids.map(async (item) => {
      let query = ` 
      update userRights set
      ViewComp ='${val}',
      EnableCom ='${val}',
      SaveCom ='${val}',
      Edit ='${val}',
      DeleteCom ='${val}',
      PrintCom ='${val}',
      CheckCom ='${val}',
      Approve ='${val}',
      Cancel ='${val}',
      Visible ='${val}' where email='${data.email}' and routeId='${item}'
      `;
      await pool
        .request()
        .query(query)
        .then((row) => {
         
          rowsAffected = rowsAffected + 1;
        });
    });
    console.log({rowsAffected})
    return res.send({ result: ids.length });
  } catch (err) {
    console.log({ err });
  }
}
module.exports = {
  getuserroutes: getuserroutes,
  adduser: adduser,
  signin: signin,
  getAllUsers: getAllUsers,
  updateuserrights: updateuserrights,
  updateuserrightsAllFields: updateuserrightsAllFields,
  updateuserrightsAllChilds: updateuserrightsAllChilds,
};
