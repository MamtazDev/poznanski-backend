const { default: mongoose } = require("mongoose");
const news = require("../models/news");
const { faker } = require("@faker-js/faker"); // Updated import for faker

// Function to generate random data
const generateRandomPost = () => {
  const randomFiles = Array.from(
    { length: faker.number.int({ min: 0, max: 3 }) },
    () => faker.internet.url()
  );

  return {
    title: faker.lorem.sentence(),
    intro: faker.lorem.paragraph(),
    content: faker.lorem.text(),
    files: randomFiles,
    nickname: faker.internet.username(), // Updated method
    email: faker.internet.email(),
    tags: faker.word.words(3), // Updated method
    date: "2025-01-28T12:00:00.000Z",
    confirmed: faker.datatype.boolean(),
    confirmationToken: faker.string.alphanumeric(16),
    commentsSection: {
      comment: faker.lorem.sentence(),
      author: faker.internet.username(), // Updated method
    },
  };
};

// Seed function to populate the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://mamtazfreelancer:f7FcczeDomuZ5F3L@cluster0.6ds5s8q.mongodb.net/admin_dashboard"
    );
    console.log("Connected to MongoDB");

    // Generate 50 random posts
    const posts = Array.from({ length: 50 }, generateRandomPost);

    // Insert into the database
    await news.insertMany(posts);
    console.log("Successfully seeded 50 random posts into the database");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Run the seed function
seedDatabase();
