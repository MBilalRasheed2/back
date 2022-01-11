const express = require("express");
const router = express.Router();
const { stockReportStarting, stockReportStartingWithValue} = require("../controller/stockcontroller");

router.post("/stock/startstock", stockReportStarting);
router.post("/stock/startstockwithvalue", stockReportStartingWithValue);


module.exports = router;
