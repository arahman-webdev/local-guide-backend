-- CreateTable
CREATE TABLE "SSLCommerzTransaction" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sessionKey" TEXT,
    "gatewayUrl" TEXT,
    "valId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bankTransaction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SSLCommerzTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SSLCommerzTransaction_transactionId_key" ON "SSLCommerzTransaction"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "SSLCommerzTransaction_bookingId_key" ON "SSLCommerzTransaction"("bookingId");

-- AddForeignKey
ALTER TABLE "SSLCommerzTransaction" ADD CONSTRAINT "SSLCommerzTransaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
