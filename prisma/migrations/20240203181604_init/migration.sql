-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CO', 'SL');

-- CreateEnum
CREATE TYPE "StatusDo" AS ENUM ('Draft', 'Submitted', 'Checking', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" "UserRole" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_reqdo_header_form" (
    "id" BIGSERIAL NOT NULL,
    "no_reqdo" VARCHAR(35) NOT NULL,
    "tgl_reqdo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255) NOT NULL,

    CONSTRAINT "td_reqdo_header_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_requestor_form" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "id_jenis_requestor" INTEGER NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "nib" VARCHAR(15) NOT NULL,
    "alamat" VARCHAR(255) NOT NULL,
    "filepath_suratkuasa" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_requestor_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_req_form" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "id_terminal_op" INTEGER NOT NULL,
    "id_shippingline" INTEGER NOT NULL,
    "id_metode_bayar" INTEGER NOT NULL,
    "nama_vessel" VARCHAR(45) NOT NULL,
    "no_voyage" VARCHAR(20) NOT NULL,
    "no_bc11" VARCHAR(20) NOT NULL,
    "tanggal_bc11" TIMESTAMP(3) NOT NULL,
    "kode_pos" VARCHAR(45) NOT NULL,
    "call_sign" VARCHAR(10) NOT NULL,
    "no_do_release" VARCHAR(50) NOT NULL,
    "tgl_reqdo_exp" TIMESTAMP(3) NOT NULL,
    "tgl_do_exp" TIMESTAMP(3) NOT NULL,
    "tgl_do_release" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_req_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_parties_detail_form" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "id_negara_loading" INTEGER NOT NULL,
    "id_port_loading" INTEGER NOT NULL,
    "id_port_destination" INTEGER NOT NULL,
    "id_port_discharge" INTEGER NOT NULL,
    "nama_shipper" VARCHAR(255) NOT NULL,
    "nama_consignee" VARCHAR(255) NOT NULL,
    "npwp_consignee" VARCHAR(15) NOT NULL,
    "nama_notifyparty" VARCHAR(255) NOT NULL,
    "npwp_notifyparty" VARCHAR(15) NOT NULL,
    "updated_by" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_parties_detail_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_kontainer_form" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "id_depo" INTEGER NOT NULL,
    "id_sizeType" INTEGER NOT NULL,
    "id_ownership" INTEGER NOT NULL,
    "id_gross_weight_unit" INTEGER NOT NULL,
    "no_kontainer" VARCHAR(20) NOT NULL,
    "gross_weight" DOUBLE PRECISION NOT NULL,
    "updated_by" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_kontainer_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_kontainer_seal" (
    "id" BIGSERIAL NOT NULL,
    "id_do_kontainer" BIGINT NOT NULL,
    "no_seal" TEXT NOT NULL,

    CONSTRAINT "td_do_kontainer_seal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_nonkontainer_form" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "id_package_unit" INTEGER NOT NULL,
    "id_gross_weight_unit" INTEGER NOT NULL,
    "good_desc" TEXT NOT NULL,
    "package_qty" DOUBLE PRECISION NOT NULL,
    "gross_weight" DOUBLE PRECISION NOT NULL,
    "measurement_vol" DOUBLE PRECISION NOT NULL,
    "measurement_unit" VARCHAR(5) NOT NULL,
    "updated_by" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_nonkontainer_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_bl_form" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "id_jenis_bl" INTEGER NOT NULL,
    "no_bl" VARCHAR(50) NOT NULL,
    "tgl_bl" TIMESTAMP(3) NOT NULL,
    "filepath_dok" TEXT NOT NULL,
    "updated_by" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_bl_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_invoice_form" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "id_currency" INTEGER NOT NULL,
    "id_bank" INTEGER NOT NULL,
    "no_invoice" VARCHAR(255) NOT NULL,
    "tgl_invoice" TIMESTAMP(3) NOT NULL,
    "total_payment" VARCHAR(45) NOT NULL,
    "no_rekening" VARCHAR(30) NOT NULL,
    "filepath_buktibayar" TEXT NOT NULL,
    "updated_by" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_do_invoice_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_dok_form" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "id_jenis_dok" INTEGER NOT NULL,
    "no_dok" VARCHAR(50) NOT NULL,
    "tgl_dok" TIMESTAMP(3) NOT NULL,
    "filepath_dok" TEXT NOT NULL,
    "updated_by" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255) NOT NULL,

    CONSTRAINT "td_do_dok_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_reqdo_status" (
    "id" BIGSERIAL NOT NULL,
    "id_reqdo_header" BIGINT NOT NULL,
    "name" "StatusDo" NOT NULL,
    "datetime_status" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "td_reqdo_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_requestor_form_id_reqdo_header_key" ON "td_do_requestor_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_req_form_id_reqdo_header_key" ON "td_do_req_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_parties_detail_form_id_reqdo_header_key" ON "td_parties_detail_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_kontainer_form_id_reqdo_header_key" ON "td_do_kontainer_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_kontainer_seal_id_do_kontainer_key" ON "td_do_kontainer_seal"("id_do_kontainer");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_nonkontainer_form_id_reqdo_header_key" ON "td_do_nonkontainer_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_bl_form_id_reqdo_header_key" ON "td_do_bl_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_invoice_form_id_reqdo_header_key" ON "td_do_invoice_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_dok_form_id_reqdo_header_key" ON "td_do_dok_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_reqdo_status_id_reqdo_header_key" ON "td_reqdo_status"("id_reqdo_header");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_reqdo_header_form" ADD CONSTRAINT "td_reqdo_header_form_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_requestor_form" ADD CONSTRAINT "td_do_requestor_form_id_jenis_requestor_fkey" FOREIGN KEY ("id_jenis_requestor") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_requestor_form" ADD CONSTRAINT "td_do_requestor_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_req_form" ADD CONSTRAINT "td_do_req_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_parties_detail_form" ADD CONSTRAINT "td_parties_detail_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_kontainer_form" ADD CONSTRAINT "td_do_kontainer_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_kontainer_seal" ADD CONSTRAINT "td_do_kontainer_seal_id_do_kontainer_fkey" FOREIGN KEY ("id_do_kontainer") REFERENCES "td_do_kontainer_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_nonkontainer_form" ADD CONSTRAINT "td_do_nonkontainer_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_bl_form" ADD CONSTRAINT "td_do_bl_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_invoice_form" ADD CONSTRAINT "td_do_invoice_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_dok_form" ADD CONSTRAINT "td_do_dok_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_reqdo_status" ADD CONSTRAINT "td_reqdo_status_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
