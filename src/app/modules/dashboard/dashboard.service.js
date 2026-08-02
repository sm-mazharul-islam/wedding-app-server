const { getCollection } = require("../../config/db");

const getUsersCollection = () => getCollection("users");
const getOrdersCollection = () => getCollection("orders");
const getReviewCollection = () => getCollection("reviews");
const getCartCollection = () => getCollection("cart");

const getDashboardStatsFromDB = async (email) => {
  const usersCollection = getUsersCollection();
  const ordersCollection = getOrdersCollection();
  const reviewCollection = getReviewCollection();
  const cartCollection = getCartCollection();

  const user = await usersCollection.findOne({ email });
  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    const totalOrders = await ordersCollection.countDocuments();
    const totalReviews = await reviewCollection.countDocuments();
    const totalUsers = await usersCollection.countDocuments();
    const allCarts = await cartCollection.find().toArray();
    const cartSum = allCarts.reduce(
      (acc, curr) => acc + (curr.cartItems?.length || 0),
      0,
    );

    return {
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

    return {
      role: "user",
      title: `Welcome, ${user?.name?.split(" ")[0] || "User"}`,
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
};

module.exports = {
  getDashboardStatsFromDB,
};
