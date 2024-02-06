-- AlterTable
ALTER TABLE "User" ALTER COLUMN "hash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;
