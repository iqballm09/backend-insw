/*
  Warnings:

  - You are about to drop the column `kode_pos` on the `td_do_req_form` table. All the data in the column will be lost.
  - You are about to drop the column `no_bl` on the `td_do_vin` table. All the data in the column will be lost.
  - Added the required column `id_bl` to the `td_do_vin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "td_do_req_form" DROP COLUMN "kode_pos",
ADD COLUMN     "pos_number" VARCHAR(45);

-- AlterTable
ALTER TABLE "td_do_vin" DROP COLUMN "no_bl",
ADD COLUMN     "id_bl" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- AddForeignKey
ALTER TABLE "td_do_vin" ADD CONSTRAINT "td_do_vin_id_bl_fkey" FOREIGN KEY ("id_bl") REFERENCES "td_do_bl_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
