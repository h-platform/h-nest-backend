import { fstat, rmdir, readFileSync, writeFileSync, appendFileSync } from "fs";
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
            const dtoClassCode = await processCommandFile(file);
            if (dtoClassCode) {
                appendFileSync(`src-client/${mn}/commands/${cmd}.ts`, prepareTemplate(dtoClassCode))
            }
        }
    }

    const queries = await promisedGlob("src/*/queries/!(_)*.ts")
    for (let file of queries) {
        if (qyrRegex.test(file)) {
            const [value, mn, qyr] = qyrRegex.exec(file);
            await mkdirp(`src-client/${mn}/queries`)
            await promisedTouch(`src-client/${mn}/queries/${qyr}.ts`)
            const dtoClassCode = await processQueryFile(file);
            if (dtoClassCode) {
                appendFileSync(`src-client/${mn}/queries/${qyr}.ts`, prepareTemplate(dtoClassCode))
            }
        }
    }
}

function prepareTemplate (code) {
    return `import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsOptional, IsInt, IsDefined, IsString, Matches, IsNotEmpty } from 'class-validator';
    

${code}`
}

const commandDTORegex = new RegExp(/.*CommandDTO {[\s\S]*}/);
const XRegExp = require('xregexp');
async function processCommandFile(filePath) {
    try {
        const code = readFileSync(filePath);
        const [res1] = commandDTORegex.exec(code.toLocaleString());
        const [before, left, match, right] = XRegExp.matchRecursive(res1, '{', '}', 'g', {
            valueNames: ['before', 'left', 'match', 'right'],
            unbalanced: 'skip',
        });
        const dtoClass = [before.value, left.value, match.value, right.value].join('');
        return dtoClass;
    } catch (err) {
        console.log('// Error occured during Command DTO Extraction')
        console.log('// Error file: ' + filePath)
        console.log(err);
        return null;
    }
}

const queryDTORegex = new RegExp(/.*QueryDTO {[\s\S]*}/);
async function processQueryFile(filePath) {
    try {
        const code = readFileSync(filePath);
        const [res1] = queryDTORegex.exec(code.toLocaleString());
        const [before, left, match, right] = XRegExp.matchRecursive(res1, '{', '}', 'g', {
            valueNames: ['before', 'left', 'match', 'right'],
            unbalanced: 'skip',
        });
        const dtoClass = [before.value, left.value, match.value, right.value].join('');
        return dtoClass;
    } catch (err) {
        console.log('// Error occured during Query DTO Extraction')
        console.log('// Error file: ' + filePath)
        console.log(err);
        return null;
    }
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