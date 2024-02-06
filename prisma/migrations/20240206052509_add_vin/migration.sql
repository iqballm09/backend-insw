-- DropForeignKey
ALTER TABLE "sealsOnKontainers" DROP CONSTRAINT "sealsOnKontainers_kontainerId_fkey";

-- DropForeignKey
ALTER TABLE "sealsOnKontainers" DROP CONSTRAINT "sealsOnKontainers_sealId_fkey";

-- DropForeignKey
ALTER TABLE "td_depo" DROP CONSTRAINT "td_depo_td_do_kontainer_formId_fkey";

-- DropForeignKey
ALTER TABLE "td_do_bl_form" DROP CONSTRAINT "td_do_bl_form_id_reqdo_header_fkey";

-- DropForeignKey
ALTER TABLE "td_do_dok_form" DROP CONSTRAINT "td_do_dok_form_id_reqdo_header_fkey";

-- DropForeignKey
ALTER TABLE "td_do_invoice_form" DROP CONSTRAINT "td_do_invoice_form_id_reqdo_header_fkey";

-- DropForeignKey
ALTER TABLE "td_do_kontainer_form" DROP CONSTRAINT "td_do_kontainer_form_id_reqdo_header_fkey";

-- DropForeignKey
ALTER TABLE "td_do_nonkontainer_form" DROP CONSTRAINT "td_do_nonkontainer_form_id_reqdo_header_fkey";

-- DropForeignKey
ALTER TABLE "td_do_req_form" DROP CONSTRAINT "td_do_req_form_id_reqdo_header_fkey";

-- DropForeignKey
ALTER TABLE "td_parties_detail_form" DROP CONSTRAINT "td_parties_detail_form_id_reqdo_header_fkey";

-- DropForeignKey
ALTER TABLE "td_reqdo_status" DROP CONSTRAINT "td_reqdo_status_id_reqdo_header_fkey";

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateTable
CREATE TABLE "td_do_vin" (
    "id" SERIAL NOT NULL,
    "id_bl" INTEGER NOT NULL,
    "no_vin" VARCHAR(50) NOT NULL,

    CONSTRAINT "td_do_vin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "td_do_vin_id_bl_key" ON "td_do_vin"("id_bl");

-- AddForeignKey
ALTER TABLE "td_do_req_form" ADD CONSTRAINT "td_do_req_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_parties_detail_form" ADD CONSTRAINT "td_parties_detail_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_kontainer_form" ADD CONSTRAINT "td_do_kontainer_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sealsOnKontainers" ADD CONSTRAINT "sealsOnKontainers_kontainerId_fkey" FOREIGN KEY ("kontainerId") REFERENCES "td_do_kontainer_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sealsOnKontainers" ADD CONSTRAINT "sealsOnKontainers_sealId_fkey" FOREIGN KEY ("sealId") REFERENCES "td_do_kontainer_seal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_depo" ADD CONSTRAINT "td_depo_td_do_kontainer_formId_fkey" FOREIGN KEY ("td_do_kontainer_formId") REFERENCES "td_do_kontainer_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_nonkontainer_form" ADD CONSTRAINT "td_do_nonkontainer_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_bl_form" ADD CONSTRAINT "td_do_bl_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_vin" ADD CONSTRAINT "td_do_vin_id_bl_fkey" FOREIGN KEY ("id_bl") REFERENCES "td_do_bl_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_invoice_form" ADD CONSTRAINT "td_do_invoice_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_dok_form" ADD CONSTRAINT "td_do_dok_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_reqdo_status" ADD CONSTRAINT "td_reqdo_status_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
