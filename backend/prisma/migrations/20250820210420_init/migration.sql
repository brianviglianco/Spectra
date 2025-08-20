-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Domain" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CrawlSession" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "screenshotPath" TEXT,
    "harPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CrawlSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Violation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CrawlSession" ADD CONSTRAINT "CrawlSession_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "public"."Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Violation" ADD CONSTRAINT "Violation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CrawlSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
