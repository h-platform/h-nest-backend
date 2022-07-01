import { fstat, rmdir, readFileSync, writeFileSync } from "fs";
import { pascalCase } from "pascal-case";
const touch = require("touch")
const glob = require("glob")
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

function promisedGlob(pattern) {
    return new Promise<string[]>((resolve, reject) => {
        glob(pattern, (err, files) => {
            if (err) { reject(err) }
            resolve(files);
        })
    })
}

function promisedTouch(fileName) {
    return new Promise<any>((resolve, reject) => {
        touch(fileName, { force: false }, (err, files) => {
            if (err) { reject(err) }
            resolve(files);
        })
    })
}

function promisedRimraf(dirName) {
    return new Promise<any>((resolve, reject) => {
        rimraf(dirName, {}, (err) => {
            if (err) { reject(err) }
            resolve(true);
        })
    })
}

function cleanPathToSymbol(p: string) {
    return pascalCase(p);
}

const cmdRegex = RegExp('^src\/(.*)\/commands\/(.*).ts$');
const qyrRegex = RegExp('^src\/(.*)\/queries\/(.*).ts$');

async function prepareFolders() {
    await promisedRimraf('src-client');

    const commands = await promisedGlob("src/*/commands/!(_)*.ts")
    for (let file of commands) {
        if (cmdRegex.test(file)) {
            const [value, mn, cmd] = cmdRegex.exec(file);
            await mkdirp(`src-client/${mn}/commands`)
            await promisedTouch(`src-client/${mn}/commands/${cmd}.ts`)
            const dtoClassCode = await processCommandFile2(file);
            if (dtoClassCode) {
                writeFileSync(`src-client/${mn}/commands/${cmd}.ts`, dtoClassCode)
            }
        }
    }

    const queries = await promisedGlob("src/*/queries/!(_)*.ts")
    for (let file of queries) {
        if (qyrRegex.test(file)) {
            const [value, mn, qyr] = qyrRegex.exec(file);
            await mkdirp(`src-client/${mn}/queries`)
            await promisedTouch(`src-client/${mn}/queries/${qyr}.ts`)
        }
    }
}

async function getImports() {
    const imports = [];
    const commands = await promisedGlob("src/*/commands/!(_)*.ts")
    for (let file of commands) {
        if (cmdRegex.test(file)) {
            const [value, mn, cmd] = cmdRegex.exec(file);
            imports.push(`import { client as ${cleanPathToSymbol(mn)}__${cleanPathToSymbol(cmd)}__command } from "../${mn}/commands/${cmd}";`);
        }
    }

    const queries = await promisedGlob("src/*/queries/!(_)*.ts")
    for (let file of queries) {
        if (qyrRegex.test(file)) {
            const [value, mn, qyr] = qyrRegex.exec(file);
            imports.push(`import { client as ${cleanPathToSymbol(mn)}__${cleanPathToSymbol(qyr)}__query } from "../${mn}/queries/${qyr}";`);
        }
    }

    return imports;
}

async function getClient() {
    const client = {};
    const commands = await promisedGlob("src/*/commands/!(_)*.ts")
    for (let file of commands) {
        if (cmdRegex.test(file)) {
            const [value, mn, cmd] = cmdRegex.exec(file);
            client[mn] = {
                commands: {},
                queries: {},
            }
        }
    }

    const queries = await promisedGlob("src/*/queries/!(_)*.ts")
    for (let file of queries) {
        if (qyrRegex.test(file)) {
            const [value, mn, qyr] = qyrRegex.exec(file);
            client[mn] = {
                commands: {},
                queries: {},
            }
        }
    }

    return client;
}

async function fillClient(client: any) {
    const commands = await promisedGlob("src/*/commands/!(_)*.ts")
    for (let file of commands) {
        if (cmdRegex.test(file)) {
            const [value, mn, cmd] = cmdRegex.exec(file);
            client[mn]['commands'][cmd] = `${cleanPathToSymbol(mn)}__${cleanPathToSymbol(cmd)}__command`
        }
    }

    const queries = await promisedGlob("src/*/queries/!(_)*.ts")
    for (let file of queries) {
        if (qyrRegex.test(file)) {
            const [value, mn, qyr] = qyrRegex.exec(file);
            client[mn]['commands'][qyr] = `${cleanPathToSymbol(mn)}__${cleanPathToSymbol(qyr)}__query`
        }
    }

    return client;
}

const commandDTORegex = new RegExp(/.*CommandDTO {[\s\S]*?}/);
async function processCommandFile(filePath) {
    const code = readFileSync(filePath);
    const res = commandDTORegex.exec(code.toLocaleString());
    console.log(res[0]);
}

const commandDTORegex2 = new RegExp(/.*CommandDTO {[\s\S]*}/);
const XRegExp = require('xregexp');
async function processCommandFile2(filePath) {
    try {
        const code = readFileSync(filePath);
        const [res1] = commandDTORegex2.exec(code.toLocaleString());
        const [before, left, match, right] = XRegExp.matchRecursive(res1, '{', '}', 'g', {
            valueNames: ['before', 'left', 'match', 'right'],
            unbalanced: 'skip',
        });
        const dtoClass = [before.value, left.value, match.value, right.value].join('');
        console.log(dtoClass);
        return dtoClass;
    } catch (err) {
        console.log('// Error occured during DTO Extraction')
        console.log(err);
        return null;
    }
    
}


async function processCommandFile4(filePath) {
    const code = readFileSync(filePath);
    const lines = code.toLocaleString().split(/\r?\n/);
}

const commandDTORegex3 = new RegExp(/\{(?:[^)(]+|\{(?:[^)(]+|\{[^)(]*\})*\})*\}/);
async function processCommandFile3(filePath) {
    const code = readFileSync(filePath);
    const res = commandDTORegex3.exec(code.toLocaleString());
    console.log(res);
}

(async () => {
    await prepareFolders();
    
    // await processCommandFile2('src/authentication/commands/auth.loginByEmail.ts');

    // const imports = await getImports()
    // for (let fileName of imports) {
    //     console.log(fileName)
    //     await promisedTouch("./"+fileName);
    // }

    // console.log(imports);
    // const client = await getClient()
    // await fillClient(client)
    // console.log(client);
})()