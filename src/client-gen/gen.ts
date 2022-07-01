import { rmdir } from "fs";
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


(async () => {
    await prepareFolders();
    
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