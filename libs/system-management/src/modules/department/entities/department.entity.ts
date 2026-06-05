import { Entity, Column } from 'typeorm';
import { AbstractTenantEntity } from '@app/shared-types';

export enum DepartmentType {
  SCHOOL = 'SCHOOL',
  FACULTY = 'FACULTY',
  DEPARTMENT = 'DEPARTMENT',
  CENTER = 'CENTER',
  DIVISION = 'DIVISION',
}

export const DepartmentTypeDescription: Record<DepartmentType, string> = {
  [DepartmentType.SCHOOL]: 'Trường',
  [DepartmentType.FACULTY]: 'Khoa',
  [DepartmentType.DEPARTMENT]: 'Phòng ban',
  [DepartmentType.CENTER]: 'Trung tâm',
  [DepartmentType.DIVISION]: 'Bộ môn',
};

@Entity('sys_departments')
export class DepartmentEntity extends AbstractTenantEntity {
  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string; // Tự chiếu tới id của sys_departments

  @Column({ type: 'enum', enum: DepartmentType })
  type: DepartmentType;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
