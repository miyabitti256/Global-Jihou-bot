import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import prisma from "../lib/prisma";
import { deleteJob, updateJobs } from "../lib/cronJobs";

export const data = new SlashCommandBuilder()
  .setName("editschedule")
  .setDescription("時報を編集します IDはscheduleindexで確認できます")
  .addNumberOption((option) =>
    option
      .setName("id")
      .setDescription("編集する時報のIDを指定します")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("編集する時報の時刻を指定します")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("編集する時報のメッセージを指定します")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("channel")
      .setDescription("メッセージを送信するチャンネルを変更します")
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("isactive")
      .setDescription("時報を有効にするかどうかを指定します")
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  const id = interaction.options.data.find((option) => option.name === "id")
    ?.value as number;

  const scheduledMessage = await prisma.scheduledMessage.findUnique({
    where: {
      id,
    },
  });

  const time = interaction.options.data.find((option) => option.name === "time")
    ?.value as string;

  const message = interaction.options.data.find(
    (option) => option.name === "message"
  )?.value as string;

  const channelId = interaction.options.data.find(
    (option) => option.name === "channel"
  )?.value as string;

  const isActive = interaction.options.data.find(
    (option) => option.name === "isactive"
  )?.value as boolean;

  const [hour, minute] = time.split(":");
  if (hour >= "24" || minute >= "60") {
    await interaction.reply({
      content:
        "不正な時間入力です。00 ~ 23時 または 00 ~ 59分の値を入力してください。",
      ephemeral: true,
    });
    return;
  }

  if (channelId) {
    const channel = await interaction.guild?.channels.fetch(channelId);
    if (!channel) {
      await interaction.reply({
        content: "チャンネルが見つかりません",
        ephemeral: true,
      });
      return;
    }
  }
  
  if (!scheduledMessage) {
    await interaction.reply({
      content: "時報が見つかりません",
      ephemeral: true,
    });
    return;
  }

  if (scheduledMessage.guildId !== interaction.guildId) {
    await interaction.reply({
      content: "この時報は編集できません",
      ephemeral: true,
    });
    return;
  }

  const updatedScheduledMessage = await prisma.scheduledMessage.update({
    where: {
      id,
    },
    data: {
      scheduleTime: time ?? scheduledMessage.scheduleTime,
      message: message ?? scheduledMessage.message,
      channelId: channelId ?? scheduledMessage.channelId,
      isActive: isActive ?? scheduledMessage.isActive,
    },
  });

  if (isActive) {
    await updateJobs(id.toString(), updatedScheduledMessage);
  } else {
    deleteJob(id.toString());
  }

  await interaction.reply({
    content: `ID:${id}の時報を編集しました。`,
  });
}
