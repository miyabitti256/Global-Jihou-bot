import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import prisma from "../lib/prisma";

export const data = new SlashCommandBuilder()
  .setName("scheduleindex")
  .setDescription("時報の一覧を表示します");

export async function execute(interaction: CommandInteraction) {
  const guildId = interaction.guildId as string;
  const scheduledMessages = await prisma.scheduledMessage.findMany({
    where: {
      guildId,
    },
  });
  const embed = new EmbedBuilder().setTitle("時報の一覧");
  scheduledMessages.forEach((scheduledMessage) => {
    embed.addFields({
      name: `ID: ${scheduledMessage.id} 時刻: ${scheduledMessage.scheduleTime}`,
      value: `${scheduledMessage.message}`,
    });
  });
  await interaction.reply({ embeds: [embed] });
};
