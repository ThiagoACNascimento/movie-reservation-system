-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'default');

-- CreateEnum
CREATE TYPE "Classification" AS ENUM ('L', '6', '10', '12', '14', '16', '18');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "password_hash" VARCHAR(72) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'default',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie" (
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

    CONSTRAINT "movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gender" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "gender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenderToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GenderToMovie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "movie_slug_key" ON "movie"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "gender_name_key" ON "gender"("name");

-- CreateIndex
CREATE INDEX "_GenderToMovie_B_index" ON "_GenderToMovie"("B");

-- AddForeignKey
ALTER TABLE "_GenderToMovie" ADD CONSTRAINT "_GenderToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "gender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenderToMovie" ADD CONSTRAINT "_GenderToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
