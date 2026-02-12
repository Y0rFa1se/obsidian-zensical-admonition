import { Plugin, MarkdownView } from 'obsidian';

export default class ZensicalRenderPlugin extends Plugin {
    async onload() {
        // 1. 읽기 모드 프로세서
        this.registerMarkdownPostProcessor((el) => {
            const paragraphs = el.querySelectorAll("p");
            paragraphs.forEach((p) => {
                const text = p.innerText.trim();
                if (/^(!{3}|\?{3}\+?)/.test(text)) {
                    this.replaceWithCallout(p as HTMLElement, text);
                }
            });
        });

        // 2. 라이브 프리뷰 실시간 감시 (0.5초마다 스캔)
        this.registerInterval(window.setInterval(() => this.updateLivePreview(), 500));
    }

    updateLivePreview() {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || activeView.getMode() !== 'source') return;

        const editorEl = activeView.contentEl.querySelectorAll(".cm-line");
        editorEl.forEach((line: HTMLElement) => {
            const text = line.textContent?.trim();
            if (text && /^(!{3}|\?{3}\+?)/.test(text) && !line.querySelector(".callout")) {
                this.replaceWithCallout(line, text);
            }
        });
    }

    replaceWithCallout(el: HTMLElement, text: string) {
        const match = text.match(/^(!{3}|\?{3}\+?)\s+(\w+)(?:\s+(.*))?/);
        
        // match 결과가 있고, syntax와 type이 확실히 존재할 때만 실행
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

            // 접기 설정 적용
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
            
            el.empty();
            el.appendChild(calloutEl);
        }
    }
}
