const express = require("express");
const router = express.Router();

const {
  makeLedger,
  makeTrialBalance,
  makeReceiptDetails,
  makePaymentDetails,
  makePostDatedCheques,
} = require("../controller/ledgercontroller");

router.post("/ledger/get", makeLedger);
router.post("/trialbalance/get", makeTrialBalance);
router.post("/receiptdetails/get", makeReceiptDetails);
router.post("/paymentdetails/get", makePaymentDetails);
router.post("/postdated/get", makePostDatedCheques);

module.exports = router;
