import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({ example: 'KH-558', description: 'Activity Code' })
  code: string;

  @ApiProperty({ example: 'HD-0001', description: 'Activity Name' })
  name: string;

  @ApiProperty({ example: 'HK1', description: 'Semester' })
  semester: string;
}
