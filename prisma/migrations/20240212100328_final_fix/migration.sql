/*
  Warnings:

  - Changed the type of `name` on the `td_reqdo_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- AlterTable
ALTER TABLE "td_reqdo_status" DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "td_reqdo_status_name_key" ON "td_reqdo_status"("name");
