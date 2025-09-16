/*
  Warnings:

  - A unique constraint covering the columns `[name,code]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."roles_name_key";

-- AlterTable
ALTER TABLE "public"."roles" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_code_key" ON "public"."roles"("name", "code");
