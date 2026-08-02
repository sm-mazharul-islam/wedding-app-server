const catchAsync = require("../../utils/catchAsync");
const servicesPackageService = require("./servicesPackage.service");

const createPackage = catchAsync(async (req, res) => {
  const result = await servicesPackageService.createPackageInDB(req.body);
  res.send(result);
});

const getAllPackages = catchAsync(async (req, res) => {
  const result = await servicesPackageService.getAllPackagesFromDB();
  res.send(result);
});

const getSinglePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await servicesPackageService.getSinglePackageFromDB(id);
  res.send(result);
});

const updatePackageQuantity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const result = await servicesPackageService.updatePackageQuantityInDB(
    id,
    quantity,
  );
  res.send(result);
});

const updatePackageDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await servicesPackageService.updatePackageDetailsInDB(
    id,
    req.body,
  );
  res.send(result);
});

const deletePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await servicesPackageService.deletePackageFromDB(id);
  res.send(result);
});

module.exports = {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackageQuantity,
  updatePackageDetails,
  deletePackage,
};
