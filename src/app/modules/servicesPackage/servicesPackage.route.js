const express = require("express");
const servicesPackageController = require("./servicesPackage.controller");

const router = express.Router();

router.post("/servicesPackage", servicesPackageController.createPackage);
router.get("/servicesPackage", servicesPackageController.getAllPackages);
router.get("/servicesPackage/:id", servicesPackageController.getSinglePackage);
router.patch(
  "/servicesPackage/:id",
  servicesPackageController.updatePackageQuantity,
);
router.put(
  "/servicesPackage/:id",
  servicesPackageController.updatePackageDetails,
);
router.delete("/servicesPackage/:id", servicesPackageController.deletePackage);

module.exports = router;
