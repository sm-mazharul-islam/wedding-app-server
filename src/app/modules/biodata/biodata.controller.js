const catchAsync = require("../../utils/catchAsync");
const biodataService = require("./biodata.service");

const createBiodata = catchAsync(async (req, res) => {
  const result = await biodataService.createBiodataInDB(req.body);
  res.send(result);
});

const updateBiodata = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await biodataService.updateBiodataInDB(id, req.body);
  res.send(result);
});

const deleteBiodata = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await biodataService.deleteBiodataFromDB(id);
  res.send(result);
});

const getSingleBiodata = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await biodataService.getSingleBiodataFromDB(id);
  res.send(result);
});

const getAllBiodata = catchAsync(async (req, res) => {
  const result = await biodataService.getAllBiodataFromDB();
  res.send(result);
});

module.exports = {
  createBiodata,
  updateBiodata,
  deleteBiodata,
  getSingleBiodata,
  getAllBiodata,
};
