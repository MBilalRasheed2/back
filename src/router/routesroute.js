const express = require("express");

const router = express.Router();
const {
  getuserroutes,
  adduser,
  signin,
  getAllUsers,
  updateuserrights,
  updateuserrightsAllFields,
  updateuserrightsAllChilds,
} = require("../controller/routescontroller");

router.post("/routes/get", getuserroutes);
router.post("/user/add", adduser);
router.post("/user/signin", signin);
router.post("/user/get/all", getAllUsers);
router.post("/user/rights/update", updateuserrights);
router.post("/user/rights/allupdate", updateuserrightsAllFields);
router.post("/user/rights/allupdatechild", updateuserrightsAllChilds);

module.exports = router;
