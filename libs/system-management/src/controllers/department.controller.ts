import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/iam';
import { Paginate, PaginateQuery, ApiPaginationQuery } from 'nestjs-paginate';
import { DepartmentService } from '../services/department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../dto/department.dto';

@ApiTags('Quản lý Danh mục Đơn vị')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm mới đơn vị (Khoa/Phòng)' })
  create(@Req() req: any, @Body() createDto: CreateDepartmentDto) {
    const tenantId = req.user.tenantId;
    return this.departmentService.create(tenantId, createDto);
  }

  @Get('flat')
  @ApiOperation({
    summary: 'Lấy danh sách đơn vị dạng phẳng (Không phân trang)',
  })
  findAllFlat(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.departmentService.findAllFlat(tenantId);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đơn vị (Có phân trang, search, filter)',
  })
  @ApiPaginationQuery({
    sortableColumns: ['createdAt', 'name', 'code'],
    searchableColumns: ['name', 'code', 'description'],
  })
  findAllPaginated(@Req() req: any, @Paginate() query: PaginateQuery) {
    const tenantId = req.user.tenantId;
    return this.departmentService.findAllPaginated(tenantId, query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Lấy danh sách đơn vị dạng cây phân cấp (Tree)' })
  findAllTree(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.departmentService.findAllTree(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một đơn vị' })
  findOne(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.departmentService.findOne(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin đơn vị' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDepartmentDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.departmentService.update(id, tenantId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn vị (Không cho xóa nếu có đơn vị con)' })
  remove(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.departmentService.remove(id, tenantId);
  }
}
