
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Ticket = require("../models/Ticket");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Admin password use env. Set it to any password
const admin = {
  name: "Admin",
  email: "admin@example.com",
  password: process.env.ADMIN_PASSWORD || "Admin@12345",
  role: "admin",
};

// 10 regular users
const users = Array.from({ length: 10 }, (_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  password: "Password@123",
  role: "user",
}));

// Sample tickets
const sampleTickets = [
  {
    title: "Unable to login",
    description: "I cannot access my account using my credentials.",
    priority: "high",
    status: "open",
    userIndex: 1,
  },
  {
    title: "Password reset request",
    description: "I forgot my password and need assistance resetting it.",
    priority: "medium",
    status: "in progress",
    userIndex: 1,
  },
  {
    title: "Dashboard not loading",
    description: "The dashboard displays a blank page after login.",
    priority: "high",
    status: "open",
    userIndex: 2,
  },
  {
    title: "Profile information update",
    description: "I need to update my contact information.",
    priority: "low",
    status: "closed",
    userIndex: 2,
  },
  {
    title: "Payment processing error",
    description: "My payment failed even though my card was charged.",
    priority: "high",
    status: "in progress",
    userIndex: 3,
  },
  {
    title: "Application running slowly",
    description: "The application takes too long to load pages.",
    priority: "medium",
    status: "open",
    userIndex: 3,
  },
  {
    title: "Email notification missing",
    description: "I am not receiving email notifications.",
    priority: "low",
    status: "closed",
    userIndex: 4,
  },
  {
    title: "File upload failure",
    description: "Unable to upload PDF documents to the platform.",
    priority: "high",
    status: "open",
    userIndex: 4,
  },
  {
    title: "Account verification issue",
    description: "The verification link is not working.",
    priority: "medium",
    status: "in progress",
    userIndex: 5,
  },
  {
    title: "Incorrect billing information",
    description: "My billing address is displayed incorrectly.",
    priority: "low",
    status: "open",
    userIndex: 6,
  },
  {
    title: "Server connection error",
    description: "The application displays a server connection error.",
    priority: "high",
    status: "open",
    userIndex: 7,
  },
  {
    title: "Unable to download report",
    description: "The download button does not generate a report.",
    priority: "medium",
    status: "closed",
    userIndex: 8,
  },
  {
    title: "Mobile layout issue",
    description: "The navigation menu overlaps the content on mobile.",
    priority: "low",
    status: "in progress",
    userIndex: 9,
  },
  {
    title: "Unexpected logout",
    description: "My session expires unexpectedly while using the application.",
    priority: "high",
    status: "open",
    userIndex: 10,
  },
  {
    title: "Feature request",
    description: "Please add an option to export tickets as CSV.",
    priority: "low",
    status: "open",
    userIndex: 10,
  },
];

const importData = async () => {
  // Create admin if not already created
  let adminUser = await User.findOne({
    email: admin.email,
  });

  if (!adminUser) {
    adminUser = await User.create(admin);
    console.log("Admin created");
  } else {
    console.log("Admin already exists. Skipping...");
  }

  // Create users if they don't already exist
  const createdUsers = [];

  for (const userData of users) {
    let user = await User.findOne({
      email: userData.email,
    });

    if (!user) {
      user = await User.create(userData);
      console.log(`Created: ${user.email}`);
    } else {
      console.log(`Already exists: ${user.email}`);
    }

    createdUsers.push(user);
  }

  // Include admin and regular users
  const allUsers = [adminUser, ...createdUsers];

  // Create tickets if they don't already exist
  for (const ticketData of sampleTickets) {
    const { userIndex, ...ticket } = ticketData;

    const createdBy = allUsers[userIndex]._id;

    const existingTicket = await Ticket.findOne({
      title: ticket.title,
      createdBy,
    });

    if (!existingTicket) {
      await Ticket.create({
        ...ticket,
        createdBy,
      });

      console.log(`Ticket created: ${ticket.title}`);
    } else {
      console.log(`Ticket already exists: ${ticket.title}`);
    }
  }

  console.log("Seeding completed!");
};

const destroyData = async () => {
  await Ticket.deleteMany();
  await User.deleteMany();

  console.log("All users and tickets removed");
};

const run = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not set in your environment/.env");
    }

    await mongoose.connect(MONGO_URI);

    if (process.argv[2] === "-d") {
      await destroyData();
    } else {
      await importData();
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("Seeding failed:", error.message);

    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

run();
