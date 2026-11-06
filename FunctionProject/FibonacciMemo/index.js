const bigInt = require("big-integer");

// Vive fuera del handler: dura mientras dure la instancia, y cada instancia tiene la suya.
const memo = new Map([[0, bigInt.zero], [1, bigInt.one]]);
const instanciaIniciada = new Date().toISOString();

function fib(n) {
    if (memo.has(n)) return memo.get(n);
    const valor = fib(n - 1).add(fib(n - 2));
    memo.set(n, valor);
    return valor;
}

module.exports = async function (context, req) {
    const nth = Number(req.body && req.body.nth);
    if (!Number.isInteger(nth) || nth < 0) {
        context.res = { status: 400, body: { error: "nth debe ser un entero >= 0" } };
        return;
    }

    const estabaEnMemo = memo.has(nth);
    const inicio = Date.now();
    const diagnostico = () => ({
        nth,
        estabaEnMemo,
        duracionMs: Date.now() - inicio,
        tamanoMemo: memo.size,
        instanciaIniciada,
        instancia: process.env.WEBSITE_INSTANCE_ID || "local"
    });

    try {
        const respuesta = fib(nth).toString();
        context.res = {
            headers: { "Content-Type": "application/json" },
            body: { ...diagnostico(), digitos: respuesta.length, respuesta }
        };
    } catch (error) {
        context.res = {
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: { ...diagnostico(), error: error.message }
        };
    }
};
