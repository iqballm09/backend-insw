-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CO', 'SL');

-- CreateEnum
CREATE TYPE "StatusDo" AS ENUM ('Draft', 'Submitted', 'Processed', 'Released', 'Rejected');

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
    "order_id" TEXT NOT NULL,
    "timezone" TEXT,
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
    "nib" VARCHAR(255) NOT NULL,
    "npwp" VARCHAR(255) NOT NULL,
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
    "id_metode_bayar" INTEGER,
    "nama_vessel" TEXT NOT NULL,
    "no_voyage" TEXT NOT NULL,
    "no_bc11" TEXT,
    "tanggal_bc11" TIMESTAMP(3),
    "pos_number" TEXT,
    "call_sign" TEXT,
    "no_do_release" TEXT,
    "tgl_reqdo_exp" TIMESTAMP(3),
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
    "nama_shipper" TEXT NOT NULL,
    "nama_consignee" TEXT NOT NULL,
    "npwp_consignee" TEXT NOT NULL,
    "nama_notifyparty" TEXT NOT NULL,
    "npwp_notifyparty" TEXT NOT NULL,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "td_parties_detail_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_kontainer_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_sizeType" TEXT NOT NULL,
    "id_ownership" INTEGER NOT NULL,
    "id_gross_weight_unit" TEXT NOT NULL,
    "no_kontainer" TEXT NOT NULL,
    "gross_weight" DOUBLE PRECISION NOT NULL,
    "updated_by" TEXT,
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
    "id_kabkota" TEXT NOT NULL,
    "id_kontainer" INTEGER NOT NULL,
    "created_by" VARCHAR(255) NOT NULL,
    "npwp" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "kode_pos" TEXT NOT NULL,
    "no_telp" TEXT NOT NULL,

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
    "id_jenis_bl" TEXT NOT NULL,
    "no_bl" TEXT NOT NULL,
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
    "id_bl" INTEGER NOT NULL,
    "no_vin" VARCHAR(255) NOT NULL,

    CONSTRAINT "td_do_vin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td_do_invoice_form" (
    "id" SERIAL NOT NULL,
    "id_reqdo_header" INTEGER NOT NULL,
    "id_currency" TEXT NOT NULL,
    "id_bank" TEXT NOT NULL,
    "no_invoice" TEXT NOT NULL,
    "tgl_invoice" TIMESTAMP(3) NOT NULL,
    "total_payment" INTEGER NOT NULL,
    "no_rekening" TEXT NOT NULL,
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
    "id_jenis_dok" TEXT NOT NULL,
    "no_dok" TEXT NOT NULL,
    "tgl_dok" TIMESTAMP(3) NOT NULL,
    "filepath_dok" TEXT NOT NULL,
    "updated_by" TEXT,
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
    "note" TEXT,

    CONSTRAINT "td_reqdo_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "td_reqdo_header_form_no_reqdo_key" ON "td_reqdo_header_form"("no_reqdo");

-- CreateIndex
CREATE UNIQUE INDEX "td_reqdo_header_form_order_id_key" ON "td_reqdo_header_form"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_requestor_form_id_reqdo_header_key" ON "td_do_requestor_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_req_form_id_reqdo_header_key" ON "td_do_req_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_parties_detail_form_id_reqdo_header_key" ON "td_parties_detail_form"("id_reqdo_header");

-- CreateIndex
CREATE UNIQUE INDEX "td_depo_id_kontainer_key" ON "td_depo"("id_kontainer");

-- CreateIndex
CREATE UNIQUE INDEX "td_do_bl_form_id_reqdo_header_key" ON "td_do_bl_form"("id_reqdo_header");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_reqdo_header_form" ADD CONSTRAINT "td_reqdo_header_form_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "td_depo" ADD CONSTRAINT "td_depo_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_depo" ADD CONSTRAINT "td_depo_id_kontainer_fkey" FOREIGN KEY ("id_kontainer") REFERENCES "td_do_kontainer_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_nonkontainer_form" ADD CONSTRAINT "td_do_nonkontainer_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_bl_form" ADD CONSTRAINT "td_do_bl_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_vin" ADD CONSTRAINT "td_do_vin_id_bl_fkey" FOREIGN KEY ("id_bl") REFERENCES "td_do_bl_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_invoice_form" ADD CONSTRAINT "td_do_invoice_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_do_dok_form" ADD CONSTRAINT "td_do_dok_form_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_reqdo_status" ADD CONSTRAINT "td_reqdo_status_id_reqdo_header_fkey" FOREIGN KEY ("id_reqdo_header") REFERENCES "td_reqdo_header_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
