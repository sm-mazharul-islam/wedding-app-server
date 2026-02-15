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
    const biodataCollection = database.collection("biodata");
    const unlockedCollection = database.collection("unlockPremium");
    const bookingCollection = database.collection("bookings");

    console.log("Connected to MongoDB Successfully!");

    // নতুন বায়োডাটা তৈরি (Admin Only)
    app.post("/biodata", async (req, res) => {
      const data = req.body;
      data.createdAt = new Date();
      const result = await biodataCollection.insertOne(data);
      res.send(result);
    });

    // biodata update(Admin Only)
    app.put("/biodata/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBiodata = { $set: req.body };
      const result = await biodataCollection.updateOne(
        filter,
        updatedBiodata,
        options,
      );
      res.send(result);
    });

    app.delete("/biodata/:id", async (req, res) => {
      const id = req.params.id;
      const result = await biodataCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    //
    app.post("/unlock-premium", async (req, res) => {
      try {
        const {
          userEmail,
          biodataId,
          biodataName,
          biodataImage,
          biodataAddress,
        } = req.body;

        //  Basic Validation
        if (!userEmail || !biodataId || !userEmail.includes("@")) {
          return res
            .status(400)
            .send({ message: "Invalid request! Provide valid email and ID." });
        }

        if (userEmail === "undefined" || userEmail === "null") {
          return res
            .status(401)
            .send({ message: "Unauthorized! Please login first." });
        }

        //  Duplicate Check
        const existing = await unlockedCollection.findOne({
          userEmail: userEmail.toLowerCase(),
          biodataId: biodataId,
        });

        if (existing) {
          return res
            .status(400)
            .send({ message: "You have already unlocked this profile!" });
        }

        //  Final Data Save
        const unlockInfo = {
          userEmail: userEmail.toLowerCase(),
          biodataId,
          biodataName,
          biodataImage,
          biodataAddress,
          unlockDate: new Date(), // Automatic server time
          status: "unlocked",
        };

        const result = await unlockedCollection.insertOne(unlockInfo);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Server error occurred" });
      }
    });

    app.get("/unlocked-requests/:email", async (req, res) => {
      const email = req.params.email.toLowerCase();
      const query = { userEmail: email };
      const result = await unlockedCollection
        .find(query)
        .sort({ unlockDate: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/biodata/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid ID format" });
        }

        const query = { _id: new ObjectId(id) };
        const result = await biodataCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ error: "Biodata not found" });
        }

        const premiumCount = await unlockedCollection.countDocuments({
          biodataId: id,
        });

        res.send({ ...result, premiumCount });
      } catch (error) {
        res.status(500).send({ error: "Server error" });
      }
    });

    app.get("/biodata", async (req, res) => {
      try {
        const result = await biodataCollection
          .aggregate([
            {
              $addFields: { stringId: { $toString: "$_id" } },
            },
            {
              $lookup: {
                from: "unlockPremium",
                localField: "stringId",
                foreignField: "biodataId",
                as: "unlocks",
              },
            },
            {
              $addFields: { premiumCount: { $size: "$unlocks" } },
            },
            {
              $project: { stringId: 0, unlocks: 0 },
            },
          ])
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch aggregated biodata" });
      }
    });

    app.get("/all-unlocked-requests", async (req, res) => {
      try {
        const result = await unlockedCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching data" });
      }
    });

    app.delete("/unlock-premium/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await unlockedCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error deleting data" });
      }
    });
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
        if (!user) {
          return res.status(404).send({
            success: false,
            message: "User not found", //
          });
        }
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

    app.patch("/reviews/pin/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.isPinned;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { isPinned: status },
      };
      const result = await reviewCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/reviews/pinned", async (req, res) => {
      const query = { isPinned: true };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    // --- SERVICES & SHOP ROUTES ---

    app.post("/servicesPackage", async (req, res) => {
      try {
        const newPackage = req.body;
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

    app.patch("/servicesPackage/:id", async (req, res) => {
      const id = req.params.id;
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

    // (PUT)
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
    //  PUT Route: Update a package by ID
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

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      booking.status = "Pending";
      booking.bookingDate = new Date();
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/my-bookings/:email", async (req, res) => {
      const email = req.params.email;
      const result = await bookingCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    app.get("/admin/all-bookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: { status: status },
      };
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    //----------------//

    app.get("/weddingShop/:id", async (req, res) => {
      try {
        const id = req.params.id;
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

    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUser = await usersCollection.findOne({ email: user.email });
      if (existingUser) return res.send({ acknowledged: true });
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // (Admin Only)
    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);

        res.status(200).send(result);
      } catch (error) {
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

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
      res.send(result);
    });

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
