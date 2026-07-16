-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'default');

-- CreateEnum
CREATE TYPE "Classification" AS ENUM ('L', '6', '10', '12', '14', '16', '18');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "password_hash" VARCHAR(72) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'default',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "original_title" VARCHAR(256) NOT NULL,
    "slug" VARCHAR(256) NOT NULL,
    "release_date" TIMESTAMPTZ NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL,
    "poster_url" VARCHAR(256) NOT NULL,
    "classification" "Classification" NOT NULL,
    "synopsis" VARCHAR(4000) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gender" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Gender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenderToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GenderToMovie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_slug_key" ON "Movie"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Gender_name_key" ON "Gender"("name");

-- CreateIndex
CREATE INDEX "_GenderToMovie_B_index" ON "_GenderToMovie"("B");

-- AddForeignKey
ALTER TABLE "_GenderToMovie" ADD CONSTRAINT "_GenderToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "Gender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenderToMovie" ADD CONSTRAINT "_GenderToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
