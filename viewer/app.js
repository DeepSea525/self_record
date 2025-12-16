// ===== 个人记录系统 - 前端应用 =====

// 更新当前时间
function updateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('current-time').textContent = now.toLocaleDateString('zh-CN', options);
}

// 初始化时间更新
updateTime();
setInterval(updateTime, 60000);

// 侧边栏导航点击
document.querySelectorAll('#file-tree > li').forEach(item => {
    item.addEventListener('click', (e) => {
        const path = item.dataset.path;
        navigateTo(path);

        // 切换展开状态
        const subFolder = item.querySelector('.sub-folder');
        if (subFolder) {
            subFolder.style.display = subFolder.style.display === 'none' ? 'block' : 'none';
        }
    });
});

// 子文件夹点击
document.querySelectorAll('.sub-folder li').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = item.dataset.path;
        navigateTo(path);
    });
});

// 导航到指定路径
function navigateTo(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    const parts = path.split('/');
    breadcrumb.innerHTML = `<span>首页</span>` + parts.map(p => ` / <span>${p}</span>`).join('');

    // 更新内容区域
    showFolderContent(path);
}

// 显示文件夹内容
async function showFolderContent(path) {
    const contentBody = document.getElementById('content-body');

    // 显示加载中
    contentBody.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;">加载中...</div>';

    // 根据路径显示不同内容
    const folderInfo = await getFolderInfo(path);

    contentBody.innerHTML = `
        <div class="folder-view">
            <h2>${folderInfo.icon} ${folderInfo.name}</h2>
            <p class="folder-desc">${folderInfo.description}</p>
            
            <div class="file-list">
                ${folderInfo.files.map(file => `
                    <div class="file-item" onclick="${file.type === 'folder' ? `navigateTo('${file.path}')` : `openFile('${file.path}')`}">
                        <span class="file-icon">${file.type === 'folder' ? '📁' : '📄'}</span>
                        <span class="file-name">${file.name}</span>
                        <span class="file-date">${file.date || ''}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 获取文件夹信息 - 使用API
async function getFolderInfo(folderPath) {
    try {
        const response = await fetch(`/api/list?path=${encodeURIComponent(folderPath)}`);
        const items = await response.json();

        const folderIcons = {
            'inbox': '📥',
            'areas': '🎯',
            'projects': '🚀',
            'reviews': '🔄',
            'knowledge': '📚',
            'templates': '📝'
        };

        const folderName = folderPath.split('/').pop() || folderPath;

        return {
            icon: folderIcons[folderName] || '📁',
            name: folderName,
            description: '',
            files: items.map(item => ({
                name: item.name,
                type: item.type,
                path: item.path,
                date: item.name.match(/^\d{4}-\d{2}-\d{2}/) ? item.name.substring(0, 10) : ''
            }))
        };
    } catch (error) {
        console.error('获取目录失败:', error);
        return { icon: '📁', name: folderPath, description: '加载失败', files: [] };
    }
}

// 打开文件 - 使用API读取内容
async function openFile(filePath) {
    if (filePath.endsWith('.md')) {
        try {
            const response = await fetch(`/api/read?path=${encodeURIComponent(filePath)}`);
            const data = await response.json();

            // 渲染Markdown内容
            const contentBody = document.getElementById('content-body');
            contentBody.innerHTML = `
                <div class="markdown-view">
                    <div class="file-header">
                        <span class="file-path">📄 ${filePath}</span>
                    </div>
                    <div class="markdown-content">
                        ${renderMarkdown(data.content)}
                    </div>
                </div>
            `;

            // 更新面包屑
            const breadcrumb = document.getElementById('breadcrumb');
            const parts = filePath.split('/');
            breadcrumb.innerHTML = `<span>首页</span>` + parts.map(p => ` / <span>${p}</span>`).join('');

        } catch (error) {
            console.error('读取文件失败:', error);
            alert('读取文件失败: ' + error.message);
        }
    }
}

// 简单的Markdown渲染
function renderMarkdown(content) {
    return content
        // 标题
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // 粗体和斜体
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 引用
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        // 代码块
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // 行内代码
        .replace(/`(.*?)`/g, '<code class="inline">$1</code>')
        // 列表
        .replace(/^- \[(x|\/| )\] (.*$)/gm, (m, check, text) => {
            const checked = check === 'x' ? 'checked' : '';
            const inProgress = check === '/' ? 'in-progress' : '';
            return `<div class="checkbox ${checked} ${inProgress}"><span class="check"></span>${text}</div>`;
        })
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        // 表格
        .replace(/\|(.+)\|/g, (match) => {
            if (match.includes('---')) return '';
            const cells = match.split('|').filter(c => c.trim());
            return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        })
        // 分隔线
        .replace(/^---$/gm, '<hr>')
        // 换行
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
}

// 添加文件列表样式
const style = document.createElement('style');
style.textContent = `
    .folder-view h2 {
        font-size: 1.5rem;
        margin-bottom: 8px;
    }
    
    .folder-desc {
        color: var(--text-muted);
        margin-bottom: 24px;
    }
    
    .file-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .file-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .file-item:hover {
        background: var(--bg-tertiary);
        border-color: var(--accent-primary);
        transform: translateX(4px);
    }
    
    .file-icon {
        font-size: 1.25rem;
    }
    
    .file-name {
        flex: 1;
        font-weight: 500;
    }
    
    .file-date {
        font-size: 0.85rem;
        color: var(--text-muted);
    }
`;
document.head.appendChild(style);

console.log('🧠 个人记录系统已加载');
