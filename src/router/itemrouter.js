const express = require("express");
const router = express.Router();
const {
  insertItems,
  getItems,
  deleteItems,
  updateItem,
  updateOpeningQuantity,
} = require("../controller/ItemController");
router.post("/item/insert", insertItems);
router.post("/item/delete", deleteItems);
router.post("/item/update", updateItem);
router.get("/item/get", getItems);
router.post("/openingqty/updateqty", updateOpeningQuantity);

module.exports = router;
