const express = require("express");
const router = express.Router();
const {
  makeInvoice,
  makeInvoiceNewId,
  getInvoices,
  getInvoiceItems,
  getPendingInvoice,
  nextVoucherRef,
  prevVoucherRef,
  editInvoice,
  invoiceOperation,
  invoiceDelete,
  getSingleInvoice,
} = require("../controller/invoicecontroller");

router.post("/invoice/insert", makeInvoice);
router.post("/invoice/edit", editInvoice);
router.post("/invoice/get", getInvoices);
router.post("/invoice/makeId", makeInvoiceNewId);
router.post("/invoice/items", getInvoiceItems);
router.post("/invoice/pendinginvoices", getPendingInvoice);
router.post("/invoice/listnext", nextVoucherRef);
router.post("/invoice/prev", prevVoucherRef);
router.post("/invoice/operation", invoiceOperation);
router.post("/invoice/delete", invoiceDelete);
router.post("/invoice/getsingle", getSingleInvoice);

module.exports = router;
