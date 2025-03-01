/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />
import { Component, Input, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'json-diff-editor',
    templateUrl: './json-diff-editor.component.html',
    styleUrls: ['./json-diff-editor.component.css']
})
export class JsonDiffEditorComponent implements OnInit, OnChanges {
    @ViewChild('diffEditorContainer', { static: true }) diffEditorContainer!: ElementRef;
    diffEditor!: monaco.editor.IStandaloneDiffEditor;

    @Input() originalData: any = {};
    @Input() modifiedData: any = {};
    @Input() editorWidth = '100%';
    @Input() theme = 'vs-light';
    @Input() sideBySide = true;

    private originalModel!: monaco.editor.ITextModel | null;
    private modifiedModel!: monaco.editor.ITextModel | null;

    ngOnInit(): void {
        this.initializeEditor();
    }

    ngOnDestroy(): void {
        if (this.diffEditor) {
            this.diffEditor.dispose();
        }

        if (this.originalModel) {
            this.originalModel.dispose();
        }
        
        if (this.modifiedModel) {
            this.modifiedModel.dispose();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['originalData'] || changes['modifiedData']) {
            this.updateEditorContent();
        }
    }

    height: number = 75;

    get editorHeight() {
        return `${this.height}px`;
    }

    initializeEditor(): void {

        if (this.diffEditor) {
            return;
        }

        this.diffEditor = monaco.editor.createDiffEditor(this.diffEditorContainer.nativeElement, {
            theme: this.theme,
            automaticLayout: true,
            renderSideBySide: this.sideBySide,
            renderOverviewRuler: true,
            minimap: { enabled: true },
            glyphMargin: false,
            lineNumbers: 'on',
            folding: true,
            scrollBeyondLastLine: true,
            renderLineHighlight: 'line',
            selectionHighlight: true,
            renderWhitespace: 'none',
            links: false,
            contextmenu: false,
            cursorBlinking: 'solid',
            smoothScrolling: true,
            wordWrap: 'on',
            enableSplitViewResizing: true,
            renderIndicators: false,
            readOnly: true,
            ignoreTrimWhitespace: true,
            hideCursorInOverviewRuler: true,
            renderControlCharacters: false,
        });

        this.updateEditorContent();
    }

    updateEditorContent(): void {

        if (!this.diffEditor) {
            return;
        }

        const originalContent = JSON.stringify(this.originalData, null, 4);
        const modifiedContent = JSON.stringify(this.modifiedData, null, 4);

        this.originalModel = monaco.editor.createModel(originalContent, 'json');
        this.modifiedModel = monaco.editor.createModel(modifiedContent, 'json');

        this.diffEditor.setModel({
            original: this.originalModel,
            modified: this.modifiedModel
        });

        this.adjustHeight(originalContent.length > modifiedContent.length ? originalContent : modifiedContent);
    }

    adjustHeight(value: string) {

        const height = this.getContentHeight(value);

        this.height = Math.min(300, height);
    }

    getContentHeight(content: string): number {
        const lineHeight = 19;
        const lineCount = (content.match(/\n/g) || []).length + 1;
        return lineHeight * lineCount;
    }

    toggleSideBySide(): void {
        this.sideBySide = !this.sideBySide;

        if (!this.diffEditor) {
            return;
        }

        this.diffEditor.updateOptions({
            renderSideBySide: this.sideBySide,
        });
    }
}