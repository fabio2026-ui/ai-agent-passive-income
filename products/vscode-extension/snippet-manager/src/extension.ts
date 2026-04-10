# VS Code Extension: Code Snippet Manager
# 小七团队开发

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// 片段存储
interface Snippet {
    id: string;
    name: string;
    prefix: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
    createdAt: number;
    usageCount: number;
}

class SnippetManager {
    private snippets: Snippet[] = [];
    private context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadSnippets();
    }
    
    private loadSnippets() {
        const data = this.context.globalState.get<Snippet[]>('snippets', []);
        this.snippets = data;
    }
    
    private saveSnippets() {
        this.context.globalState.update('snippets', this.snippets);
    }
    
    addSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'usageCount'>) {
        const newSnippet: Snippet = {
            ...snippet,
            id: Date.now().toString(),
            createdAt: Date.now(),
            usageCount: 0
        };
        this.snippets.push(newSnippet);
        this.saveSnippets();
        return newSnippet;
    }
    
    deleteSnippet(id: string) {
        this.snippets = this.snippets.filter(s => s.id !== id);
        this.saveSnippets();
    }
    
    getSnippets(language?: string): Snippet[] {
        if (language) {
            return this.snippets.filter(s => s.language === language);
        }
        return this.snippets;
    }
    
    searchSnippets(query: string): Snippet[] {
        const lowerQuery = query.toLowerCase();
        return this.snippets.filter(s => 
            s.name.toLowerCase().includes(lowerQuery) ||
            s.description.toLowerCase().includes(lowerQuery) ||
            s.tags.some(t => t.toLowerCase().includes(lowerQuery))
        );
    }
    
    incrementUsage(id: string) {
        const snippet = this.snippets.find(s => s.id === id);
        if (snippet) {
            snippet.usageCount++;
            this.saveSnippets();
        }
    }
}

// 树形视图Provider
class SnippetsTreeProvider implements vscode.TreeDataProvider<SnippetItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SnippetItem | undefined | null | void> = new vscode.EventEmitter<SnippetItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SnippetItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    constructor(private manager: SnippetManager) {}
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    
    getTreeItem(element: SnippetItem): vscode.TreeItem {
        return element;
    }
    
    getChildren(element?: SnippetItem): Thenable<SnippetItem[]> {
        if (!element) {
            // 根级别 - 按语言分组
            const snippets = this.manager.getSnippets();
            const languages = [...new Set(snippets.map(s => s.language))];
            return Promise.resolve(languages.map(lang => new LanguageItem(lang, snippets.filter(s => s.language === lang).length)));
        } else if (element instanceof LanguageItem) {
            // 语言下的片段
            const snippets = this.manager.getSnippets(element.language);
            return Promise.resolve(snippets.map(s => new SnippetTreeItem(s)));
        }
        return Promise.resolve([]);
    }
}

class SnippetItem extends vscode.TreeItem {}

class LanguageItem extends SnippetItem {
    constructor(public language: string, count: number) {
        super(language, vscode.TreeItemCollapsibleState.Expanded);
        this.iconPath = new vscode.ThemeIcon('symbol-folder');
        this.description = `${count} snippets`;
    }
}

class SnippetTreeItem extends SnippetItem {
    constructor(public snippet: Snippet) {
        super(snippet.name, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${snippet.description}\nPrefix: ${snippet.prefix}`;
        this.description = snippet.prefix;
        this.iconPath = new vscode.ThemeIcon('code');
        this.command = {
            command: 'snippetManager.insertSnippet',
            title: 'Insert Snippet',
            arguments: [snippet]
        };
        this.contextValue = 'snippet';
    }
}

// 激活扩展
export function activate(context: vscode.ExtensionContext) {
    const manager = new SnippetManager(context);
    const treeProvider = new SnippetsTreeProvider(manager);
    
    // 注册树形视图
    vscode.window.registerTreeDataProvider('snippetsExplorer', treeProvider);
    
    // 注册命令
    context.subscriptions.push(
        vscode.commands.registerCommand('snippetManager.addSnippet', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('请先打开一个文件');
                return;
            }
            
            const selection = editor.selection;
            const code = editor.document.getText(selection);
            
            if (!code) {
                vscode.window.showErrorMessage('请先选中要保存的代码');
                return;
            }
            
            const name = await vscode.window.showInputBox({
                prompt: '片段名称',
                placeHolder: '例如: React useState Hook'
            });
            
            if (!name) return;
            
            const prefix = await vscode.window.showInputBox({
                prompt: '触发前缀',
                placeHolder: '例如: useState'
            });
            
            if (!prefix) return;
            
            const description = await vscode.window.showInputBox({
                prompt: '描述（可选）',
                placeHolder: '简短描述这个片段的作用'
            });
            
            const language = editor.document.languageId;
            
            manager.addSnippet({
                name,
                prefix,
                description: description || '',
                code,
                language,
                tags: []
            });
            
            treeProvider.refresh();
            vscode.window.showInformationMessage(`✅ 片段 "${name}" 已保存！`);
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('snippetManager.insertSnippet', (snippet: Snippet) => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.insertSnippet(new vscode.SnippetString(snippet.code));
                manager.incrementUsage(snippet.id);
            }
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('snippetManager.searchSnippet', async () => {
            const query = await vscode.window.showInputBox({
                prompt: '搜索片段',
                placeHolder: '输入关键词...'
            });
            
            if (!query) return;
            
            const results = manager.searchSnippets(query);
            
            if (results.length === 0) {
                vscode.window.showInformationMessage('没有找到匹配的片段');
                return;
            }
            
            const items = results.map(s => ({
                label: s.name,
                description: s.prefix,
                detail: s.description,
                snippet: s
            }));
            
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: '选择一个片段插入'
            });
            
            if (selected) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.insertSnippet(new vscode.SnippetString(selected.snippet.code));
                    manager.incrementUsage(selected.snippet.id);
                }
            }
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('snippetManager.deleteSnippet', (item: SnippetTreeItem) => {
            manager.deleteSnippet(item.snippet.id);
            treeProvider.refresh();
            vscode.window.showInformationMessage(`🗑️ 片段已删除`);
        })
    );
    
    // 注册代码补全Provider
    const disposable = vscode.languages.registerCompletionItemProvider(
        [{ scheme: 'file' }],
        {
            provideCompletionItems(document, position) {
                const language = document.languageId;
                const snippets = manager.getSnippets(language);
                
                return snippets.map(s => {
                    const item = new vscode.CompletionItem(s.prefix, vscode.CompletionItemKind.Snippet);
                    item.detail = s.name;
                    item.documentation = new vscode.MarkdownString(s.description + '\n\n```' + language + '\n' + s.code + '\n```');
                    item.insertText = new vscode.SnippetString(s.code);
                    return item;
                });
            }
        },
        ':' // 触发字符
    );
    
    context.subscriptions.push(disposable);
    
    // 显示欢迎消息
    vscode.window.showInformationMessage('🚀 Snippet Manager 已激活！使用 Ctrl+Shift+S 搜索片段');
}

export function deactivate() {}
