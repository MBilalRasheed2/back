const express = require("express");
const {
  saleReportItemWise,
  saleReportPartyWise,
  saleReportInvoiceWise,
  saleReportItemWisePartyWise,
} = require("../controller/reportcontroller");
const router = express.Router();

router.post("/report/sell/itemwise", saleReportItemWise);
router.post("/report/sell/partywise", saleReportPartyWise);
router.post("/report/sell/invoicewise", saleReportInvoiceWise);
router.post("/report/sell/itemwisepartywise", saleReportItemWisePartyWise);

module.exports = router;
