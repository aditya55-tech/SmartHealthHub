const Medicine = require("../models/Medicine");
const seedData = require("../data/medicines");

const seedMedicines = async () => {
  try {
    const count = await Medicine.countDocuments();
    if (count === 0) {
      console.log("Seeding medicines data...");
      
      // Keep the numeric id for substitute references, mongoose will also generate _id
      const preparedData = seedData.map(item => ({ ...item }));

      await Medicine.insertMany(preparedData);
      console.log("Medicines seeded successfully!");
    } else {
      console.log("Medicines collection already has data. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding medicines:", error);
  }
};

module.exports = seedMedicines;
