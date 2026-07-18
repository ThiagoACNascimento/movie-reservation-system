-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'default');

-- CreateEnum
CREATE TYPE "MovieStatus" AS ENUM ('upcoming', 'showing', 'archived');

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
    "status" "MovieStatus" NOT NULL DEFAULT 'upcoming',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL,
    "poster_url" VARCHAR(256) NOT NULL,
    "min_age" INTEGER NOT NULL DEFAULT 0,
    "synopsis" VARCHAR(4000) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_session" (
    "id" TEXT NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "movie_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,

    CONSTRAINT "movie_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenreToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GenreToMovie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "movie_slug_key" ON "movie"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "genre_name_key" ON "genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "room_name_key" ON "room"("name");

-- CreateIndex
CREATE INDEX "movie_session_room_id_idx" ON "movie_session"("room_id");

-- CreateIndex
CREATE INDEX "movie_session_movie_id_start_at_idx" ON "movie_session"("movie_id", "start_at");

-- CreateIndex
CREATE UNIQUE INDEX "movie_session_room_id_start_at_key" ON "movie_session"("room_id", "start_at");

-- CreateIndex
CREATE INDEX "_GenreToMovie_B_index" ON "_GenreToMovie"("B");

-- AddForeignKey
ALTER TABLE "movie_session" ADD CONSTRAINT "movie_session_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_session" ADD CONSTRAINT "movie_session_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
