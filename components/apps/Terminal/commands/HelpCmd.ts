import { commands } from "./commands";

const spaceWidth = 20;
const HelpCmd = () => {

    let out = ""
    for (const cmd in commands) {
        out += `${cmd}${' '.repeat(spaceWidth - cmd.length)}${commands[cmd].desc}\n`;
    }

    return out
        .slice(0, -1); //remove the last added new line
};

export default HelpCmd;