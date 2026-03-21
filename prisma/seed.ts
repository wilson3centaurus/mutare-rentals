import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const properties = [
  {
    title: "Spacious 3-Bedroom House in Chikanga",
    description: "A well-maintained family home in the heart of Chikanga with a large garden and secure parking.",
    address: "45 Bvumba Road",
    suburb: "Chikanga",
    latitude: -18.9337,
    longitude: 32.6292,
    price: 295,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 120,
    propertyType: "HOUSE" as const,
    listingType: "WHOLE_HOUSE" as const,
    status: "AVAILABLE" as const,
    houseConstruction: "BRICK" as const,
    roofType: "IRON_SHEETS" as const,
    wallCondition: "GOOD" as const,
    windowCondition: "GOOD" as const,
    bathroomType: "SHOWER_AND_TUB" as const,
    contactRole: "LANDLORD" as const,
    algorithm: "HEDONIC" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: true,
    hasWifi: false,
    hasBorehole: false,
    hasDriveway: true,
    hasPool: false,
    hasGenerator: false,
    hasSolarPower: false,
    yearBuilt: 2008,
    contactName: "Tendai Moyo",
    contactPhone: "+263 77 234 5678",
    contactEmail: "tendai@example.com",
    amenities: ["Parking", "Garden"],
    images: [],
  },
  {
    title: "Modern 2-Bed Flat in Morningside",
    description: "Newly renovated flat with modern finishes, electricity backup, and 24-hour security.",
    address: "12 Herbert Chitepo Ave",
    suburb: "Morningside",
    latitude: -18.9600,
    longitude: 32.6550,
    price: 388,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 75,
    propertyType: "FLAT" as const,
    listingType: "WHOLE_HOUSE" as const,
    status: "AVAILABLE" as const,
    houseConstruction: "BRICK" as const,
    roofType: "CONCRETE" as const,
    wallCondition: "EXCELLENT" as const,
    windowCondition: "EXCELLENT" as const,
    bathroomType: "SHOWER_ONLY" as const,
    contactRole: "ESTATE_AGENT" as const,
    algorithm: "COMPARABLE_SALES" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: true,
    hasWifi: true,
    hasBorehole: false,
    hasDriveway: false,
    hasPool: false,
    hasGenerator: false,
    hasSolarPower: true,
    yearBuilt: 2015,
    contactName: "Rudo Nyambuya",
    contactPhone: "+263 71 456 7890",
    contactEmail: "rudo@example.com",
    amenities: ["Solar backup", "Fibre ready"],
    images: [],
  },
  {
    title: "Affordable Room in Sakubva",
    description: "Single room available in a shared house. Close to market and public transport.",
    address: "88 Sakubva Drive",
    suburb: "Sakubva",
    latitude: -18.9650,
    longitude: 32.6600,
    price: 92,
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 20,
    propertyType: "ROOM" as const,
    listingType: "ROOM" as const,
    status: "AVAILABLE" as const,
    houseConstruction: "BRICK" as const,
    roofType: "IRON_SHEETS" as const,
    wallCondition: "FAIR" as const,
    windowCondition: "FAIR" as const,
    bathroomType: "SHOWER_ONLY" as const,
    contactRole: "LANDLORD" as const,
    algorithm: "HEDONIC" as const,
    hasWater: true,
    hasElectricity: false,
    hasRefuseCollection: false,
    hasSecurity: false,
    hasWifi: false,
    hasBorehole: false,
    hasDriveway: false,
    hasPool: false,
    hasGenerator: false,
    hasSolarPower: false,
    yearBuilt: 1995,
    contactName: "Farai Mupamhanga",
    contactPhone: "+263 73 678 9012",
    contactEmail: null,
    amenities: [],
    images: [],
  },
  {
    title: "4-Bedroom House in Greenside",
    description: "Executive family home in prestigious Greenside. Fully equipped kitchen, double garage, borehole, swimming pool.",
    address: "23 Greenside Close",
    suburb: "Greenside",
    latitude: -18.9500,
    longitude: 32.6400,
    price: 712,
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 200,
    propertyType: "HOUSE" as const,
    listingType: "WHOLE_HOUSE" as const,
    status: "AVAILABLE" as const,
    houseConstruction: "BRICK" as const,
    roofType: "TILES" as const,
    wallCondition: "EXCELLENT" as const,
    windowCondition: "EXCELLENT" as const,
    bathroomType: "SHOWER_AND_TUB" as const,
    contactRole: "PROPERTY_MANAGER" as const,
    algorithm: "COST_APPROACH" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: true,
    hasWifi: true,
    hasBorehole: true,
    hasDriveway: true,
    hasPool: true,
    hasGenerator: true,
    hasSolarPower: false,
    yearBuilt: 2012,
    contactName: "Mufaro Chikwanda",
    contactPhone: "+263 77 111 2233",
    contactEmail: "mufaro@example.com",
    amenities: ["Double garage", "Borehole", "Pool"],
    images: [],
  },
  {
    title: "2-Bedroom Cottage in Dangamvura",
    description: "Cozy standalone cottage with garden. Water and electricity. Ideal for a small family.",
    address: "56 Dangamvura Crescent",
    suburb: "Dangamvura",
    latitude: -18.9800,
    longitude: 32.6700,
    price: 204,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 65,
    propertyType: "COTTAGE" as const,
    listingType: "WHOLE_HOUSE" as const,
    status: "AVAILABLE" as const,
    houseConstruction: "MIXED" as const,
    roofType: "IRON_SHEETS" as const,
    wallCondition: "GOOD" as const,
    windowCondition: "FAIR" as const,
    bathroomType: "SHOWER_ONLY" as const,
    contactRole: "LANDLORD" as const,
    algorithm: "COMPARABLE_SALES" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: false,
    hasWifi: false,
    hasBorehole: false,
    hasDriveway: false,
    hasPool: false,
    hasGenerator: false,
    hasSolarPower: false,
    yearBuilt: 2001,
    contactName: "Shamiso Mhuru",
    contactPhone: "+263 78 555 6677",
    contactEmail: null,
    amenities: ["Garden"],
    images: [],
  },
  {
    title: "Townhouse in Yeovil",
    description: "Semi-detached townhouse in a small complex. Gated, quiet area close to schools.",
    address: "7 Yeovil Lane",
    suburb: "Yeovil",
    latitude: -18.9550,
    longitude: 32.6480,
    price: 342,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 110,
    propertyType: "TOWNHOUSE" as const,
    listingType: "WHOLE_HOUSE" as const,
    status: "RENTED" as const,
    houseConstruction: "BRICK" as const,
    roofType: "TILES" as const,
    wallCondition: "GOOD" as const,
    windowCondition: "GOOD" as const,
    bathroomType: "SHOWER_AND_TUB" as const,
    contactRole: "ESTATE_AGENT" as const,
    algorithm: "HEDONIC" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: true,
    hasWifi: false,
    hasBorehole: false,
    hasDriveway: true,
    hasPool: false,
    hasGenerator: false,
    hasSolarPower: false,
    yearBuilt: 2010,
    contactName: "Nyasha Chirume",
    contactPhone: "+263 71 888 9900",
    contactEmail: "nyasha@example.com",
    amenities: ["Complex pool", "Parking"],
    images: [],
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean up in order (transactions first due to FK constraints)
  await prisma.transaction.deleteMany();
  await prisma.pricePrediction.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  console.log("👤 Creating users...");
  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Brian Ngoma",
      email: "admin@mutare.ac.zw",
      password: adminPassword,
      role: "ADMIN",
      phone: "+263 77 100 0001",
    },
  });
  console.log(`  ✓ Admin: ${admin.email} (password: admin123)`);

  const demoUser = await prisma.user.create({
    data: {
      name: "Tendai Moyo",
      email: "user@mutare.ac.zw",
      password: userPassword,
      role: "USER",
      phone: "+263 77 234 5678",
    },
  });
  console.log(`  ✓ User: ${demoUser.email} (password: user123)`);

  const demoUser2 = await prisma.user.create({
    data: {
      name: "Rudo Nyambuya",
      email: "rudo@mutare.ac.zw",
      password: userPassword,
      role: "USER",
      phone: "+263 71 456 7890",
    },
  });
  console.log(`  ✓ User: ${demoUser2.email} (password: user123)\n`);

  // Seed properties — assign to users
  console.log("🏠 Creating properties...");
  const createdProperties = [];
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const userId = i < 3 ? demoUser.id : i < 5 ? demoUser2.id : admin.id;
    const created = await prisma.property.create({
      data: { ...prop, userId },
    });
    createdProperties.push(created);
    console.log(`  ✓ Created: ${prop.title} (by ${i < 3 ? "Tendai" : i < 5 ? "Rudo" : "Admin"})`);
  }

  // Seed sample transactions
  console.log("\n💰 Creating sample transactions...");
  const transactions = [
    {
      propertyId: createdProperties[5].id, // Yeovil townhouse (RENTED)
      buyerId: demoUser.id,
      listedPrice: 342,
      soldPrice: 330,
      predictedPrice: 342,
      status: "SOLD" as const,
      listedAt: new Date("2025-02-15"),
      soldAt: new Date("2025-02-20"),
    },
    {
      propertyId: createdProperties[1].id, // Morningside flat
      buyerId: demoUser2.id,
      listedPrice: 388,
      soldPrice: 375,
      predictedPrice: 388,
      status: "PENDING" as const,
      listedAt: new Date("2025-03-01"),
      soldAt: null,
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
    console.log(`  ✓ Transaction: $${tx.listedPrice} listed → $${tx.soldPrice ?? "pending"} (predicted: $${tx.predictedPrice})`);
  }

  // Seed sample requisitions
  console.log("\n🔔 Creating sample requisitions...");
  await prisma.requisition.create({
    data: {
      userId: demoUser.id,
      suburb: "Greenside",
      propertyType: "HOUSE",
      listingType: "WHOLE_HOUSE",
      minBedrooms: 3,
      maxBedrooms: 4,
      maxBudget: 500,
      hasWater: true,
      hasElectricity: true,
      hasSecurity: true,
      hasWifi: false,
      notes: "Looking for a quiet family home near a school.",
      status: "OPEN",
      estimatedMin: 380,
      estimatedMax: 480,
    },
  });
  console.log("  ✓ Requisition: Greenside 3-4 bed house (Tendai)");

  console.log(`\n✅ Seeded: 3 users, ${properties.length} properties, ${transactions.length} transactions, 1 requisition.`);
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin: admin@mutare.ac.zw / admin123");
  console.log("   User:  user@mutare.ac.zw / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
