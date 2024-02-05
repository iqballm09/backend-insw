/*
  Warnings:

  - You are about to drop the column `id_do_kontainer` on the `td_do_kontainer_seal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "td_do_kontainer_seal" DROP CONSTRAINT "td_do_kontainer_seal_id_do_kontainer_fkey";

-- AlterTable
ALTER TABLE "td_do_kontainer_seal" DROP COLUMN "id_do_kontainer";

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateTable
CREATE TABLE "sealsOnKontainers" (
    "kontainerId" INTEGER NOT NULL,
    "sealId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "sealsOnKontainers_pkey" PRIMARY KEY ("kontainerId","sealId")
);

-- AddForeignKey
ALTER TABLE "sealsOnKontainers" ADD CONSTRAINT "sealsOnKontainers_kontainerId_fkey" FOREIGN KEY ("kontainerId") REFERENCES "td_do_kontainer_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sealsOnKontainers" ADD CONSTRAINT "sealsOnKontainers_sealId_fkey" FOREIGN KEY ("sealId") REFERENCES "td_do_kontainer_seal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
