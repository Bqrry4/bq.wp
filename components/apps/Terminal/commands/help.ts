import { Command, commands } from "../commands";

const spaceWidth = 20;

export const help: Command = {
    desc: "Provides description of commands",
    execute: () => {

        let out = ""
        for (const cmd in commands) {
            out += `${cmd}${' '.repeat(spaceWidth - cmd.length)}${commands[cmd].desc}\n`;
        }
    
        return out
            .slice(0, -1); //remove the last added new line
    }
}