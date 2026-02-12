import { Plugin, Editor } from 'obsidian';

export default class CalloutConverterPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'convert-to-callout',
            name: 'Convert custom syntax to callout',
            editorCallback: (editor: Editor) => {
                const lineCount = editor.lineCount();
                
                for (let i = 0; i < lineCount; i++) {
                    const line = editor.getLine(i);
                    const match = line.match(/^(\s*)(!!!|\?\?\?\+?)\s*(\S+)(.*)$/);

                    if (match) {
                        const indent = match[1] ?? "";
                        const type = match[3] ?? "note";
                        const title = (match[4] ?? "").trim();

                        const newLine = `${indent}> [!${type}]${title ? ' ' + title : ''}`;
                        editor.setLine(i, newLine);

                        let j = i + 1;
                        while (j < lineCount) {
                            const nextLine = editor.getLine(j);
                            
                            if (nextLine.trim() !== '' && !nextLine.startsWith(indent)) break;
                            
                            const nextNextLine = editor.getLine(j + 1);
                            if (nextLine.trim() === '' && (j + 1 < lineCount && nextNextLine && !nextNextLine.startsWith(indent))) break;

                            const content = nextLine.startsWith(indent) ? nextLine.slice(indent.length) : nextLine;
                            editor.setLine(j, `${indent}> ${content}`);
                            j++;
                        }
                        i = j - 1;
                    }
                }
            }
        });
    }
}
