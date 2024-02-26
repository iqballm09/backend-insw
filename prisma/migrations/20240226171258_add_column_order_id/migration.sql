/*
  Warnings:

  - Added the required column `order_id` to the `td_reqdo_header_form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "td_reqdo_header_form" ADD COLUMN     "order_id" TEXT NOT NULL,
ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;
