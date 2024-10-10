import {
  ActivityType,
  Client,
  Collection,
  CommandInteraction,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import dotenv from "dotenv";
import logger from "./lib/logger";
import fs from "fs";
import { schedule, type ScheduledTask } from "node-cron";
import prisma from "./lib/prisma";
import type { ScheduledMessage } from "@prisma/client";
dotenv.config({ path: ".env" });

interface Command {
  data: {
    name: string;
  };
  // eslint-disable-next-line no-unused-vars
  execute: (interaction: CommandInteraction) => Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const { DISCORD_BOT_TOKEN } = process.env;

const collection = new Collection<string, Command>();
const botStartTime = new Date();
export const cronJobs = new Map<string, ScheduledTask>();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".ts"));
for (const file of commandFiles) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const command = require(`./commands/${file}`);
  if (command && command.data) {
    collection.set(command.data.name, command);
  } else {
    logger.error(`Error: ${file} does not export a 'data' property.`);
  }
}

client.on("guildCreate", async (guild) => {
  logger.info(`${guild.name}に参加しました。`);
  try {
    await prisma.guild.create({
      data: {
        id: guild.id,
        name: guild.name,
        joinedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error("Error creating guild:", error);
  }
  //サーバーに参加したらぬべ吉とヌベキチ└(՞ةڼ◔)」という名前のロールがあるか確認してロールをサーバーに追加
  const role = guild.roles.cache.find((role) => role.name === "ぬべ吉");
  if (!role) {
    guild.roles.create({
      name: "ぬべ吉",
      color: "#f0ff00",
    });
  }
  const role2 = guild.roles.cache.find(
    (role) => role.name === "ヌベキチ└(՞ةڼ◔)」"
  );
  if (!role2) {
    guild.roles.create({
      name: "ヌベキチ└(՞ةڼ◔)」",
      color: "#b32be8",
    });
  }
});

client.on("guildDelete", async (guild) => {
  logger.info(`${guild.name}から退出しました。`);
  try {
    await prisma.guild.delete({
      where: {
        id: guild.id,
      },
    });
  } catch (error) {
    logger.error("Error deleting guild:", error);
  }
});

client.on("messageCreate", (message) => {
  if (message.author.bot) {
    return;
  }
  const now = new Date();
  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const nowS = now.getSeconds();
  const nowMS = now.getMilliseconds();

  if (message.content === "今何時？") {
    message.channel.send(
      `現在の時刻は${nowH}時${nowM}分${nowS}秒${nowMS}です。`
    );
  }
  if (message.content === "!ちんぽ") {
    message.channel.send("黙れ小僧");
  }
  if (message.content === "!お尻叩いて") {
    message.channel.send(
      `${nowH}時${nowM}分をお知らせします。 お尻を叩いて欲しいとはとんだ変態だな。
      いいだろう、ほら、ケツを出せよ。ふむ、全然叩き甲斐がなさそうなケツをしてるな。もっと大臀筋を鍛えてから出直してこい。`
    );
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = collection.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: "コマンドが見つかりません",
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
    logger.info(`${interaction.guild?.name}で${interaction.commandName}が実行されました。`);
  } catch (error) {
    logger.error(error);
    await interaction.reply({
      content: "コマンドの実行に失敗しました。",
      ephemeral: true,
    });
  }
});

async function init() {
  client.on("ready", (c) => {
    logger.info(`${c.user.tag}がログインしました。`);
    updateStatus();
  });
  await initCronJobs();
  schedule(
    `${botStartTime.getSeconds()} ${botStartTime.getMinutes()} * * * *`,
    () => updateStatus()
  );
  await client.login(DISCORD_BOT_TOKEN);
}

function updateStatus(): void {
  const now = new Date();
  const h = Math.floor(
    (now.getTime() - botStartTime.getTime()) / (1000 * 60 * 60)
  );
  const statusMessage = `${h}時間連続稼働中`;
  client.user?.setActivity(statusMessage, { type: ActivityType.Custom });
}

async function getSchedules() {
  return await prisma.scheduledMessage.findMany({
    where: {
      isActive: true,
    },
  });
}

export function setCronJobs(task: ScheduledMessage) {
  const [hour, minute] = task.scheduleTime.split(":").map(Number);
  const cronJob = schedule(`${minute} ${hour} * * *`, () => {
    client.channels.fetch(task.channelId).then((channel) => {
      if (channel instanceof TextChannel) {
        channel.send(task.message);
      }
    });
  });
  cronJobs.set(task.id.toString(), cronJob);
}

async function initCronJobs() {
  const schedules = await getSchedules();
  schedules.forEach((schedule) => {
    setCronJobs(schedule);
  });
}

init().catch((error) => {
  logger.error(error);
  process.exit(error.code);
});
