import { Plugin, MarkdownView } from 'obsidian';

export default class ZensicalRenderPlugin extends Plugin {
    async onload() {
        // 1. 읽기 모드용 프로세서 (기존 코드)
        this.registerMarkdownPostProcessor((el, ctx) => {
            const paragraphs = el.querySelectorAll("p");
            paragraphs.forEach((p) => {
                const text = p.innerText.trim();
                if (text.startsWith("!!!")) {
                    this.renderCallout(p, text);
                }
            });
        });

        // 2. 라이브 프리뷰 지원을 위한 레이아웃 업데이트 감지
        // (참고: 정석은 EditorExtension이지만, 초보 단계에서는 post-processor가 
        // 라이브 프리뷰의 '완성된 블록'에도 적용되도록 설정하는 것이 빠릅니다.)
    }

    renderCallout(el: HTMLElement, text: string) {
        const match = text.match(/^!!!\s+(\w+)(?:\s+(.*))?/);
        if (match && match[1]) {
            const [, type, title] = match;
            const calloutEl = document.createElement("div");
            calloutEl.className = `callout admo-${type}`;
            calloutEl.setAttribute("data-callout", type);

            const titleEl = calloutEl.createEl("div", { cls: "callout-title" });
            titleEl.createEl("div", { cls: "callout-icon" });
            titleEl.createEl("div", { 
                cls: "callout-title-inner", 
                text: title || (type.charAt(0).toUpperCase() + type.slice(1)) 
            });

            calloutEl.createEl("div", { cls: "callout-content" });
            el.replaceWith(calloutEl);
        }
    }
}
