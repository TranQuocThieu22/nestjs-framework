import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActionEntity } from './action.entity';
import { ModuleEntity } from './module.entity';
import { RoleEntity } from './role.entity';

@Entity('iam_role_permissions')
export class RolePermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(() => ModuleEntity)
  @JoinColumn({ name: 'module_id' })
  module: ModuleEntity;

  @ManyToOne(() => ActionEntity)
  @JoinColumn({ name: 'action_id' })
  action: ActionEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
