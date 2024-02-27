/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `td_reqdo_header_form` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateIndex
CREATE UNIQUE INDEX "td_reqdo_header_form_order_id_key" ON "td_reqdo_header_form"("order_id");
