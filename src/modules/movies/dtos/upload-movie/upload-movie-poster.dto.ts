import { ApiProperty } from '@nestjs/swagger';
import { CreateMovieDto } from '../create-movie/create-movie.dto';

export class UploadMoviePosterDto extends CreateMovieDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  poster!: any;
}
