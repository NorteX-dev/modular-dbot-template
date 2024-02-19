import { Column, Entity } from "typeorm";
import { WithIdAndTimestamps } from "../../lib/typeormBaseEntity";

@Entity({ name: "settings" })
export default class SettingsEntity extends WithIdAndTimestamps {
	@Column("text", { unique: true, nullable: false })
	guildId!: string;

	// @Column("text")
	// commissionLog?: string;
}
