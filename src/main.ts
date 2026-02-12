import { Plugin } from 'obsidian';

export default class ZensicalRenderPlugin extends Plugin {
    async onload() {
        this.registerMarkdownPostProcessor((el, ctx) => {
            const paragraphs = el.querySelectorAll("p");

            paragraphs.forEach((p) => {
                const text = p.innerText.trim();

                // !!!, ???, ???+ 문법 통합 감지 정규식
                const match = text.match(/^(!{3}|\?{3}\+?)\s+(\w+)(?:\s+(.*))?/);
                
                if (match && match[1] && match[2]) {
                    const syntax = match[1];
                    const type = match[2];
                    const title = match[3];

                    const isCollapsible = syntax.startsWith("???");
                    const isDefaultOpen = syntax.endsWith("+");

                    const calloutEl = document.createElement("div");
                    
                    // 옵시디언 표준 클래스 부여
                    calloutEl.className = `callout admo-${type}`;
                    calloutEl.setAttribute("data-callout", type);

                    // 접기 설정 (??? 문법일 때만)
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

                    // 접기 화살표 아이콘 추가 (??? 문법일 때만)
                    if (isCollapsible) {
                        titleEl.createEl("div", { cls: "callout-fold" });
                    }

                    const contentEl = calloutEl.createEl("div", { cls: "callout-content" });
                    contentEl.createEl("p", { text: "" }); 

                    p.replaceWith(calloutEl);
                }
            });
        });
    }
}
