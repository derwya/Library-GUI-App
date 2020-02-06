
const { app, globalShortcut, BrowserWindow } = require("electron");
const logger = require("../modules/winston");
const path = require("path");

let window;
let child_process;

function createWindow() {



    window = new BrowserWindow({
        width: 1980,
        height: 1080,
        minWidth: 950,
        minHeight: 1080,
        maxWidth: 3840,
        maxHeight: 2160,
        fullscreenable: true,
        show: false,
        icon: path.join(__dirname, "..", "images", "icon128.png"),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    //window.setMenu(null);
    window.loadFile(path.join(__dirname, "..", "pages", "index.html"))
        .catch(logger.error);

    logger.info("Window was created...");


    window.once("ready-to-show", () => {
        window.show();
        logger.info("Ready!");
    });


    window.once("close", () => {
        window = null;
        logger.info("Window was closed...")
    });

}


app.once("ready", async () => {
    //child_process = await startServer();
    await msleep(5000);
    createWindow();
});

app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+N', () => {
        let child = new BrowserWindow({parent: window, width: 500, height:220, resizable: false, fullscreenable: false});
        child.loadFile(path.join(__dirname, "..", "pages", "easter.html")).catch(logger.error);
        child.setMenu(null);
        child.once("ready-to-show", () => child.show());
    });
});



app.once('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        //child_process.kill();
        app.quit();
    }
});


app.on('activate', () => {
    if (window === null) createWindow();
});

const msleep = time =>
    new Promise(
        resolve => setTimeout(_=>resolve(), time)
    )
;

async function startServer() {
    let spawn = require('child_process').spawn, child;
    logger.info(__dirname);
    child = spawn('java', ["-jar", (path.join(__dirname, "..", "server", "GUIApp-1.0-SNAPSHOT.jar").replace(/\s/g, "\ "))]);
    return child;
}
