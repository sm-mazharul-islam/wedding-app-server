const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.edakn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("weddingPlanner");
    const servicesPackageCollection = database.collection("servicesPackage");
    const weddingShopDataCollection = database.collection("weddingShop");
    const reviewCollection = database.collection("reviews");
    const cartCollection = database.collection("cart");

    // Backend route
    app.post("/servicesPackage", async (req, res) => {
      try {
        const newPackage = req.body;
        // Ensure servicesPackageCollection is defined and connected
        const result = await servicesPackageCollection.insertOne(newPackage);
        res.send(result);
      } catch (error) {
        console.error("Database Error:", error);
        res.status(500).send({ error: "Failed to save to database" });
      }
    });

    app.get("/servicesPackage", async (req, res) => {
      const query = {};
      const options = await servicesPackageCollection.find(query).toArray();
      res.send(options);
    });
    /* ---------------- */

    // app.get("/servicesPackage/:id", async (req, res) => {
    //   const id = req.params._id;
    //   console.log("getting specific service", id);
    //   const query = { _id: id };
    //   console.log(query);
    //   const service = await servicesPackageCollection.findOne(query);
    //   console.log(service);
    // });

    // solve to chatgpt --------> single service get -!

    //? here is my current

    // app.get("/servicesPackage/:id", async (req, res) => {
    //   try {
    //     const id = req.params.id; // Correctly access the id parameter
    //     console.log("getting specific service", id);

    //     // Check if the id is a valid ObjectId
    //     if (!ObjectId.isValid(id)) {
    //       return res.status(400).json({ message: "Invalid ID format" });
    //     }

    //     // Convert id to ObjectId
    //     const query = { _id: new ObjectId(id) };
    //     console.log(query);

    //     // Retrieve the service package from the collection
    //     const service = await servicesPackageCollection.findOne(query);
    //     console.log(service);

    //     if (service) {
    //       res.status(200).json(service); // Send the service package if found
    //     } else {
    //       res.status(404).json({ message: "Service not found" }); // Handle case when service is not found
    //     }
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: "Internal Server Error" }); // Handle any other errors
    //   }
    // });

    // Backend: Get specific product by ID to show LIVE stock
    // Backend: index.js
    app.get("/servicesPackage/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) }; // Ensure ObjectId is imported from 'mongodb'
        const result = await servicesPackageCollection.findOne(query);
        if (!result)
          return res.status(404).send({ message: "Product not found" });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Invalid ID format" });
      }
    });
    //!
    // Backend: index.js
    app.patch("/servicesPackage/:id", async (req, res) => {
      const id = req.params.id;
      const purchasedQuantity = req.body.quantity;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        // MUST use negative purchasedQuantity to subtract from the stock
        $inc: { inStock: -purchasedQuantity },
      };

      const result = await servicesPackageCollection.updateOne(
        filter,
        updateDoc,
      );
      res.send(result);
    });
    // ------------------------------------------------
    // 1. DELETE Route: Remove a package by ID
    // ------------------------------------------------
    app.delete("/servicesPackage/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await servicesPackageCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Delete failed", error });
      }
    });

    // ------------------------------------------------
    // 2. PUT Route: Update a package by ID
    // ------------------------------------------------
    app.put("/servicesPackage/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedPackage = req.body; // The new data from frontend

        const updateDoc = {
          $set: {
            name: updatedPackage.name,
            nameTwo: updatedPackage.nameTwo,
            priceOne: updatedPackage.priceOne,
            image: updatedPackage.image,
            descriptionTwo: updatedPackage.descriptionTwo,
          },
        };

        const result = await servicesPackageCollection.updateOne(
          filter,
          updateDoc,
        );
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Update failed", error });
      }
    });

    //!

    /// wedding Shop data collection get---->process

    app.get("/weddingShop", async (req, res) => {
      const query = {};
      const options = await weddingShopDataCollection.find(query).toArray();
      res.send(options);
    });

    //!
    // 1. POST API - Review save korar jonno
    // Add this to your backend server file
    app.post("/reviews", async (req, res) => {
      console.log("POST request received at /reviews"); // Look for this in your terminal
      console.log("Body received:", req.body);

      try {
        const newReview = req.body;
        const result = await reviewCollection.insertOne(newReview);
        res.send(result);
      } catch (error) {
        console.error("Database Error:", error);
        res.status(500).send({ error: "Failed to save review" });
      }
    });
    // 2. GET API - Shob review dashboard e dekhannor jonno
    app.get("/reviews", async (req, res) => {
      const query = {};
      const reviews = await reviewCollection.find(query).toArray();
      res.send(reviews);
    });

    //// get single data using id --->

    app.get("/weddingShop/:id", async (req, res) => {
      try {
        const id = req.params.id; // Correctly access the id parameter
        console.log("getting specific service", id);

        // Check if the id is a valid ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid ID format" });
        }

        // Convert id to ObjectId
        const query = { _id: new ObjectId(id) };
        console.log(query);

        // Retrieve the service package from the collection
        const service = await weddingShopDataCollection.findOne(query);
        console.log(service);

        if (service) {
          res.status(200).json(service); // Send the service package if found
        } else {
          res.status(404).json({ message: "Service not found" }); // Handle case when service is not found
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" }); // Handle any other errors
      }
    });

    // Save or Update user-specific cart
    app.post("/cart", async (req, res) => {
      const { email, cartItems } = req.body;
      const query = { email: email };
      const updateDoc = {
        $set: {
          email,
          cartItems,
          lastUpdated: new Date(),
        },
      };
      const options = { upsert: true };
      const result = await cartCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // Get user-specific cart
    app.get("/cart/:email", async (req, res) => {
      const email = req.params.email;
      const result = await cartCollection.findOne({ email });
      res.send(result || { cartItems: [] });
    });

    //!!!!!
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("wedding app is running");
});

app.listen(port, () => console.log(`Wedding portal running ${port}`));
