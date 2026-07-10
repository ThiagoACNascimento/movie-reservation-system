-- CreateEnum
CREATE TYPE "Classification" AS ENUM ('L', '6', '10', '12', '14', '16', '18');

-- CreateTable
CREATE TABLE "movies" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "slug" VARCHAR(256) NOT NULL,
    "release_date" TIMESTAMPTZ NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL,
    "classification" "Classification" NOT NULL,
    "gender" TEXT[],
    "synopsis" VARCHAR(4000) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movies_slug_key" ON "movies"("slug");
