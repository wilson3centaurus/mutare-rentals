-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'FLAT', 'ROOM', 'TOWNHOUSE', 'COTTAGE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RENTED', 'PENDING');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Mutare',
    "province" TEXT NOT NULL DEFAULT 'Manicaland',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "squareMeters" DOUBLE PRECISION,
    "propertyType" "PropertyType" NOT NULL DEFAULT 'HOUSE',
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "amenities" TEXT[],
    "images" TEXT[],
    "hasWater" BOOLEAN NOT NULL DEFAULT false,
    "hasElectricity" BOOLEAN NOT NULL DEFAULT false,
    "hasRefuseCollection" BOOLEAN NOT NULL DEFAULT false,
    "hasSecurity" BOOLEAN NOT NULL DEFAULT false,
    "yearBuilt" INTEGER,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricePrediction" (
    "id" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "squareMeters" DOUBLE PRECISION,
    "hasWater" BOOLEAN NOT NULL,
    "hasElectricity" BOOLEAN NOT NULL,
    "hasSecurity" BOOLEAN NOT NULL,
    "predictedPrice" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricePrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_suburb_idx" ON "Property"("suburb");

-- CreateIndex
CREATE INDEX "Property_price_idx" ON "Property"("price");

-- CreateIndex
CREATE INDEX "Property_bedrooms_idx" ON "Property"("bedrooms");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");
