import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

export const data = new SlashCommandBuilder()
  .setName("omikuji")
  .setDescription("一日に一度おみくじを引きます 毎朝5時に更新されます");

export async function execute(interaction: CommandInteraction) {
  const user = await prisma.user.findUnique({
    where: {
      id: interaction.user.id,
    },
  });
  if (!user) {
    await prisma.user.create({
      data: {
        id: interaction.user.id,
        name: interaction.user.displayName,
        lastDrawDate: new Date(0),
      },
    });
  }
  const currentDate = new Date(
    new Date().toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
    })
  );
  currentDate.setHours(currentDate.getHours() - 5);
  const lastDrawDate = new Date(
    user?.lastDrawDate?.toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
    }) || new Date(0)
  );

  if (!lastDrawDate || !isSameDay(currentDate, lastDrawDate)) {
    await interaction.deferReply();
    const result = drawOmikuji();
    console.log(result);

    await prisma.user.update({
      where: { id: interaction.user.id },
      data: { lastDrawDate: currentDate },
    });

    let replyMessage = `おみくじの結果は ${result} です!`;

    if (result === "ぬべ吉" || result === "ヌベキチ└(՞ةڼ◔)」") {
      const guild = interaction.guild;
      if (guild) {
        const role = guild.roles.cache.find((role) => role.name === result);
        if (role) {
          try {
            const member = await guild.members.fetch(interaction.user.id);
            if (member.roles.cache.has(role.id)) {
              logger.info(
                `${member.displayName} は ${result} ロールを既に持っています`
              );
            } else {
              await member.roles.add(role);
              logger.info(
                `${member.displayName} に ${result} ロールを追加しました`
              );
            }
          } catch (error) {
            logger.error(`ロール追加中にエラーが発生しました: ${error}`);
            replyMessage += "\nロールの付与中にエラーが発生しました。";
          }
        } else {
          logger.warn(`${result} ロールが見つかりません`);
        }
      } else {
        logger.warn("ギルドが見つかりません");
      }
    }

    setTimeout(async () => {
      await interaction.editReply(replyMessage);
    }, 3000);
  } else {
    await interaction.reply("おみくじは一日に一度しか引けません");
  }

  function drawOmikuji() {
    const results = [
      { result: "ぬべ吉", weight: 1 }, // 1%
      { result: "ヌベキチ└(՞ةڼ◔)」", weight: 2 }, //2%
      { result: "大凶", weight: 5 }, // 5%
      { result: "大吉", weight: 8 }, // 8%
      { result: "吉", weight: 12 }, // 12%
      { result: "凶", weight: 12 }, // 12%
      { result: "中吉", weight: 16 }, // 16%
      { result: "小吉", weight: 22 }, // 22%
      { result: "末吉", weight: 22 }, // 22%
    ];
    const totalWeight = results.reduce((sum, result) => sum + result.weight, 0);
    let randomNumber = Math.floor(Math.random() * totalWeight);
    for (const result of results) {
      randomNumber -= result.weight;
      if (randomNumber <= 0) {
        return result.result;
      }
    }
  }

  function isSameDay(date1: Date, date2: Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
