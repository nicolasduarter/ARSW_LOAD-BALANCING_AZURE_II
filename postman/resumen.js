// Uso: node resumen.js <carpeta con los newman-*.json>
const fs = require("fs");
const path = require("path");

const carpeta = process.argv[2];
const archivos = fs.readdirSync(carpeta).filter(a => /^newman-.*\.json$/.test(a)).sort();
const exitosos = [];
let fallidos = 0;

for (const archivo of archivos) {
    const { run } = JSON.parse(fs.readFileSync(path.join(carpeta, archivo)));
    for (const e of run.executions) {
        const codigo = e.response && e.response.code;
        if (codigo === 200) {
            exitosos.push(e.response.responseTime / 1000);
        } else {
            fallidos++;
            console.log(archivo, "FALLO:", codigo || (e.requestError && e.requestError.code) || "sin respuesta");
        }
    }
}

const total = exitosos.length + fallidos;
console.log(`Peticiones: ${total} | Exitosas: ${exitosos.length} (${(100 * exitosos.length / total).toFixed(1)} %) | Fallidas: ${fallidos}`);
if (exitosos.length) {
    const prom = exitosos.reduce((a, b) => a + b, 0) / exitosos.length;
    console.log(`Tiempo de las exitosas (s): prom ${prom.toFixed(2)} | min ${Math.min(...exitosos).toFixed(2)} | max ${Math.max(...exitosos).toFixed(2)}`);
}
