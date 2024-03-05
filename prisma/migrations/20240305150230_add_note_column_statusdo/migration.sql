-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- AlterTable
ALTER TABLE "td_reqdo_status" ADD COLUMN     "note" TEXT;
