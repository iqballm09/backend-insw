/*
  Warnings:

  - You are about to drop the column `enum_name` on the `td_reqdo_status` table. All the data in the column will be lost.
  - Changed the type of `name` on the `td_reqdo_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "td_reqdo_status_name_key";

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- AlterTable
ALTER TABLE "td_reqdo_status" DROP COLUMN "enum_name",
DROP COLUMN "name",
ADD COLUMN     "name" "StatusDo" NOT NULL;
