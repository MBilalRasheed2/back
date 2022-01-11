const express = require("express");
const router = express.Router();
const { itemledgerhandler, itemledgerwithavg} = require("../controller/itemledgercontroller");

router.post("/itemledger/get", itemledgerhandler);
router.post("/itemledgerwithavg/get", itemledgerwithavg);


module.exports = router;
