const { app, BrowserWindow } = require('electron');
const path = require('path');

function crearVentana() {
    const ventana = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Absalon Pro",
        // Aquí asignamos directamente tu logo para la barra superior de la app
        icon: path.join(__dirname, 'logo_2.png'), 
        webPreferences: {
            nodeIntegration: false, // Seguridad activada[cite: 3]
            contextIsolation: true // Seguridad activada[cite: 3]
        }
    });

    // Remueve la barra de menú típica de navegador (Archivo, Editar, etc.) para que parezca un programa real[cite: 3]
    ventana.setMenu(null);

    // Carga tu index.html local directo desde el disco duro[cite: 3]
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