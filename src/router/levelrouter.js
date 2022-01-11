const express = require("express");

const router = express.Router();
const {
  getLevel1,
  insertLevel1,
  deleteLevel1,
  updateLevel1,
  insertLevel2,
  getLevel2,
  updateLevel2,
  deleteLevel2,
  insertLevel3,
  deleteLevel3,
  updateLevel3,
  getLevel3,
  updateOpeningBalance
} = require("../controller/levelcontroller");

router.post("/level1/insert", insertLevel1);
router.post("/level1/delete", deleteLevel1);
router.post("/level1/update", updateLevel1);
router.get("/level1/get", getLevel1);

router.post("/level2/insert", insertLevel2);
router.post("/level2/delete", deleteLevel2);
router.post("/level2/update", updateLevel2);
router.get("/level2/get", getLevel2);

router.post("/level3/insert", insertLevel3);
router.post("/level3/delete", deleteLevel3);
router.post("/level3/update", updateLevel3);
router.get("/level3/get", getLevel3);

router.post("/openingbalance/update", updateOpeningBalance);

module.exports = router;
