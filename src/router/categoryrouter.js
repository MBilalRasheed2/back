const express = require("express");
const router = express.Router();
const {
  getCategories,
  insertCategories,
  deleteCategories,
  updateCategories,
} = require("../controller/categorycontroller");
router.post("/category/insert/:option", insertCategories);
router.post("/category/delete/:option", deleteCategories);
router.post("/category/update/:option", updateCategories);
router.post("/category/get/:option", getCategories);

module.exports = router;
