const express = require("express");

const router = express.Router();

const {
  makeVoucher,
  getVouchers,
  getSingleVoucher,
  jvOperation,
  editVoucher,
} = require("../controller/vouchercontroller");

router.post("/routes/voucher/insert", makeVoucher);
router.post("/routes/voucher/get", getVouchers);
router.post("/routes/voucher/getsingle", getSingleVoucher);
router.post("/routes/voucher/operation", jvOperation);
router.post("/routes/voucher/update", editVoucher);

module.exports = router;
