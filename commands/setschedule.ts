import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import prisma from "../lib/prisma";
import { setCronJobs } from "..";

export const data = new SlashCommandBuilder()
  .setName("setschedule")
  .setDescription("時報する時刻とメッセージを設定します")
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("時報する時刻を設定します")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription(
        "時報するメッセージを設定します(未設定の場合はデフォルトのメッセージを使用します)"
      )
      .setRequired(false)
  );
export async function execute(interaction: CommandInteraction) {
  const time = interaction.options.data.find((option) => option.name === "time")
    ?.value as string;
  const message = interaction.options.data.find(
    (option) => option.name === "message"
  )?.value as string ?? `${time}をお知らせします`;

  if (!time) {
    await interaction.reply({
      content: "時刻を設定してください",
      ephemeral: true,
    });
    return;
  }

  const [hour, minute] = time.split(":");
  if (hour >= "24" || minute >= "60") {
    await interaction.reply({
      content:
        "不正な時間入力です。00 ~ 23時 または 00 ~ 59分の値を入力してください。",
      ephemeral: true,
    });
    return;
  }

  //データベースに登録
  const data = {
    guildId: interaction.guildId as string,
    channelId: interaction.channelId as string,
    time: time as string,
    message: message as string,
  };

  const scheduledMessage = await prisma.scheduledMessage.create({
    data: {
      guildId: data.guildId,
      channelId: data.channelId,
      scheduleTime: data.time,
      message: data.message,
      isActive: true,
    },
  });

  //cronjobを設定
  setCronJobs(scheduledMessage);

  await interaction.reply({
    content: `${time}に時報を設定しました。`,
  });
};
