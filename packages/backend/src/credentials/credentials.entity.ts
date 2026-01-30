import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('google_ads_credentials')
@Index('idx_user_id', ['userId'], { unique: true })
export class GoogleAdsCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string;

  @Column({ name: 'mcc_account_id', type: 'varchar', length: 20, nullable: true })
  mccAccountId?: string;

  @Column({ name: 'accessible_customer_ids', type: 'simple-array', nullable: true })
  accessibleCustomerIds?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
