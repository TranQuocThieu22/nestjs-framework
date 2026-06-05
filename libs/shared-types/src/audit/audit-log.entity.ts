import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sys_audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_name', type: 'varchar', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'action', type: 'varchar', length: 20 })
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RESTORE';

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: any;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: any;

  @Column({ name: 'changed_fields', type: 'jsonb', nullable: true })
  changedFields: string[];

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 100, nullable: true })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
