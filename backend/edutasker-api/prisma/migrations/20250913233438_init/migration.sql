/*
  Warnings:

  - Changed the type of `action` on the `permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Action" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE');

-- AlterTable
ALTER TABLE "public"."permission" DROP COLUMN "action",
ADD COLUMN     "action" "public"."Action" NOT NULL;
