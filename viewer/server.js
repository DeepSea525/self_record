const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_DIR = path.join(__dirname, '..');

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理API请求
    if (req.url.startsWith('/api/')) {
        handleAPI(req, res);
        return;
    }

    // 处理静态文件
    let filePath = req.url === '/' ? '/viewer/index.html' : req.url;

    // 如果是静态资源(css/js)且不带路径，默认从viewer目录加载
    if ((filePath.endsWith('.css') || filePath.endsWith('.js')) && !filePath.includes('/')) {
        filePath = '/viewer' + filePath;
    }

    filePath = path.join(BASE_DIR, filePath);

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('文件未找到');
            } else {
                res.writeHead(500);
                res.end('服务器错误');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
            res.end(content);
        }
    });
});

// API处理
function handleAPI(req, res) {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === '/api/list') {
        // 列出目录内容
        const dirPath = url.searchParams.get('path') || '';
        const fullPath = path.join(BASE_DIR, dirPath);

        fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
                return;
            }

            const items = files
                .filter(f => !f.name.startsWith('.') && f.name !== 'viewer' && f.name !== 'node_modules')
                .map(f => ({
                    name: f.name,
                    type: f.isDirectory() ? 'folder' : 'file',
                    path: path.join(dirPath, f.name)
                }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(items));
        });
    } else if (url.pathname === '/api/read') {
        // 读取文件内容
        const filePath = url.searchParams.get('path') || '';
        const fullPath = path.join(BASE_DIR, filePath);

        fs.readFile(fullPath, 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ content }));
        });
    } else {
        res.writeHead(404);
        res.end('API未找到');
    }
}

server.listen(PORT, () => {
    console.log(`
🧠 个人记录系统服务器已启动
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 地址: http://localhost:${PORT}
📁 根目录: ${BASE_DIR}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
按 Ctrl+C 停止服务器
    `);
});
