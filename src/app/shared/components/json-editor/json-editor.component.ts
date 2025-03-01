/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />
import { Component, Input, ViewChild, ElementRef, OnInit, forwardRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'json-editor',
    templateUrl: './json-editor.component.html',
    styleUrls: ['./json-editor.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => JsonEditorComponent),
            multi: true
        }
    ]
})
export class JsonEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() id?: string;
    @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
    editor!: monaco.editor.IStandaloneCodeEditor;
    private editorChangeSubscription: monaco.IDisposable | undefined;
    @Input() editorWidth = '100%';
    @Input() theme = "vs-light";
    @Input() readonly = false;

    @Input() value: object = {};

    @Output() invalidData = new EventEmitter<boolean>()
    @Output() dataChange = new EventEmitter<string>();

    onChange: any = () => { };
    onTouched: any = () => { };

    height: number = 0;

    ngOnInit(): void {
        this.initializeEditor();
    }

    ngOnDestroy(): void {
        if (this.editor) {
            this.editor.dispose();
        }

        if (this.editorChangeSubscription) {
            this.editorChangeSubscription.dispose();
        }
    }

    get editorHeight() {
        return `${this.height}px`;
    }

    initializeEditor(): void {

        if (this.editor) {
            return;
        }

        const value = this.getJsonValue();

        this.adjustHeight(value);

        this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
            value,
            language: 'json',
            theme: this.theme,
            automaticLayout: true,
            readOnly: this.readonly,
            minimap: { enabled: true },
            glyphMargin: false,
            lineNumbers: 'on',
            folding: true,
            scrollBeyondLastLine: true,
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            lineDecorationsWidth: 0,
            hideCursorInOverviewRuler: true,
            occurrencesHighlight: 'off',
            quickSuggestions: false,
            codeLens: false,
            renderWhitespace: 'none',
            hover: { enabled: false },
            contextmenu: false,
            wordBasedSuggestions: 'off',
            fontLigatures: false,
            renderFinalNewline: 'off',
            inlayHints: { enabled: 'off' },
            suggestOnTriggerCharacters: false
        });

        this.editorChangeSubscription = this.editor.onDidChangeModelContent(() => {
            this.updateEditorValue();
        });
    }

    updateEditorValue(): void {
        const value = this.editor.getValue();

        this.adjustHeight(value);

        try {
            this.value = JSON.parse(value);
            if (typeof this.value === 'object' && this.value !== null) {
                this.emitInvalidData(false);
            } else {
                this.emitInvalidData(true);
            }
        } catch {
            this.emitInvalidData(true);
        }

        this.onChange(this.value);
    }

    emitInvalidData(invalid: boolean) {
        this.invalidData.emit(invalid);
    }

    getJsonValue(): string {
        return this.value ? JSON.stringify(this.value, null, 4) : '{}';
    }

    writeValue(value: any): void {
        this.value = value || {};

        if (this.editor && value) {

            const jsonValue = this.getJsonValue();

            this.editor.setValue(jsonValue);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
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

    formatCode() {
        this.editor.getAction('editor.action.formatDocument')?.run();
    }
}