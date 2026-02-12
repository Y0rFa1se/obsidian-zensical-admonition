import { Plugin } from 'obsidian';

export default class CalloutConverterPlugin extends Plugin {
    async onload() {
        this.registerMarkdownPostProcessor((element, context) => {
            // 문단(p)이나 div 태그 중 !!! 또는 ???로 시작하는 요소를 찾습니다.
            const blocks = element.querySelectorAll("p, div");

            blocks.forEach((block) => {
                const text = block.textContent?.trim() || "";
                const match = text.match(/^(!!!|\?\?\?\+?)\s*(\S+)(.*)$/);

                // match가 존재하고 필요한 그룹들이 있는지 확인
                if (match && match[2]) {
                    const type = match[2].toLowerCase();
                    const title = (match[3] || "").trim();

                    // 기존 텍스트를 비우고 옵시디언 콜아웃 구조로 변경
                    block.empty();
                    block.addClass("callout");
                    block.setAttr("data-callout", type);

                    // 콜아웃 타이틀 영역 생성
                    const titleEl = block.createDiv({ cls: "callout-title" });
                    
                    // 아이콘 영역 (옵시디언 테마가 자동으로 아이콘을 삽입하도록 클래스 설정)
                    titleEl.createDiv({ cls: "callout-icon" });
                    
                    // 제목 텍스트 영역
                    const displayTitle = title || type.charAt(0).toUpperCase() + type.slice(1);
                    titleEl.createDiv({ 
                        cls: "callout-title-inner", 
                        text: displayTitle
                    });

                    // 본문 컨테이너 생성 (실제 본문 내용은 마크다운 구조상 다음 형제 요소에 있을 확률이 높음)
                    block.createDiv({ cls: "callout-content" });
                }
            });
        });
    }
}
