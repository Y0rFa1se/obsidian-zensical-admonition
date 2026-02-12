import { Plugin } from "obsidian";

export default class AdmonitionToCalloutPlugin extends Plugin {

	onload() {
		console.log("AdmonitionToCalloutPlugin loaded");

		this.registerMarkdownPostProcessor((el, ctx) => {
			this.processAdmonitions(el);
		});
	}

	processAdmonitions(container: HTMLElement) {
		// 모든 pre > code 블록 또는 일반 텍스트 노드 탐색
		const walker = document.createTreeWalker(
			container,
			NodeFilter.SHOW_TEXT,
			null
		);

		const textNodes: Text[] = [];
		while (walker.nextNode()) {
			textNodes.push(walker.currentNode as Text);
		}

		for (const node of textNodes) {
			const text = node.textContent;
			if (!text) continue;

			// !!! asdf "zxcv" 패턴 감지
			const regex = /!!!\s+(\w+)\s+"([^"]+)"\n([\s\S]*?)(?=\n{2,}|$)/g;

			if (!regex.test(text)) continue;

			const newHTML = text.replace(regex, (_, type, title, body) => {
				const lines = body
					.split("\n")
					.map((l: string) => l.replace(/^\s+/, "")) // indent 제거
					.filter((l: string) => l.trim().length > 0);

				const calloutLines = [
					`> [!${type}] ${title}`,
					...lines.map((l: string) => `> ${l}`)
				];

				return calloutLines.join("\n");
			});

			// DOM 치환
			const span = document.createElement("span");
			span.className = "admonition-callout-rendered";
			span.innerText = newHTML;

			if (node.parentNode) {
				node.parentNode.replaceChild(span, node);
			}
		}
	}
}
