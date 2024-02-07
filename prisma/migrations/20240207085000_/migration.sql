/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RequestorTypeEnum" AS ENUM ('CO', 'FF');

-- DropForeignKey
ALTER TABLE "td_do_requestor_form" DROP CONSTRAINT "td_do_requestor_form_id_jenis_requestor_fkey";

-- AlterTable
ALTER TABLE "td_do_requestor_form" ADD COLUMN     "roleId" INTEGER;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateTable
CREATE TABLE "RequestorType" (
    "id" SERIAL NOT NULL,
    "name" "RequestorTypeEnum" NOT NULL,

    CONSTRAINT "RequestorType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "td_do_requestor_form" ADD CONSTRAINT "td_do_requestor_form_id_jenis_requestor_fkey" FOREIGN KEY ("id_jenis_requestor") REFERENCES "RequestorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_requestor_form" ADD CONSTRAINT "td_do_requestor_form_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
