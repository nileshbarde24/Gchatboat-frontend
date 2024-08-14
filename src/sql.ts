import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { ChatOpenAI } from "@langchain/openai";
import {
    RunnablePassthrough,
    RunnableSequence,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from 'dotenv';

// import { CallbackManager } from 'langchain/callbacks';
// https://js.langchain.com/docs/modules/chains/popular/sqlite/

dotenv.config();

const datasource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'test',
    password: 'Pass@123',
    database: 'classicmodels',
    // database: 'lending_platform',
});

const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
    // includesTables: ['customers', 'employees']
    // ignoreTables: ['orderdetails', 'orders']

});

// SQL query genration for  with an LLM.
const prompt =
    PromptTemplate.fromTemplate(`Based on the table schema below, write a SQL query that would answer the user's question:
{schema}

Question: {question}
SQL Query:`);

const model = new ChatOpenAI({
    temperature: 0,
    modelName: 'gpt-3.5-turbo-16k',
    // streaming: true,
    // callbacks: CallbackManager.fromHandlers({
    //     async handleLLMNewToken(token: string) {
    //         console.log({ token })
    //     },
    // })
});


// Type your query to retrieve data from your SQL database.
let question = "How many orders are In Process;";
// let question = "Who works here?";
console.log({ question })



// The `RunnablePassthrough.assign()` is used here to passthrough the input from the `.invoke()`
// call (in this example it's the question), along with any inputs passed to the `.assign()` method.
// In this case, we're passing the schema.
const sqlQueryGeneratorChain = RunnableSequence.from([
    RunnablePassthrough.assign({
        schema: async () => db.getTableInfo(),
    }),
    prompt,
    model.bind({ stop: ["\nSQLResult:"] }),
    new StringOutputParser(),
]);

// const result = await sqlQueryGeneratorChain.invoke({
//     question: question,
// });

// console.log({
//     result,
// });

const finalResponsePrompt = PromptTemplate.fromTemplate(`
Based on the table schema below, question, sql query, and sql response, write a natural language response:
{schema}

Question: {question}
SQL Query: {query}
SQL Response: {response}
`);

const fullChain = RunnableSequence.from([
    RunnablePassthrough.assign({
        query: sqlQueryGeneratorChain,
    }),
    {
        schema: async () => db.getTableInfo(),
        question: (input) => input.question,
        query: (input) => input.query,
        response: (input) => db.run(input.query),

    },
    // finalResponsePrompt,
    // model,
    // new StringOutputParser(),
    {
        result: finalResponsePrompt.pipe(model).pipe(new StringOutputParser()),
        // Pipe the query through here unchanged so it gets logged alongside the result.
        sql: (previousStepResult) => previousStepResult.query,
    },

]);

const finalResponse = await fullChain.invoke({
    question: question,
});

// console.log({ finalResponse });
console.log(finalResponse);


// Stream Response:
// const finalResponse = await fullChain.stream({
//     question: question,
// });

// for await (const chunk of finalResponse) {
//     console.log(chunk);
// }

