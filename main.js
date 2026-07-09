const { app, BrowserWindow } = require('electron');
const path = require('path');

function crearVentana() {
    const ventana = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Absalon Pro",
        icon: path.join(__dirname, 'icono.ico'), // Por si le querés poner logo después
        webPreferences: {
            nodeIntegration: false, // Seguridad activada
            contextIsolation: true
        }
    });

    // Remueve la barra de menú típica de navegador (Archivo, Editar, etc.) para que parezca un programa real
    ventana.setMenu(null);

    // Carga tu index.html local directo desde el disco duro
    ventana.loadFile('index.html');
}

app.whenReady().then(() => {
    crearVentana();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) crearVentana();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});