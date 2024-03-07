-- AlterTable
ALTER TABLE "td_parties_detail_form" ALTER COLUMN "npwp_consignee" SET DATA TYPE VARCHAR(16),
ALTER COLUMN "npwp_notifyparty" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;
