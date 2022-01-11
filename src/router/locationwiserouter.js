const express = require("express");
const router = express.Router();
const { locationWiseBalances} = require("../controller/locationwisecontroller");

router.post("/openingbalance/locationwise", locationWiseBalances);


module.exports = router;
