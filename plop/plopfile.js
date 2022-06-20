module.exports = function (plop) {
    // controller generator
    plop.setGenerator('worker', {
        description: 'generate a camunda worker task handler',
        prompts: [{
            type: 'input',
            name: 'module',
            message: 'module name please'
        }, {
            type: 'input',
            name: 'topic',
            message: 'topic name please'
        }],
        actions: [{
            type: 'add',
            path: 'src/{{module}}/workers/{{topic}}.ts',
            templateFile: './workers/worker.camunda.hbs'
        }, {
            type: 'add',
            path: 'src/{{module}}/workers/_index.ts',
            skipIfExists: true,
            templateFile: './workers/_index.hbs'
        }, {
            type: 'append',
            path: 'src/{{module}}/workers/_index.ts',
            pattern: '*** import section ***',
            template: 'import { {{ properCase topic}}Worker } from "./{{topic}}";',
        }, {
            type: 'append',
            path: 'src/{{module}}/workers/_index.ts',
            pattern: '*** handlers section ***',
            template: '\t{{ properCase topic}}Worker,',
        }]
    });
    plop.setGenerator('command', {
        description: 'generate a command with http post handler',
        prompts: [{
            type: 'input',
            name: 'module',
            message: 'module name please'
        }, {
            type: 'input',
            name: 'topic',
            message: 'topic name please'
        }],
        actions: [{
            type: 'add',
            path: 'src/{{module}}/commands/{{topic}}.ts',
            templateFile: './commands/command.http.hbs'
        }, {
            type: 'add',
            path: 'src/{{module}}/commands/_index.ts',
            skipIfExists: true,
            templateFile: './commands/_index.hbs'
        }, {
            type: 'append',
            path: 'src/{{module}}/commands/_index.ts',
            pattern: '*** import section ***',
            template: 'import { {{ properCase topic}}Command } from "./{{topic}}";',
        }, {
            type: 'append',
            path: 'src/{{module}}/commands/_index.ts',
            pattern: '*** handlers section ***',
            template: '\t{{ properCase topic}}Command,',
        }]
    });
    plop.setGenerator('command.save', {
        description: 'generate a save command with http post handler',
        prompts: [{
            type: 'input',
            name: 'module',
            message: 'module?'
        }, {
            type: 'input',
            name: 'entity',
            message: 'entityName?'
        }],
        actions: [{
            type: 'add',
            path: 'src/{{module}}/commands/{{entity}}.save.ts',
            templateFile: './commands/save.command.http.hbs'
        }, {
            type: 'add',
            path: 'src/{{module}}/commands/_index.ts',
            skipIfExists: true,
            templateFile: './commands/_index.hbs'
        }, {
            type: 'append',
            path: 'src/{{module}}/commands/_index.ts',
            pattern: '*** import section ***',
            template: 'import { {{ properCase entity}}SaveCommand } from "./{{entity}}.save";',
        }, {
            type: 'append',
            path: 'src/{{module}}/commands/_index.ts',
            pattern: '*** handlers section ***',
            template: '\t{{ properCase entity}}SaveCommand,',
        }]
    });
    plop.setGenerator('query', {
        description: 'generate a query with http post handler',
        prompts: [{
            type: 'input',
            name: 'module',
            message: 'module name please'
        }, {
            type: 'input',
            name: 'topic',
            message: 'topic name please'
        }],
        actions: [{
            type: 'add',
            path: 'src/{{module}}/queries/{{topic}}.ts',
            templateFile: './queries/query.http.hbs'
        }, {
            type: 'add',
            path: 'src/{{module}}/queries/_index.ts',
            skipIfExists: true,
            templateFile: './queries/_index.hbs'
        }, {
            type: 'append',
            path: 'src/{{module}}/queries/_index.ts',
            pattern: '*** import section ***',
            template: 'import { {{ properCase topic}}Query } from "./{{topic}}";',
        }, {
            type: 'append',
            path: 'src/{{module}}/queries/_index.ts',
            pattern: '*** handlers section ***',
            template: '\t{{ properCase topic}}Query,',
        }]
    });
    plop.setGenerator('query.findAll', {
        description: 'generate a query with http post handler',
        prompts: [{
            type: 'input',
            name: 'module',
            message: 'module name please'
        }, {
            type: 'input',
            name: 'topic',
            message: 'topic name please',
            default: 'findAll',
        }, {
            type: 'input',
            name: 'entity',
            message: 'entity name please'
        }],
        actions: [{
            type: 'add',
            path: 'src/{{module}}/queries/{{entity}}.{{topic}}.ts',
            templateFile: './queries/findAll.query.http.hbs'
        }, {
            type: 'add',
            path: 'src/{{module}}/queries/_index.ts',
            skipIfExists: true,
            templateFile: './queries/_index.hbs'
        }, {
            type: 'append',
            path: 'src/{{module}}/queries/_index.ts',
            pattern: '*** import section ***',
            template: 'import { {{ properCase entity}}{{ properCase topic}}Query } from "./{{entity}}.{{topic}}";',
        }, {
            type: 'append',
            path: 'src/{{module}}/queries/_index.ts',
            pattern: '*** handlers section ***',
            template: '\t{{ properCase entity}}{{ properCase topic}}Query,',
        }]
    });
    plop.setGenerator('query.findById', {
        description: 'generate a query with http post handler',
        prompts: [{
            type: 'input',
            name: 'module',
            message: 'module name please'
        }, {
            type: 'input',
            name: 'topic',
            message: 'topic name please',
            default: 'findById',
        }, {
            type: 'input',
            name: 'entity',
            message: 'entity name please'
        }],
        actions: [{
            type: 'add',
            path: 'src/{{module}}/queries/{{entity}}.{{topic}}.ts',
            templateFile: './queries/findById.query.http.hbs'
        }, {
            type: 'add',
            path: 'src/{{module}}/queries/_index.ts',
            skipIfExists: true,
            templateFile: './queries/_index.hbs'
        }, {
            type: 'append',
            path: 'src/{{module}}/queries/_index.ts',
            pattern: '*** import section ***',
            template: 'import { {{ properCase entity}}{{properCase topic}}Query } from "./{{entity}}.{{topic}}";',
        }, {
            type: 'append',
            path: 'src/{{module}}/queries/_index.ts',
            pattern: '*** handlers section ***',
            template: '\t{{ properCase entity}}{{properCase topic}}Query,',
        }]
    });
};