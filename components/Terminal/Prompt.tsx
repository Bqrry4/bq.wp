'use client';
import { ChangeEvent, KeyboardEvent, FC, useImperativeHandle, useRef, useState, useLayoutEffect, useEffect } from "react";

type PromptRef = {
	ref: React.Ref<{
		focus: () => void;
	}>,
	history: string[];
	onSubmit(prompt: string): void;
}

const Prompt: FC<PromptRef> = ({ ref, history, onSubmit }) => {

	const [input, setInput] = useState('');
	const inputRef = useRef<HTMLSpanElement>(null);
	//For the cursor position persistance between renders
	const cursorPos = useRef(0);

	const [historyIndex, setHistoryIndex] = useState(history.length);

	//Expose method with ref
	useImperativeHandle(ref, () => ({
		focus: () => {
			inputRef.current?.focus();
		}
	}));

	const saveCursorPosition = () => {
		const selection = window.getSelection();
		if (selection && (selection?.rangeCount > 0)) {
			cursorPos.current = selection.getRangeAt(0).startOffset;
		}
	};

	//When input changes restores the cursor
	useLayoutEffect(() => {
		//Assume there's only a single child text node
		const textNode = inputRef.current?.childNodes[0];
		if (!textNode?.textContent) return;
		const offset = Math.min(cursorPos.current, textNode.textContent.length);
		const range = document.createRange();
		range.setStart(textNode, offset);
		range.collapse(true);

		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);
	}, [input]);

	//Index to max when array changes
	useEffect(() => {
		setHistoryIndex(history.length);
	}, [history.length]);

	//Set the input to history entry when index changes
	useEffect(() => {
		const h_prompt = history[historyIndex] ?? '';
		cursorPos.current = h_prompt.length;
		setInput(h_prompt);
	}, [historyIndex]);



	const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {

		switch (event.key) {
			case "Enter":
				event.preventDefault();
				onSubmit(input);
				setInput('');
				break;

			case "ArrowUp":
			case "ArrowDown":
				event.preventDefault();
				setHistoryIndex(
					event.key === "ArrowUp"
						? Math.max(0, historyIndex - 1)
						: Math.min(history.length, historyIndex + 1)
				);
				break;
		}
	};

	const handleChange = (e: ChangeEvent<HTMLSpanElement>) => {
		saveCursorPosition();
		setInput(e.target.textContent ?? '');
	};

	//! ContentEditable set on plaintext-only when firefox 136 will be released
	return (
		<span ref={inputRef}
			onKeyDown={handleKeyDown}
			onInput={handleChange}
			contentEditable spellCheck="false"
			className=" bg-transparent border-none outline-none
						max-w-full resize-none break-all whitespace-pre-wrap"
		>{input}</span>
	);
};

export default Prompt;