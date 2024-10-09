import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const { token, clientId } = process.env;

const rest = new REST({ version: "10" }).setToken(token as string);

(async () => {
  try {
    console.log("Started deleting commands.");

    await rest.put(Routes.applicationCommands(clientId as string), { body: [] });

    console.log("Successfully deleted all commands.");
  } catch (error) {
    console.error(error);
  }
})();
