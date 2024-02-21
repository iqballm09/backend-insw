/*
  Warnings:

  - Added the required column `npwp` to the `td_do_requestor_form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "td_depo" ALTER COLUMN "id_kabkota" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_requestor_form" ADD COLUMN     "npwp" VARCHAR(16) NOT NULL;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;
