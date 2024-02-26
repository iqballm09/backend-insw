-- AlterTable
ALTER TABLE "td_do_bl_form" ALTER COLUMN "id_jenis_bl" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_dok_form" ALTER COLUMN "id_jenis_dok" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_invoice_form" ALTER COLUMN "id_bank" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;
