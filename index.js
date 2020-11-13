const { app, BrowserWindow } = require('electron');
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));

function openWindow(width, height) {
    const window = new BrowserWindow({
        width,
        height,
        resizable: false,
        autoHideMenuBar: true,
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    window.loadFile('index.html');
}

app.whenReady().then(async () => {
    try {
        const { width, height } = await sizeOf(
            './resources/app/assets/keyboard.png'
        );
        openWindow(width, height);
    } catch (err) {
        app.quit();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length == 0) openWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') app.quit();
});
