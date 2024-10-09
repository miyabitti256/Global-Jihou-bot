import dotenv from "dotenv";
import { REST, Routes, type APIApplicationCommand } from "discord.js";
import { readdirSync } from "fs";

dotenv.config({ path: ".env" });

const commands: APIApplicationCommand[] = [];
const commandFiles = readdirSync("./commands").filter((file) => file.endsWith("ts"));

console.log(commandFiles);

for (const file of commandFiles) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const command = require(`../commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN as string
);

async function registerCommands() {
  try {
    console.log("Registering commands...");
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID as string),
      { body: commands }
    );
    console.log("Successfully registered commands.");
  } catch (error) {
    console.error(error);
  }
} 

registerCommands().catch((error) => {
  console.error(error);
  process.exit(1);
});

