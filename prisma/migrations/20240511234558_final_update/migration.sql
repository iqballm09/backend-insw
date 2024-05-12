-- AlterTable
ALTER TABLE "td_depo" ALTER COLUMN "npwp" SET DATA TYPE TEXT,
ALTER COLUMN "deskripsi" SET DATA TYPE TEXT,
ALTER COLUMN "alamat" SET DATA TYPE TEXT,
ALTER COLUMN "kode_pos" SET DATA TYPE TEXT,
ALTER COLUMN "no_telp" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_bl_form" ALTER COLUMN "no_bl" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_dok_form" ALTER COLUMN "no_dok" SET DATA TYPE TEXT,
ALTER COLUMN "updated_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_invoice_form" ALTER COLUMN "no_invoice" SET DATA TYPE TEXT,
ALTER COLUMN "no_rekening" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_kontainer_form" ALTER COLUMN "no_kontainer" SET DATA TYPE TEXT,
ALTER COLUMN "updated_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_req_form" ALTER COLUMN "nama_vessel" SET DATA TYPE TEXT,
ALTER COLUMN "no_voyage" SET DATA TYPE TEXT,
ALTER COLUMN "no_bc11" SET DATA TYPE TEXT,
ALTER COLUMN "pos_number" SET DATA TYPE TEXT,
ALTER COLUMN "call_sign" SET DATA TYPE TEXT,
ALTER COLUMN "no_do_release" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_do_requestor_form" ALTER COLUMN "nib" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "npwp" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "td_do_vin" ALTER COLUMN "no_vin" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "td_parties_detail_form" ALTER COLUMN "nama_shipper" SET DATA TYPE TEXT,
ALTER COLUMN "nama_consignee" SET DATA TYPE TEXT,
ALTER COLUMN "npwp_consignee" SET DATA TYPE TEXT,
ALTER COLUMN "nama_notifyparty" SET DATA TYPE TEXT,
ALTER COLUMN "npwp_notifyparty" SET DATA TYPE TEXT,
ALTER COLUMN "updated_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;
