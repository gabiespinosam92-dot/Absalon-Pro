/* ==========================================================
   ABSALON PRO
   modules/storage.js
   Almacén IndexedDB unificado (Presupuestos, Clientes, Personal)
========================================================== */

const DB_NAME = "AbsalonProDB";
const DB_VERSION = 6;

let db = null;

export async function initDB() {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("Error al abrir la base de datos:", request.error);
            reject(request.error);
        };

        request.onblocked = () => {
            console.warn("La apertura de IndexedDB está bloqueada por otra pestaña o conexión abierta.");
        };

        request.onsuccess = () => {
            db = request.result;

            db.onversionchange = () => {
                db.close();
                db = null;
            };

            console.log("✔ Base de datos iniciada.");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            createStores(db);
        };
    });
}

function createStores(database) {
    const stores = [
        "clientes",
        "presupuestos",
        "catalogos",
        "garantias",
        "inversiones",
        "personal",
        "horas_personal"
    ];

    stores.forEach((storeName) => {
        if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, {
                keyPath: "id",
                autoIncrement: true
            });
        }
    });
}

export async function getAll(storeName) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function getById(storeName, id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function add(storeName, data) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function update(storeName, data) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function remove(storeName, id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

export async function count(storeName) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getStats() {
    return {
        clientes: await count("clientes"),
        presupuestos: await count("presupuestos"),
        catalogos: await count("catalogos"),
        garantias: await count("garantias"),
        inversiones: await count("inversiones"),
        personal: await count("personal"),
        horas_personal: await count("horas_personal")
    };
}

export async function getByField(store, field, value) {
    const datos = await getAll(store);
    return datos.filter((item) => item[field] === value);
}

export async function save(store, data) {
    if (data.id) {
        await update(store, data);
        return data;
    }
    return await add(store, data);
}

export async function exists(store, id) {
    const dato = await getById(store, id);
    return dato !== null;
}

export async function findOne(store, field, value) {
    const datos = await getByField(store, field, value);
    return datos.length ? datos[0] : null;
}

export async function getNextNumero() {
    const presupuestos = await getAll("presupuestos");
    if (presupuestos.length === 0) return 1;
    const numeros = presupuestos.map((p) => Number(p.id || p.numero || 0));
    return Math.max(...numeros) + 1;
}
