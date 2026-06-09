import { Entity, Column } from 'typeorm';
import { ActivityStatus, AbstractTenantEntity } from '@app/shared-types';

@Entity('activities')
export class ActivityEntity extends AbstractTenantEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  semester: string;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.PENDING,
  })
  status: ActivityStatus;
}
