export type Command = {
    desc: string;
    execute: (args?: string[]) => string; // must return output of the command
}

type CommandDict = {
    [key: string]: Command
}

export const commands: CommandDict = {}

/**
    Loads the ./commands sub dir using webpack's RequireContext.
    //! Might not be the best choice, not sure.
*/
function loadCommands() {
    const context = require.context('./commands', false, /\.ts$/);
    context.keys().map((key) => {
        const cmd: Record<string, Command> = context(key);

        const name = Object.keys(cmd)[0];
        commands[name] = cmd[name];
    })

};
/* This is server side so call immediately */
loadCommands();

export function processPrompt(prompt: string): string {

    const args = prompt
        .split(' ')
        .filter((i) => i); //removes empty strings

    if (!args.length)
        return '';

    const cmd = commands[args[0]];
    return cmd?.execute(args.slice(1)) ?? `${args[0]}: command not found`

}