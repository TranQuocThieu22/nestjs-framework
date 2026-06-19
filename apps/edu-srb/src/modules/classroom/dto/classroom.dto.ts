import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty({ description: 'Mã phòng học' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Tên phòng học' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Sức chứa', required: false, default: 30 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;
}

export class UpdateClassroomDto extends PartialType(CreateClassroomDto) {}
