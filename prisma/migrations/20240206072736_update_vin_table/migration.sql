/*
  Warnings:

  - A unique constraint covering the columns `[id_reqdo_header]` on the table `td_do_vin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_reqdo_header` to the `td_do_vin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "td_do_vin" ADD COLUMN     "id_reqdo_header" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateIndex
CREATE UNIQUE INDEX "td_do_vin_id_reqdo_header_key" ON "td_do_vin"("id_reqdo_header");

-- AddForeignKey
ALTER TABLE "td_do_vin" ADD CONSTRAINT "td_do_vin_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
