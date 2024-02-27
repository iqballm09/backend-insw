/*
  Warnings:

  - The values [Checking] on the enum `StatusDo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `RequestorType` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusDo_new" AS ENUM ('Draft', 'Submitted', 'Processed', 'Released', 'Rejected');
ALTER TABLE "td_reqdo_status" ALTER COLUMN "name" TYPE "StatusDo_new" USING ("name"::text::"StatusDo_new");
ALTER TYPE "StatusDo" RENAME TO "StatusDo_old";
ALTER TYPE "StatusDo_new" RENAME TO "StatusDo";
DROP TYPE "StatusDo_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "td_do_requestor_form" DROP CONSTRAINT "td_do_requestor_form_id_jenis_requestor_fkey";

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- DropTable
DROP TABLE "RequestorType";

-- DropEnum
DROP TYPE "RequestorTypeEnum";
