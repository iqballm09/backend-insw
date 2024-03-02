/*
  Warnings:

  - You are about to drop the column `id_reqdo_header` on the `td_do_vin` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "td_do_vin" DROP CONSTRAINT "td_do_vin_id_reqdo_header_fkey";

-- AlterTable
ALTER TABLE "td_do_vin" DROP COLUMN "id_reqdo_header";

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;
