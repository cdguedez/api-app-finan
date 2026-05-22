-- CreateTable
CREATE TABLE "users" (
    "id"              UUID         NOT NULL DEFAULT gen_random_uuid(),
    "first_name"      VARCHAR(100) NOT NULL,
    "last_name"       VARCHAR(100) NOT NULL,
    "email"           VARCHAR(255) NOT NULL,
    "password_hash"   TEXT         NOT NULL,
    "biometric_token" TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
