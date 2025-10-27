import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertPrototypeMethods(content) {
    // Patrón para encontrar métodos prototype con __awaiter
    const prototypeMethodPattern = /SeleneNuclearSwarm\.prototype\.(\w+)\s*=\s*function\s*\(\s*([^)]*)\s*\)\s*\{\s*return\s+__awaiter\(this,\s+void\s+0,\s+void\s+0,\s+function\s*\(\s*\)\s*\{([\s\S]*?)\}\);\s*\};/g;

    return content.replace(prototypeMethodPattern, (match, methodName, params, body) => {
        // Convertir el cuerpo del método
        let convertedBody = body;

        // Convertir switch statements con yield
        convertedBody = convertedBody.replace(/switch\s*\(\s*_a\.label\s*\)\s*\{([\s\S]*?)\}/g, (switchMatch, switchBody) => {
            // Extraer casos del switch
            const casePattern = /case\s+(\d+):\s*return\s*\[(\d+)\s*\/\*yield\*\/,\s*\(\w+\)\.(\w+)\(([^)]*)\)\];/g;
            const cases = [];
            let caseMatch;

            while ((caseMatch = casePattern.exec(switchBody)) !== null) {
                const [fullMatch, caseNum, yieldType, methodCall, methodArgs] = caseMatch;
                cases.push({
                    caseNum: parseInt(caseNum),
                    methodCall: `${methodCall}(${methodArgs})`
                });
            }

            // Si encontramos casos yield, convertirlos a await
            if (cases.length > 0) {
                let asyncBody = '';
                cases.forEach((caseInfo, index) => {
                    if (index === 0) {
                        asyncBody += `const result${index} = await ${caseInfo.methodCall};\n`;
                    } else {
                        asyncBody += `const result${index} = await ${caseInfo.methodCall};\n`;
                    }
                });

                // Agregar return si es el último caso
                if (cases.length > 0) {
                    asyncBody += `return result${cases.length - 1};\n`;
                }

                return asyncBody;
            }

            return switchMatch; // Mantener sin cambios si no hay yield
        });

        // Limpiar return statements innecesarios
        convertedBody = convertedBody.replace(/return\s*\[2\s*\/\*return\*\/,\s*([^;]+)\];/g, 'return $1;');

        // Limpiar etiquetas de case innecesarias
        convertedBody = convertedBody.replace(/case\s+\d+:\s*return\s*\[3\s*\/\*break\*\/,\s*\d+\];/g, '');

        // Convertir variables _a, _b, etc. a variables normales
        convertedBody = convertedBody.replace(/\b_a\b/g, 'result');
        convertedBody = convertedBody.replace(/\b_b\b/g, 'result2');
        convertedBody = convertedBody.replace(/\b_c\b/g, 'result3');

        // Limpiar try/catch patterns
        convertedBody = convertedBody.replace(/_a\.trys\.push\(\[(\d+),\s*(\d+),\s*,?\s*(\d+)?\]\);/g, '');
        convertedBody = convertedBody.replace(/case\s+(\d+):\s*(\w+)\s*=\s*_a\.sent\(\);/g, (match, caseNum, varName) => {
            return `const ${varName} = await someAsyncCall;`; // Placeholder
        });

        // Para métodos simples, intentar conversión directa
        if (convertedBody.includes('return [4 /*yield*/,') && convertedBody.includes('case 1:')) {
            // Método simple con un solo await
            const yieldMatch = convertedBody.match(/return\s*\[4\s*\/\*yield\*\/,\s*\(\w+\)\.(\w+)\(([^)]*)\)\];/);
            if (yieldMatch) {
                const [, methodName, methodArgs] = yieldMatch;
                convertedBody = `return await this.${methodName}(${methodArgs});`;
            }
        }

        // Crear el método convertido
        const asyncMethod = `async ${methodName}(${params}) {
${convertedBody.trim()}
    }`;

        return asyncMethod;
    });
}

function convertSimplePrototypeMethods(content) {
    // Para métodos que no usan __awaiter pero sí prototype
    const simplePrototypePattern = /SeleneNuclearSwarm\.prototype\.(\w+)\s*=\s*function\s*\(\s*([^)]*)\s*\)\s*\{([\s\S]*?)\};/g;

    return content.replace(simplePrototypePattern, (match, methodName, params, body) => {
        // Solo convertir si no contiene __awaiter (ya que esos se convierten arriba)
        if (!body.includes('__awaiter')) {
            return `    ${methodName}(${params}) {
${body.trim()}
    }`;
        }
        return match; // Mantener sin cambios
    });
}

// Leer el archivo
const filePath = path.join(__dirname, 'swarm', 'coordinator', 'SeleneNuclearSwarm.mjs');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Iniciando conversión automática de métodos...');

// Primera pasada: convertir métodos con __awaiter
content = convertPrototypeMethods(content);

// Segunda pasada: convertir métodos simples sin __awaiter
content = convertSimplePrototypeMethods(content);

// Limpiar funciones helper de TypeScript que ya no se usan
content = content.replace(/function\s+__extends\s*\([\s\S]*?\}\s*\}\);/g, '');
content = content.replace(/function\s+__assign\s*\([\s\S]*?\}\s*\}\);/g, '');
content = content.replace(/function\s+__awaiter\s*\([\s\S]*?\}\s*\}\);/g, '');
content = content.replace(/function\s+__generator\s*\([\s\S]*?\}\s*\}\);/g, '');
content = content.replace(/function\s+__spreadArray\s*\([\s\S]*?\}\s*\}\);/g, '');

// Escribir el archivo convertido
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Conversión automática completada');
console.log('Nota: Puede requerir ajustes manuales para algunos métodos complejos');