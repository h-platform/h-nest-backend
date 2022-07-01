import { fstat, rmdir, readFileSync, writeFileSync, appendFileSync } from "fs";
import { writeFile } from 'node:fs/promises';
import { uniq } from "lodash";
import { pascalCase } from "pascal-case";
const touch = require("touch")
const glob = require("glob")
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const XRegExp = require('xregexp')

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

interface CQRecord {
    recordType: 'QUERY' | 'COMMAND',
    file: string,
    moduleName: string,
    eventName: string,
    dtoClassName: string,
}


const cmdRegex = /^src\/(.*)\/commands\/(.*).ts$/;
const qyrRegex = /^src\/(.*)\/queries\/(.*).ts$/;

async function scanModules() {
    const data: CQRecord[] = [];

    // scan commads
    const commands = await promisedGlob("src/*/commands/!(_)*.ts");
    for (let file of commands) {
        if (cmdRegex.test(file)) {
            const [, mn, cmd] = cmdRegex.exec(file);
            const record: CQRecord = {
                file: file,
                moduleName: mn,
                eventName: cmd,
                recordType: 'COMMAND',
                dtoClassName: 'CommandDTO',
            }
            const dtoClassCode = await processCommandFile(file);
            if (dtoClassCode) {
                const res = /(\w+CommandDTO)/.exec(dtoClassCode);
                if (Array.isArray(res) && res[1]) {
                    record.dtoClassName = res[1];
                }
            }
            data.push(record)
        }
    }

    // scan queries
    const queries = await promisedGlob("src/*/queries/!(_)*.ts")
    for (let file of queries) {
        if (qyrRegex.test(file)) {
            const [, mn, cmd] = qyrRegex.exec(file);
            const record: CQRecord = {
                file: file,
                moduleName: mn,
                eventName: cmd,
                recordType: 'QUERY',
                dtoClassName: 'QueryDTO',
            }
            const dtoClassCode = await processQueryFile(file);
            if (dtoClassCode) {
                const res = /(\w+QueryDTO)/.exec(dtoClassCode);
                if (Array.isArray(res) && res[1]) {
                    record.dtoClassName = res[1];
                }
            }
            data.push(record)
        }
    }

    return data;
}


async function prepareFoldersUsingData(data: CQRecord[]) {
    // remove previous generated folder
    await promisedRimraf('src-client');

    const moduleNames = uniq(data.map((r) => r.moduleName));
    for (let moduleName of moduleNames) {
        // prepare folders 
        await mkdirp(`src-client/${moduleName}/commands`)
        await mkdirp(`src-client/${moduleName}/queries`)
        // generate module index
        const moduleTemplate = prepareModuleClientTemplate(moduleName, data);
        await writeFile(`src-client/${moduleName}/index.ts`, moduleTemplate)
    }

    // generates commands
    for (let record of data.filter(r => r.recordType === 'COMMAND')) {
        const dtoClassCode = await processCommandFile(record.file);
        if (dtoClassCode) {
            await writeFile(`src-client/${record.moduleName}/commands/${record.eventName}.ts`, prepareDtoTemplate(dtoClassCode))
        }
    }

    // generates queries
    for (let record of data.filter(r => r.recordType === 'QUERY')) {
        const dtoClassCode = await processQueryFile(record.file);
        if (dtoClassCode) {
            await writeFile(`src-client/${record.moduleName}/queries/${record.eventName}.ts`, prepareDtoTemplate(dtoClassCode))
        }
    }
    
    // generate final client
    const clientTemplate = prepareClientTemplate(moduleNames)
    await writeFile(`src-client/index.ts`, clientTemplate);
}


function prepareDtoTemplate(code) {
    return `import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsOptional, IsInt, IsDefined, IsString, Matches, IsNotEmpty } from 'class-validator';

${code}`
}


function prepareClientTemplate(moduleNames: string[]) {
    const imports = moduleNames.map(m => `import { ${pascalCase(m)}Client } from "./${m}/index";`);
    const list = moduleNames.map(m => `    '${m}': ${pascalCase(m)}Client,`);
    return `
${imports.join('\n')}

interface ModuleClient {
${list.join('\n')}
}

export async function command<
        TModule extends keyof ModuleClient,
        TCommand extends keyof ModuleClient[TModule]['commands'],
        TPayload extends ModuleClient[TModule]['commands'][TCommand],
    >(mn: TModule, cmd: TCommand, payload: TPayload) {
    console.log(mn, cmd, payload);
};

export async function query<
        TModule extends keyof ModuleClient,
        TQuery extends keyof ModuleClient[TModule]['queries'],
        TPayload extends ModuleClient[TModule]['queries'][TQuery],
    >(mn: TModule, cmd: TQuery, payload: TPayload) {
    console.log(mn, cmd, payload);
};
`
}

function prepareModuleClientTemplate(moduleName: string, records: CQRecord[]) {
    const commandsDtos = records.filter(r => r.moduleName == moduleName && r.recordType == 'COMMAND');
    const queriesDtos = records.filter(r => r.moduleName == moduleName && r.recordType == 'QUERY');
    const commandsImports = commandsDtos.map(d => `import { ${d.dtoClassName} } from "./commands/${d.eventName}";`);
    const queriesImports = queriesDtos.map(d => `import { ${d.dtoClassName} } from "./queries/${d.eventName}";`);
    const commandsList = commandsDtos.map(d => `        '${d.eventName}': ${d.dtoClassName},`);
    const queriesList = queriesDtos.map(d => `        '${d.eventName}': ${d.dtoClassName},`);

    return `${commandsImports.join('\n')}
${queriesImports.join('\n')}

interface HModuleConfigs {
    moduleName: string;
    commands: Record<string, any>;
    queries: Record<string, any>;
}

export class ${pascalCase(moduleName)}Client implements HModuleConfigs {
    moduleName: '${moduleName}';
    commands: {
${commandsList.join('\n')}
    };
    queries: {
${queriesList.join('\n')}
    };
}
`}


const commandDTORegex = new RegExp(/.*CommandDTO {[\s\S]*}/);
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
    const data = await scanModules();
    await prepareFoldersUsingData(data);

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