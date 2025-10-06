/*
  Warnings:

  - You are about to drop the `closedOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `openOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('BUY', 'SELL');

-- DropForeignKey
ALTER TABLE "public"."closedOrder" DROP CONSTRAINT "closedOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."openOrder" DROP CONSTRAINT "openOrder_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "balance" SET DEFAULT 5000,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(15,2);

-- DropTable
DROP TABLE "public"."closedOrder";

-- DropTable
DROP TABLE "public"."openOrder";

-- CreateTable
CREATE TABLE "public"."open_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "type" "public"."OrderType" NOT NULL,
    "boughtPrice" DECIMAL(15,2) NOT NULL,
    "qty" DECIMAL(18,8) NOT NULL,
    "margin" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "open_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."closed_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "type" "public"."OrderType" NOT NULL,
    "boughtPrice" DECIMAL(15,2) NOT NULL,
    "closedPrice" DECIMAL(15,2) NOT NULL,
    "qty" DECIMAL(18,8) NOT NULL,
    "margin" DECIMAL(15,2) NOT NULL,
    "pnl" DECIMAL(15,2) NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "closed_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "open_orders_userId_idx" ON "public"."open_orders"("userId");

-- CreateIndex
CREATE INDEX "open_orders_asset_idx" ON "public"."open_orders"("asset");

-- CreateIndex
CREATE INDEX "open_orders_createdAt_idx" ON "public"."open_orders"("createdAt");

-- CreateIndex
CREATE INDEX "closed_orders_userId_idx" ON "public"."closed_orders"("userId");

-- CreateIndex
CREATE INDEX "closed_orders_asset_idx" ON "public"."closed_orders"("asset");

-- CreateIndex
CREATE INDEX "closed_orders_closedAt_idx" ON "public"."closed_orders"("closedAt");

-- AddForeignKey
ALTER TABLE "public"."open_orders" ADD CONSTRAINT "open_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."closed_orders" ADD CONSTRAINT "closed_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
