import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({
    description: 'The unique code for the activity',
    example: 'ACT-2026-001',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'The name of the activity',
    example: 'Tuyển sinh đợt 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Semester of the activity', example: 'HK1' })
  @IsString()
  @IsNotEmpty()
  semester: string;
}
