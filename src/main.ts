import { Plugin } from "obsidian";

export default class AdmonitionRenderPlugin extends Plugin {

	onload() {
		this.registerMarkdownPostProcessor((el) => {
			this.renderAdmonitions(el);
		});
	}

	renderAdmonitions(container: HTMLElement) {
		const textNodes: Text[] = [];

		const walker = document.createTreeWalker(
			container,
			NodeFilter.SHOW_TEXT,
			null
		);

		while (walker.nextNode()) {
			textNodes.push(walker.currentNode as Text);
		}

		for (const node of textNodes) {
			const text = node.textContent;
			if (!text) continue;

			const regex = /!!!\s+(\w+)\s+"([^"]+)"\n([\s\S]*?)(?=\n{2,}|$)/g;
			const matches = [...text.matchAll(regex)];
			if (matches.length === 0) continue;

			for (const match of matches) {
				const full = match[0];
				const type = match[1];
				const title = match[2];
				const body = match[3];

				if (!full || !type || !title || !body) continue; // 타입 가드

				const lines = body
					.split("\n")
					.map(l => l.replace(/^\s+/, ""))
					.filter(l => l.trim().length > 0);

				// --- callout DOM 생성 ---
				const callout = document.createElement("div");
				callout.className = `callout callout-${type}`;

				const titleDiv = document.createElement("div");
				titleDiv.className = "callout-title";

				const iconDiv = document.createElement("div");
				iconDiv.className = "callout-icon";

				const titleInner = document.createElement("div");
				titleInner.className = "callout-title-inner";
				titleInner.textContent = title; // 이제 타입 에러 없음

				titleDiv.appendChild(iconDiv);
				titleDiv.appendChild(titleInner);

				const contentDiv = document.createElement("div");
				contentDiv.className = "callout-content";

				for (const line of lines) {
					const p = document.createElement("p");
					p.textContent = line;
					contentDiv.appendChild(p);
				}

				callout.appendChild(titleDiv);
				callout.appendChild(contentDiv);

				// --- 기존 텍스트 교체 ---
				if (node.parentNode && match.index !== undefined) {
					const before = text.slice(0, match.index);
					const after = text.slice(match.index + full.length);

					const frag = document.createDocumentFragment();
					if (before) frag.append(document.createTextNode(before));
					frag.append(callout);
					if (after) frag.append(document.createTextNode(after));

					node.parentNode.replaceChild(frag, node);
				}
			}
		}
	}
}
