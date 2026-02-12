import { Plugin } from 'obsidian';

export default class CalloutConverterPlugin extends Plugin {
    async onload() {
        this.registerMarkdownPostProcessor((element) => {
            const lines = element.querySelectorAll("p, div, pre");

            lines.forEach((el) => {
                const text = el.textContent || "";
                const match = text.match(/^(!!!|\?\?\?\+?)\s+(\S+)(?:\s+"([^"]+)")?\s*(.*)$/);

                if (match && match[2]) {
                    const type = match[2].toLowerCase();
                    const quotedTitle = match[3];
                    const remainingTitle = match[4] ? match[4].trim() : "";
                    const title = quotedTitle || remainingTitle || type;

                    const container = el.parentElement;
                    if (!container) return;

                    const calloutEl = document.createElement("div");
                    calloutEl.addClass("callout");
                    calloutEl.setAttr("data-callout", type);

                    const titleEl = calloutEl.createDiv({ cls: "callout-title" });
                    titleEl.createDiv({ cls: "callout-icon" });
                    titleEl.createDiv({ cls: "callout-title-inner", text: title });

                    const contentEl = calloutEl.createDiv({ cls: "callout-content" });

                    let nextEl = el.nextElementSibling;
                    const elementsToRemove: Element[] = [];

                    while (nextEl) {
                        const nextText = nextEl.textContent || "";
                        const isIndented = nextEl.tagName === "PRE" || 
                                         (nextEl instanceof HTMLElement && nextEl.style.paddingLeft !== "") ||
                                         /^\s+/.test(nextText);

                        if (isIndented) {
                            const wrapper = document.createElement("div");
                            wrapper.innerHTML = nextEl.innerHTML;
                            contentEl.appendChild(wrapper);
                            elementsToRemove.push(nextEl);
                            nextEl = nextEl.nextElementSibling;
                        } else {
                            break;
                        }
                    }

                    el.replaceWith(calloutEl);
                    elementsToRemove.forEach(node => node.remove());
                }
            });
        });
    }
}
