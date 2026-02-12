import { Plugin } from 'obsidian';

export default class ZensicalRenderPlugin extends Plugin {
    async onload() {
        this.registerMarkdownPostProcessor((el, ctx) => {
            const paragraphs = el.querySelectorAll("p");

            paragraphs.forEach((p) => {
                const text = p.innerText.trim();

                if (text.startsWith("!!!")) {
                    const match = text.match(/^!!!\s+(\w+)(?:\s+(.*))?/);
                    if (match && match[1]) {
                        const type = match[1];
                        const title = match[2];

                        const calloutEl = document.createElement("div");
                        calloutEl.className = `callout admo-${type}`;
                        calloutEl.setAttribute("data-callout", type);

                        const titleEl = calloutEl.createEl("div", { cls: "callout-title" });
                        titleEl.createEl("div", { cls: "callout-icon" });
                        titleEl.createEl("div", { 
                            cls: "callout-title-inner", 
                            text: title || (type.charAt(0).toUpperCase() + type.slice(1)) 
                        });

                        const contentEl = calloutEl.createEl("div", { cls: "callout-content" });
                        p.replaceWith(calloutEl);
                    }
                }
            });
        });
    }
}
