'use client';

import { ReactElement, useRef, useState } from "react";
import Prompt from "./Prompt";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { processPrompt } from "./commands/commands";

const Terminal = (): ReactElement => {

    //Prompt string
    const PS1 = "|•˕•マ ~> ";

    const promptRef = useRef<HTMLElement>(null)
    const [history, setHistory] = useLocalStorage<string[]>(
        "promptHistory", []
    );

    //!Make it buffered?
    const [stdout, setStdout] = useState("");


    const handleClick = () => {
        promptRef.current?.focus();
    };

    const handleSubmit = (prompt: string) => {
        setHistory((values) => [...values, prompt]);

        const output = processPrompt(prompt);
        setStdout(
            stdout
            + PS1
            + prompt + '\n'
            + output 
            + (output && '\n') //append new line when there is output
        );
    };

    return (
        <div
            onClick={handleClick} >
            <div className="whitespace-pre-wrap">
                {stdout}
            </div>
            <span>{PS1}</span>
            <Prompt ref={promptRef}
                history={history}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default Terminal;