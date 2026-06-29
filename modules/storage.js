/* ==========================================================
   ABSALON PRO
   modules/storage.js
   Sprint 1 - Parte 1 (Actualizado Sprint 6.2)
   Base de datos IndexedDB
========================================================== */

const DB_NAME = "AbsalonProDB";
const DB_VERSION = 1;

let db = null;

/* ==========================================================
   Abrir Base de Datos
========================================================== */
export async function initDB() {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("Error al abrir la base de datos.");
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log("✔ Base de datos iniciada.");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            createStores(db);
        };
    });
}

/* ==========================================================
   Crear Object Stores
========================================================== */
function createStores(database) {
    if (!database.objectStoreNames.contains("clientes")) {
        database.createObjectStore("clientes", { keyPath: "id", autoIncrement: true });
        console.log("➕ Tabla 'clientes' creada.");
    }
    if (!database.objectStoreNames.contains("presupuestos")) {
        database.createObjectStore("presupuestos", { keyPath: "id" });
        console.log("➕ Tabla 'presupuestos' creada.");
    }
    if (!database.objectStoreNames.contains("catalogos")) {
        database.createObjectStore("catalogos", { keyPath: "id", autoIncrement: true });
        console.log("➕ Tabla 'catalogos' creada.");
    }
    if (!database.objectStoreNames.contains("garantias")) {
        database.createObjectStore("garantias", { keyPath: "id" });
        console.log("➕ Tabla 'garantias' creada.");
    }
}

/* ==========================================================
   Manejador de Transacciones (Helper Interno)
========================================================== */
function getStore(storeName, mode) {
    if (!db) {
        throw new Error("La base de datos no está inicializada. Llama a initDB() primero.");
    }
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(transaction.objectStoreNames[0]);
}

/* ----------------------------------------------------------
   OBTENER TODOS LOS REGISTROS
---------------------------------------------------------- */
export async function getAll(storeName) {
    await initDB();
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readonly");
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* ----------------------------------------------------------
   AGREGAR UN REGISTRO
---------------------------------------------------------- */
export async function add(storeName, data) {
    await initDB();
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readwrite");
        const request = store.add(data);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* ----------------------------------------------------------
   OBTENER POR ID
---------------------------------------------------------- */
export async function getById(storeName, id) {
    await initDB();
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readonly");
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* ----------------------------------------------------------
   ACTUALIZAR REGISTRO
---------------------------------------------------------- */
export async function update(storeName, data) {
    await initDB();
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readwrite");
        const request = store.put(data);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* ----------------------------------------------------------
   ELIMINAR REGISTRO
---------------------------------------------------------- */
export async function remove(storeName, id) {
    await initDB();
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readwrite");
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* ----------------------------------------------------------
   CONTAR REGISTROS
---------------------------------------------------------- */
export async function count(storeName) {
    await initDB();
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readonly");
        const request = store.count();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* ----------------------------------------------------------
   OBTENER PRIMER REGISTRO
---------------------------------------------------------- */
export async function first(storeName) {
    const data = await getAll(storeName);
    return data.length ? data[0] : null;
}

/* ----------------------------------------------------------
   OBTENER ÚLTIMO REGISTRO
---------------------------------------------------------- */
export async function last(storeName) {
    const data = await getAll(storeName);
    return data.length ? data[data.length - 1] : null;
}

/* ----------------------------------------------------------
   VACIAR TABLA
---------------------------------------------------------- */
export async function clearStore(storeName) {
    await initDB();
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readwrite");
        const request = store.clear();

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* ----------------------------------------------------------
   INFORMACIÓN
---------------------------------------------------------- */
export async function getStats() {
    await initDB();
    return {
        clientes: await count("clientes"),
        presupuestos: await count("presupuestos"),
        catalogos: await count("catalogos"),
        garantias: await count("garantias")
    };
}

/* ----------------------------------------------------------
   PASO 1 (SPRINT 6.2): FILTRAR POR CAMPO ESPECÍFICO
---------------------------------------------------------- */
export async function getByField(store, field, value) {
    const datos = await getAll(store);
    return datos.filter(item => {
        return item[field] === value;
    });
}