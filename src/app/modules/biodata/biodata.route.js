const express = require("express");
const biodataController = require("./biodata.controller");

const router = express.Router();

router.post("/biodata", biodataController.createBiodata);
router.put("/biodata/:id", biodataController.updateBiodata);
router.delete("/biodata/:id", biodataController.deleteBiodata);
router.get("/biodata/:id", biodataController.getSingleBiodata);
router.get("/biodata", biodataController.getAllBiodata);

module.exports = router;
