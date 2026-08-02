const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(process.cwd(), ".env") });

module.exports = {
  port: process.env.PORT || 5000,
  db_user: process.env.DB_USER,
  db_pass: process.env.DB_PASS,
  db_uri: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.edakn.mongodb.net/?retryWrites=true&w=majority`,
};
