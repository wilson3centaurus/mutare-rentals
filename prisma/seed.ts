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
    price: 350,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 120,
    propertyType: "HOUSE" as const,
    status: "AVAILABLE" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: true,
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
    price: 420,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 75,
    propertyType: "FLAT" as const,
    status: "AVAILABLE" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: true,
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
    price: 80,
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 20,
    propertyType: "ROOM" as const,
    status: "AVAILABLE" as const,
    hasWater: true,
    hasElectricity: false,
    hasRefuseCollection: false,
    hasSecurity: false,
    yearBuilt: 1995,
    contactName: "Farai Mupamhanga",
    contactPhone: "+263 73 678 9012",
    contactEmail: null,
    amenities: [],
    images: [],
  },
  {
    title: "4-Bedroom House in Greenside",
    description: "Executive family home in prestigious Greenside. Fully equipped kitchen, double garage.",
    address: "23 Greenside Close",
    suburb: "Greenside",
    latitude: -18.9500,
    longitude: 32.6400,
    price: 650,
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 200,
    propertyType: "HOUSE" as const,
    status: "AVAILABLE" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: true,
    yearBuilt: 2012,
    contactName: "Mufaro Chikwanda",
    contactPhone: "+263 77 111 2233",
    contactEmail: "mufaro@example.com",
    amenities: ["Double garage", "Borehole", "Garden cottage"],
    images: [],
  },
  {
    title: "2-Bedroom Cottage in Dangamvura",
    description: "Cozy standalone cottage with garden. Water and electricity. Ideal for a small family.",
    address: "56 Dangamvura Crescent",
    suburb: "Dangamvura",
    latitude: -18.9800,
    longitude: 32.6700,
    price: 220,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 65,
    propertyType: "COTTAGE" as const,
    status: "AVAILABLE" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: false,
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
    price: 380,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 110,
    propertyType: "TOWNHOUSE" as const,
    status: "RENTED" as const,
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: true,
    hasSecurity: true,
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
      listedPrice: 380,
      soldPrice: 350,
      predictedPrice: 365,
      status: "SOLD" as const,
      listedAt: new Date("2025-02-15"),
      soldAt: new Date("2025-02-20"),
    },
    {
      propertyId: createdProperties[1].id, // Morningside flat
      buyerId: demoUser2.id,
      listedPrice: 420,
      soldPrice: 400,
      predictedPrice: 412,
      status: "PENDING" as const,
      listedAt: new Date("2025-03-01"),
      soldAt: null,
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
    console.log(`  ✓ Transaction: $${tx.listedPrice} → $${tx.soldPrice ?? "pending"} (AI predicted: $${tx.predictedPrice})`);
  }

  console.log(`\n✅ Seeded: ${3} users, ${properties.length} properties, ${transactions.length} transactions.`);
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin: admin@mutare.ac.zw / admin123");
  console.log("   User:  user@mutare.ac.zw / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
