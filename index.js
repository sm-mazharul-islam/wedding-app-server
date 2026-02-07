//!

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
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

    // Collections initialize
    const servicesPackageCollection = database.collection("servicesPackage");
    const weddingShopDataCollection = database.collection("weddingShop");
    const reviewCollection = database.collection("reviews");
    const cartCollection = database.collection("cart");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");

    console.log("Connected to MongoDB Successfully!");

    // --- DASHBOARD STATS ROUTE ---
    //!!
    app.get("/dashboard-stats/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCollection.findOne({ email: email });
        const isAdmin = user?.role === "admin";

        let stats = {};

        if (isAdmin) {
          const totalOrders = await ordersCollection.countDocuments();
          const totalReviews = await reviewCollection.countDocuments();
          const totalUsers = await usersCollection.countDocuments();
          const allCarts = await cartCollection.find().toArray();
          const cartSum = allCarts.reduce(
            (acc, curr) => acc + (curr.cartItems?.length || 0),
            0,
          );

          stats = {
            role: "admin",
            title: "Platform Executive Overview",
            metrics: [
              {
                label: "Total Revenue",
                value: `$${totalOrders * 150}`,
                growth: "+12.5%",
                color: "blue",
              },
              {
                label: "Active Clients",
                value: totalUsers,
                growth: "+5.2%",
                color: "purple",
              },
              {
                label: "Total Packages",
                value: totalOrders,
                growth: "+2.1%",
                color: "green",
              },
              {
                label: "Client Reviews",
                value: totalReviews,
                growth: "+8.4%",
                color: "yellow",
              },
            ],
            probability: "82%",
            chartData: {
              orders: totalOrders || 0,
              reviews: totalReviews || 0,
              carts: cartSum || 0,
            },
          };
        } else {
          const userOrders = await ordersCollection.countDocuments({
            userEmail: email,
          });
          const userReviews = await reviewCollection.countDocuments({
            email: email,
          });
          const userCart = await cartCollection.findOne({ email: email });

          stats = {
            role: "user",
            title: "Wedding Planning Progress",
            metrics: [
              {
                label: "My Bookings",
                value: userOrders,
                growth: "Active",
                color: "blue",
              },
              {
                label: "Cart Items",
                value: userCart?.cartItems?.length || 0,
                growth: "Pending",
                color: "green",
              },
              {
                label: "My Feedback",
                value: userReviews,
                growth: "Submitted",
                color: "yellow",
              },
              {
                label: "Planning Score",
                value: "88%",
                growth: "High",
                color: "purple",
              },
            ],
            probability: "92%",
            chartData: {
              orders: userOrders || 0,
              reviews: userReviews || 0,
              carts: userCart?.cartItems?.length || 0,
            },
          };
        }
        res.send(stats);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch stats" });
      }
    });
    // --- USER ROLE ROUTE ---
    app.get("/users/role/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCollection.findOne({ email: email });
        res.send({ role: user?.role || "user" });
      } catch (error) {
        res.status(500).send({ error: "Role fetch failed" });
      }
    });

    // --- REVIEWS ROUTES ---
    app.post("/reviews", async (req, res) => {
      try {
        const result = await reviewCollection.insertOne(req.body);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to save review" });
      }
    });

    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    });
    // রিভিউ ডিলিট করার রুট
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // --- ORDERS ROUTES ---
    app.post("/orders", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.send(result);
    });

    // index.js

    // রিভিউ পিন অথবা আনপিন করার রুট
    app.patch("/reviews/pin/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.isPinned; // true অথবা false আসবে
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { isPinned: status },
      };
      const result = await reviewCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // হোমপেজের জন্য শুধু পিন করা রিভিউগুলো পাওয়ার রুট
    app.get("/reviews/pinned", async (req, res) => {
      const query = { isPinned: true };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    // --- SERVICES & SHOP ROUTES ---
    // index.js
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

    app.get("/servicesPackage/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!id || id === "undefined" || id.length !== 24) {
          return res.status(400).send({ message: "Invalid ID format" });
        }
        const result = await servicesPackageCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Server Error" });
      }
    });
    // index.js
    app.patch("/servicesPackage/:id", async (req, res) => {
      const id = req.params.id;
      // This check prevents the BSONError crash you saw earlier
      if (!id || id === "undefined" || id.length !== 24) {
        return res.status(400).send({ message: "Invalid ID format" });
      }

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = { $inc: { inStock: -req.body.quantity } };
      const result = await servicesPackageCollection.updateOne(
        filter,
        updatedDoc,
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

    //     app.get("/weddingShop", async (req, res) => {
    //       const query = {};
    //       const options = await weddingShopDataCollection.find(query).toArray();
    //       res.send(options);
    //     });

    // index.js
    app.post("/weddingShop", async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await weddingShopDataCollection.insertOne(newProduct);
        res.send(result);
      } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({ message: "Failed to add product" });
      }
    });

    app.get("/weddingShop", async (req, res) => {
      const query = {};
      const options = await weddingShopDataCollection.find(query).toArray();
      res.send(options);
    });

    app.delete("/weddingShop/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await weddingShopDataCollection.deleteOne(query);
      res.send(result);
    });

    //শপ আইটেম আপডেট করা (PUT)
    app.put("/weddingShop/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedItem = req.body;
      const updateDoc = {
        $set: {
          name: updatedItem.name,
          priceTwo: parseFloat(updatedItem.priceTwo),
          inStock: parseInt(updatedItem.inStock),
        },
      };
      const result = await weddingShopDataCollection.updateOne(
        filter,
        updateDoc,
      );
      res.send(result);
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
    // index.js
    app.get("/weddingShop/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // Prevent BSONError crashes by validating ID
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid ID format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await weddingShopDataCollection.findOne(query);

        if (!result) {
          return res.status(404).json({ error: "Item not found" });
        }
        res.send(result); // Always send a JSON body
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
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

    //!

    // --- USERS SAVE ---
    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUser = await usersCollection.findOne({ email: user.email });
      if (existingUser) return res.send({ acknowledged: true });
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // ইউজার ডিলিট করার এপিআই (Admin Only)
    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);

        // JSON রেসপন্স নিশ্চিত করা
        res.status(200).send(result);
      } catch (error) {
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

    // index.js

    // index.js
    app.get("/dashboard-stats/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCollection.findOne({ email: email });
        const isAdmin = user?.role === "admin";

        if (isAdmin) {
          // Admin: All Data
          const allOrders = await ordersCollection.countDocuments();
          const allReviews = await reviewCollection.countDocuments();
          const allCarts = await cartCollection.find().toArray();
          const totalCartItems = allCarts.reduce(
            (acc, curr) => acc + (curr.cartItems?.length || 0),
            0,
          );

          res.send({
            packages: allOrders,
            reviews: allReviews,
            cart: totalCartItems,
            growth: "85%",
            labelPrefix: "All",
            title: "Admin Live Monitor",
          });
        } else {
          // User: Personal Data
          const userOrders = await ordersCollection.countDocuments({
            userEmail: email,
          });
          const userReviews = await reviewCollection.countDocuments({
            email: email,
          });
          const userCartData = await cartCollection.findOne({ email: email });

          res.send({
            packages: userOrders,
            reviews: userReviews,
            cart: userCartData?.cartItems?.length || 0,
            growth: "12%",
            labelPrefix: "My",
            title: `Welcome, ${user?.name?.split(" ")[0] || "User"}`,
          });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed" });
      }
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result); // এটি JSON ডাটা পাঠাবে
    });

    // ইউজারের রোল আপডেট করার রুট
    app.patch("/users/role/:id", async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = { $set: { role: role } };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => res.send("Wedding app server is running"));
app.listen(port, () => console.log(`Server running on port ${port}`));

//http://localhost:5000/
