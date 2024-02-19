import { BaseEntity, BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { nanoid } from "nanoid";

export abstract class WithIdAndTimestamps extends BaseEntity {
	@PrimaryColumn({ type: "varchar", length: 12 })
	id!: string;

	@BeforeInsert()
	assignId() {
		this.id = nanoid(12);
	}

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
