import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

export const posterUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/posters',
    filename: (res, file, callback) => {
      const extName = extname(file.originalname);
      const filename = `${randomUUID()}${extName}`;
      callback(null, filename);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      return callback(
        new BadRequestException('Only image files are allowed'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
