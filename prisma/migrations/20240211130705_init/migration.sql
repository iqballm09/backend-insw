-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CO', 'SL');

-- CreateEnum
CREATE TYPE "RequestorTypeEnum" AS ENUM ('CO', 'FF');

-- CreateEnum
CREATE TYPE "StatusDo" AS ENUM ('Draft', 'Submitted', 'Checking', 'Released', 'Rejected');

-- CreateTable
CREATE TABLE "RequestorType" (
    "id" SERIAL NOT NULL,
    "name" "RequestorTypeEnum" NOT NULL,

    CONSTRAINT "RequestorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" "UserRole" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "hash" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_reqdo_header_form" (
    "id" SERIAL NOT NULL,
    "no_reqdo" TEXT NOT NULL DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text,
    "tgl_reqdo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255) NOT NULL,

    CONSTRAINT "td_reqdo_header_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_requestor_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_jenis_requestor" INTEGER NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "nib" VARCHAR(15) NOT NULL,
    "alamat" VARCHAR(255) NOT NULL,
    "filepath_suratkuasa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "roleId" INTEGER,

    CONSTRAINT "td_do_requestor_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_req_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_terminal_op" TEXT,
    "id_shippingline" TEXT NOT NULL,
    "id_metode_bayar" INTEGER NOT NULL,
    "nama_vessel" VARCHAR(45) NOT NULL,
    "no_voyage" VARCHAR(20) NOT NULL,
    "no_bc11" VARCHAR(20),
    "tanggal_bc11" TIMESTAMP(3),
    "kode_pos" VARCHAR(45),
    "call_sign" VARCHAR(10),
    "no_do_release" VARCHAR(50),
    "tgl_reqdo_exp" TIMESTAMP(3) NOT NULL,
    "tgl_do_exp" TIMESTAMP(3),
    "tgl_do_release" TIMESTAMP(3),
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_req_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_parties_detail_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_negara_loading" TEXT NOT NULL,
    "id_port_loading" TEXT NOT NULL,
    "id_port_destination" TEXT NOT NULL,
    "id_port_discharge" TEXT NOT NULL,
    "nama_shipper" VARCHAR(255) NOT NULL,
    "nama_consignee" VARCHAR(255) NOT NULL,
    "npwp_consignee" VARCHAR(15) NOT NULL,
    "nama_notifyparty" VARCHAR(255) NOT NULL,
    "npwp_notifyparty" VARCHAR(15) NOT NULL,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_parties_detail_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_kontainer_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_depo" INTEGER,
    "id_sizeType" TEXT NOT NULL,
    "id_ownership" INTEGER NOT NULL,
    "id_gross_weight_unit" TEXT NOT NULL,
    "no_kontainer" VARCHAR(20) NOT NULL,
    "gross_weight" DOUBLE PRECISION NOT NULL,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_kontainer_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sealsOnKontainers" (
    "kontainerId" INTEGER NOT NULL,
    "sealId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "sealsOnKontainers_pkey" PRIMARY KEY ("kontainerId","sealId")
);

-- CreateTable
CREATE TABLE "td_depo" (
    "id" SERIAL NOT NULL,
    "id_kabkota" INTEGER NOT NULL,
    "npwp" VARCHAR(15) NOT NULL,
    "deskripsi" VARCHAR(255) NOT NULL,
    "alamat" VARCHAR(1025) NOT NULL,
    "kode_pos" VARCHAR(5) NOT NULL,
    "no_telp" VARCHAR(20) NOT NULL,
    "td_do_kontainer_formId" INTEGER,

    CONSTRAINT "td_depo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_kontainer_seal" (
    "id" SERIAL NOT NULL,
    "no_seal" TEXT NOT NULL,

    CONSTRAINT "td_do_kontainer_seal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_nonkontainer_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_package_unit" TEXT NOT NULL,
    "id_gross_weight_unit" TEXT NOT NULL,
    "good_desc" TEXT NOT NULL,
    "package_qty" DOUBLE PRECISION NOT NULL,
    "gross_weight" DOUBLE PRECISION NOT NULL,
    "measurement_vol" DOUBLE PRECISION NOT NULL,
    "measurement_unit" VARCHAR(5) NOT NULL,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_nonkontainer_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_bl_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_jenis_bl" INTEGER NOT NULL,
    "no_bl" VARCHAR(50) NOT NULL,
    "tgl_bl" TIMESTAMP(3) NOT NULL,
    "filepath_dok" TEXT NOT NULL,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_bl_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_vin" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "no_bl" VARCHAR(50) NOT NULL,
    "no_vin" VARCHAR(50) NOT NULL,

    CONSTRAINT "td_do_vin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_invoice_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_currency" TEXT NOT NULL,
    "id_bank" INTEGER NOT NULL,
    "no_invoice" VARCHAR(255) NOT NULL,
    "tgl_invoice" TIMESTAMP(3) NOT NULL,
    "total_payment" INTEGER NOT NULL,
    "no_rekening" VARCHAR(30) NOT NULL,
    "filepath_buktibayar" TEXT NOT NULL,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_invoice_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_dok_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_jenis_dok" INTEGER NOT NULL,
    "no_dok" VARCHAR(50) NOT NULL,
    "tgl_dok" TIMESTAMP(3) NOT NULL,
    "filepath_dok" TEXT NOT NULL,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255) NOT NULL,

    CONSTRAINT "td_do_dok_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_reqdo_status" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "name" "StatusDo" NOT NULL,
    "datetime_status" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "td_reqdo_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "td_reqdo_header_form_no_reqdo_key" ON "td_reqdo_header_form"("no_reqdo");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_requestor_form_id_reqdo_header_key" ON "td_do_requestor_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_req_form_id_reqdo_header_key" ON "td_do_req_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_parties_detail_form_id_reqdo_header_key" ON "td_parties_detail_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_depo_td_do_kontainer_formId_key" ON "td_depo"("td_do_kontainer_formId");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_bl_form_id_reqdo_header_key" ON "td_do_bl_form"("id_reqdo_header");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_reqdo_header_form" ADD CONSTRAINT "td_reqdo_header_form_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_requestor_form" ADD CONSTRAINT "td_do_requestor_form_id_jenis_requestor_fkey" FOREIGN KEY ("id_jenis_requestor") REFERENCES "RequestorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_requestor_form" ADD CONSTRAINT "td_do_requestor_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_requestor_form" ADD CONSTRAINT "td_do_requestor_form_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "td_do_vin" ADD CONSTRAINT "td_do_vin_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_invoice_form" ADD CONSTRAINT "td_do_invoice_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_dok_form" ADD CONSTRAINT "td_do_dok_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_reqdo_status" ADD CONSTRAINT "td_reqdo_status_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
