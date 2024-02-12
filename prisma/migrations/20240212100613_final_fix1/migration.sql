/*
  Warnings:

  - Added the required column `enum_name` to the `td_reqdo_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- AlterTable
ALTER TABLE "td_reqdo_status" ADD COLUMN     "enum_name" "StatusDo" NOT NULL;
