import HelpCmd from "./HelpCmd";
import HistoryCmd from "./HistoryCmd";

type Command = {
    desc: string;
    execute: () => string; // must return output of the command
}

type CommandDict = {
    [key: string]: Command
}

export const commands: CommandDict = {
    "help": {
        desc: "Provides description of commands",
        execute: HelpCmd
    },
    "history": {
        desc: "Displays command history list",
        execute: HistoryCmd
    }
}

export function processPrompt(prompt: string): string {

    const args = prompt
        .split(' ')
        .filter((i) => i); //removes empty strings

    if (!args.length)
        return '';

    const cmd = commands[args[0]];
    return cmd?.execute() ?? `${args[0]}: command not found`

}