import { Entity, Column } from 'typeorm';
import { AbstractTenantEntity } from '@app/shared-types';

@Entity('srb_classrooms')
export class ClassroomEntity extends AbstractTenantEntity {
  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', default: 30 })
  capacity: number;
}
