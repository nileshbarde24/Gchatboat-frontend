import { DataSource } from "typeorm";
import { OpenAI } from "@langchain/openai";
import { SqlDatabase } from "langchain/sql_db";
import { SqlDatabaseChain } from "langchain/chains/sql_db";
import { PromptTemplate } from "@langchain/core/prompts";
import dotenv from 'dotenv';
dotenv.config();
const template = `Given an input question, first create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
Use the following format:

Question: "Question here"
SQLQuery: "SQL Query to run"
SQLResult: "Result of the SQLQuery"
Answer: "Final answer here"

Only use the following tables:

{table_info}

Question: {input}`;
const prompt = PromptTemplate.fromTemplate(template);
const datasource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'classicmodels',
    // database: 'lending_platform'
});
// const datasource = new DataSource({
//     type: "mysql",
//     database: "exmaples/Chinook_MySql.db",
//     username: "root",
//     password: "root"
//     // password: "p4ssw0rd"            
//     // database: "Chinook.db",
// });
const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
});
const chain = new SqlDatabaseChain({
    llm: new OpenAI({
        temperature: 0,
        modelName: 'gpt-3.5-turbo-16k',
    }),
    database: db,
    sqlOutputKey: "sql",
    prompt,
});
// const res = await chain.run("How many customers are there?");
//  "How many employees are there in the foobar table?",
// How many loan types are available?   
// Write all details related to customerNumber 103 (db=classicmodels)
// Describe the employees table
const res = await chain.call({
    query: "Describe the employees table",
});
console.log(res);
//# sourceMappingURL=test.js.map