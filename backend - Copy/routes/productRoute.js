const express = require('express');
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require('../utils/validators/productValidator');

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require('../services/productService');
const autheService = require("../services/autheService");

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(autheService.protect,
    autheService.allowedTo('admin','manager'),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .put(autheService.protect,
    autheService.allowedTo('admin','manager'),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(autheService.protect,
    autheService.allowedTo('admin'),deleteProductValidator, deleteProduct);

module.exports = router;
