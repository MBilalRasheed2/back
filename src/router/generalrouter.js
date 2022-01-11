const express = require("express");
const router = express.Router();
const { getlocations,getdefaultLocation } = require("../controller/generalcontroller");

router.post("/general/getlocation", getlocations);
router.post("/general/defultlocation", getdefaultLocation);

module.exports = router;
