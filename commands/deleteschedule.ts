import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import prisma from "../lib/prisma";
import { deleteJob } from "../lib/cronJobs";

export const data = new SlashCommandBuilder()
  .setName("deleteschedule")
  .setDescription("時報を削除します")
  .addNumberOption((option) =>
    option
      .setName("id")
      .setDescription("削除する時報のIDを指定します")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  const id = interaction.options.data.find((option) => option.name === "id")
    ?.value as number;
  const scheduledMessage = await prisma.scheduledMessage.findUnique({
    where: {
      id,
    },
  });
  if (!scheduledMessage) {
    await interaction.reply({
      content: "時報が見つかりません",
      ephemeral: true,
    });
    return;
  }
  if (scheduledMessage.guildId !== interaction.guildId) {
    await interaction.reply({
      content: "時報が見つかりません",
      ephemeral: true,
    });
    return;
  }
  await prisma.scheduledMessage.delete({
    where: {
      id,
    },
  });
  deleteJob(id.toString());
  await interaction.reply({
    content: `ID: ${id}の時報を削除しました`,
  });
};
