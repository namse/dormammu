// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut, ipcMain, dialog, screen } = require('electron')
const prompt = require('electron-prompt');
const Store = require('electron-store');

const store = new Store();

function createWindow() {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false,
    transparent: true,
    skipTaskbar: true,
  })
  mainWindow.setIgnoreMouseEvents(true);
  mainWindow.setAlwaysOnTop(true);

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  let volumePercent = store.get('volumePercent');
  if (!volumePercent && volumePercent !== 0) {
    volumePercent = 75;
  }
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('setVolume', volumePercent / 100);
  });

  app.whenReady().then(() => {
    globalShortcut.register('Shift+F2', () => {
      console.log("shift f2");
      mainWindow.webContents.send('play');
    })

    globalShortcut.register('Shift+F3', () => {
      console.log("shift f3");
      mainWindow.webContents.send('stop');
    })

    globalShortcut.register('Shift+F7', async () => {
      try {
        console.log("shift f7");
        const nextVolumeString = await prompt({
          title: '볼륨 설정',
          label: `현재 볼륨은 ${volumePercent}% 입니다. 새 볼륨 0 ~ 100 사이의 값을 입력해주세요.`,
          value: volumePercent,
          type: 'input',
          width: 700,
        });
        const parsed = parseInt(nextVolumeString);
        if (isNaN(parsed)) {
          dialog.showMessageBox({
            title: '볼륨 설정',
            message: `${nextVolumeString}은 잘못된 값입니다. 0이상 100이하의 숫자를 입력해주세요.`
          })
          return;
        }

        const {
          response
        } = await dialog.showMessageBox({
          title: '볼륨 설정',
          message: `볼륨을 ${parsed}%로 설정합니까?`,
          buttons: ['네', '아니오'],
        });

        const isYes = response === 0;

        if (!isYes) {
          dialog.showMessageBox({
            title: '볼륨 설정',
            message: '취소하였습니다.'
          })
          return;
        }

        dialog.showMessageBox({
          title: '볼륨 설정',
          message: `볼륨이 ${parsed}%로 설정되었습니다.`,
        })

        volumePercent = parsed;
        store.set('volumePercent', volumePercent);
        mainWindow.webContents.send('setVolume', volumePercent / 100);
      } finally {
        mainWindow.setAlwaysOnTop(true);
      }
    })

    globalShortcut.register('Shift+F8', async () => {
      await dialog.showMessageBox({
        title: '종료합니다.',
        message: '빠이빠이~'
      })
      app.exit();
    })
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
