import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Mã trường (sẽ dùng làm ID và tên Database)',
    example: 'hust',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Mã trường chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  code: string;

  @ApiProperty({
    description: 'Tên trường Đại học',
    example: 'Đại học Bách Khoa Hà Nội',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Mô tả chi tiết',
    required: false,
    example: 'Trường kỹ thuật đa ngành hàng đầu',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
