// main => to access Node.js APIs

console.log("Hello!")

const { app, BrowserWindow, session, ipcMain, protocol, net } = require('electron') // importing two electron modules
const path = require('node:path')
const buildPath = path.join(path.dirname(__dirname), 'react-app', 'build');
const port = 3000;
const { exec } = require('child_process');
const fs = require('fs');
const accountsPath = path.join(__dirname, '../data/accounts.json');
const { initializeDatabase } = require('./database');
const { getUserProgress, updateUserProgress, getOrCreateChapter, getAccount, getAccounts, addAccount, getChapters, getChapterProgress } = require('./database');

const createWindow = () => { // loads webpage into new BrowserWindow
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webSecurity: false, // Disable for file protocols
            allowRunningInsecureContent: true
        }
    })
    // win.loadFile ('./pages/index.html')
    const indexPath = path.join(buildPath, 'index.html');

    const startUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : `http://localhost:${port}`;

    win.loadURL(startUrl);
    win.webContents.openDevTools();

    // handlers

    // to get fs to work as sandbox won't allow it directly in preload
    ipcMain.handle('read-file', (_, path) => {
        return fs.readFileSync(path, 'utf-8'); // ✅ Main process handles FS
    });

    ipcMain.handle('get-account', async (event, userId) => {
        if (!userId) return null;
        return getAccount(userId);
    })

    // Read accounts
    ipcMain.handle('get-accounts', async () => {
        // const data = fs.readFileSync(accountsPath, 'utf-8');
        // return JSON.parse(data);
        return getAccounts();
    });

    // Add account
    ipcMain.handle('add-account', async (event, account) => {
        try {
            return await addAccount(account);
        } catch (error) {
            console.error('Error adding account:', error);
            throw error; // This will be caught by the renderer
        }
    });

    ipcMain.handle('get-chapters', async () => {
        const chapters = await getChapters();
        console.log('Available chapters in DB:', chapters.map(c => c.id));
        return chapters;
    })

    ipcMain.handle('get-chapter-progress', async (event, userId) => {
        if (!userId) {
            console.warn('get-chapter-progress: No userId provided.');
            return []; // Return empty progress instead of hanging/erroring
        }
        return getChapterProgress(userId);
    })
}

app.whenReady().then(async () => { // calls function after ready event is fired
    try {
        await protocol.handle('app', async (request) => {
            const filePath = request.url.replace('app://', '');
            const fullPath = path.join(__dirname, '../resources/videos', filePath);

            try {
                // Get file stats and handle range requests
                // const stats = await fs.stat(fullPath);
                const stats = await new Promise((resolve, reject) => {
                    fs.stat(fullPath, (err, stats) => {
                        if (err) reject(err);
                        else resolve(stats);
                    });
                });
                const range = request.headers.get('range');

                if (range) {
                    // Handle partial content requests (video buffering)
                    const parts = range.replace(/bytes=/, '').split('-');
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

                    const chunksize = (end - start) + 1;
                    const file = fs.createReadStream(fullPath, { start, end });

                    return new Response(file, {
                        status: 206,
                        headers: {
                            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                            'Accept-Ranges': 'bytes',
                            'Content-Length': chunksize.toString(),
                            'Content-Type': 'video/mp4'
                        }
                    });
                }

                // Full file response
                return new Response(fs.createReadStream(fullPath), {
                    headers: {
                        'Content-Length': stats.size.toString(),
                        'Content-Type': 'video/mp4'
                    }
                });

            } catch (err) {
                console.error('File access error:', err);
                return new Response('Not Found', { status: 404 });
            }
        });
    } catch (err) {
        console.error('Protocol registration failed:', err);
    }
    // 🔥 Clear ALL cache partitions (including service workers)
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData({
        storages: ['serviceworkers', 'cachestorage'], // Target modern caching
    });

    // 🚀 Force-disable HTTP cache globally
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['Cache-Control'] = 'no-cache';
        callback({ requestHeaders: details.requestHeaders });
    });

    initializeDatabase();

    // http server to run react
    exec(`npx http-server "${buildPath}" -p ${port} --cors`, (error) => {
        if (error) {
            console.error('HTTP server failed to start:', error)
            app.quit()
            return
        }

        console.log(`React app served at http://localhost:${port}`)


        ipcMain.handle('ping', () => 'pong') // receiver of ping
        createWindow()
    })
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow() // opens window if none are open for mac
    })
})

app.on('window-all-closed', () => { //if all windows are closed
    if (process.platform !== 'darwin') app.quit() // if not mac, exit app
})