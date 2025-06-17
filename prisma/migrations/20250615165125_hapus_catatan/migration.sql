/*
  Warnings:

  - You are about to drop the column `catatan` on the `PeminjamanBarang` table. All the data in the column will be lost.
  - You are about to drop the column `catatan` on the `PermintaanBarang` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PeminjamanBarang" DROP COLUMN "catatan";

-- AlterTable
ALTER TABLE "PermintaanBarang" DROP COLUMN "catatan";
