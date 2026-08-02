const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require("./index");

const client = new MongoClient(config.db_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

let dbInstance = null;

const connectDB = async () => {
  if (!dbInstance) {
    await client.connect();
    dbInstance = client.db("weddingPlanner");
    console.log("Connected to MongoDB Successfully!");
  }
  return dbInstance;
};

const getDB = () => {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return dbInstance;
};

const getCollection = (collectionName) => {
  return getDB().collection(collectionName);
};

module.exports = {
  connectDB,
  getDB,
  getCollection,
};
