import { Plugin } from 'obsidian';

export default class ZensicalRenderPlugin extends Plugin {
    async onload() {
        this.registerMarkdownPostProcessor((el, ctx) => {
            const paragraphs = el.querySelectorAll("p");

            paragraphs.forEach((p) => {
                const text = p.innerText.trim();

                // !!!, ???, ???+ 문법 통합 감지
                const match = text.match(/^(!{3}|\?{3}\+?)\s+(\w+)(?:\s+(.*))?/);
                
                if (match && match[1] && match[2]) {
                    const syntax = match[1];
                    const type = match[2];
                    const title = match[3];

                    const isCollapsible = syntax.startsWith("???");
                    const isDefaultOpen = syntax.endsWith("+");

                    const calloutEl = document.createElement("div");
                    calloutEl.className = `callout admo-${type}`;
                    calloutEl.setAttribute("data-callout", type);

                    // 접기 기능 클래스 추가
                    if (isCollapsible) {
                        calloutEl.classList.add("is-collapsible");
                        if (!isDefaultOpen) {
                            calloutEl.classList.add("is-collapsed");
                        }
                    }

                    const titleEl = calloutEl.createEl("div", { cls: "callout-title" });
                    titleEl.createEl("div", { cls: "callout-icon" });
                    titleEl.createEl("div", { 
                        cls: "callout-title-inner", 
                        text: title || (type.charAt(0).toUpperCase() + type.slice(1)) 
                    });

                    // 접기 아이콘 추가
                    if (isCollapsible) {
                        titleEl.createEl("div", { cls: "callout-fold" });
                    }

                    calloutEl.createEl("div", { cls: "callout-content" });
                    
                    p.replaceWith(calloutEl);
                }
            });
        });
    }
}
