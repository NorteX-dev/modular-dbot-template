import { Column, Entity } from "typeorm";

import { WithIdAndTimestamps } from "../../util";

@Entity({ name: "settings" })
export default class SettingsEntity extends WithIdAndTimestamps {
	@Column("text", { unique: true, nullable: false })
	guildId!: string;

	@Column("text", { nullable: true })
	exampleSetting?: string;
}
