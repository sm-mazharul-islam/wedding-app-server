const express = require("express");
const userController = require("./user.controller");

const router = express.Router();

router.post("/users", userController.createUser);
router.get("/users", userController.getAllUsers);
router.get("/users/role/:email", userController.getUserRole);
router.patch("/users/role/:id", userController.updateUserRole);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
