import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { getDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence, } from "@langchain/core/runnables";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { encryptDbPassword, decryptDbPassword } from '../utils/passwordUtils.js';
import { v4 as uuidv4 } from 'uuid';
// SQL Connection:
// @ts-ignore
async function createDBConnection(req, res) {
    // @ts-ignore
    const userId = req?.userId;
    const { name, type, host, port, username, password, database, isTestConnection } = req.body;
    if (!name || !type || !host || !port || !username || !password || !database || !userId) {
        return res.status(400).json({
            isSuccess: false,
            error: "Invalid parameters"
        });
    }
    try {
        // Check if the connection parameters already exist for the user
        const existingConnection = await getDatabase().collection("db-connections").findOne({
            userId: new ObjectId(userId),
            type,
            host,
            port,
            username,
            database,
        });
        // Decrypt the password if it's already exist in the db else add as it is
        let updatedPassword;
        if (existingConnection?.password) {
            updatedPassword = decryptDbPassword(existingConnection?.password);
        }
        else {
            updatedPassword = password;
        }
        const datasource = new DataSource({
            type: type,
            host: host,
            port: Number(port),
            username: username,
            password: updatedPassword,
            database: database,
        });
        await SqlDatabase.fromDataSourceParams({
            appDataSource: datasource
        });
        // isTestConnection: user is checking the database connection
        // isTestConnection === true don't insert into database else insert it into database
        if (isTestConnection && datasource.isInitialized) {
            return res.status(200).json({
                isSuccess: true,
                message: "Connection established",
                data: {
                    isInitialized: datasource?.isInitialized,
                    connectionId: existingConnection?._id
                }
            });
        }
        if (!isTestConnection && datasource.isInitialized) {
            try {
                // if already inserted with same parameters:
                if (existingConnection && existingConnection._id) {
                    console.log("Connection already exists!");
                    return res.status(200).json({
                        isSuccess: true,
                        message: "Connection already exists!",
                        data: {
                            isInitialized: datasource?.isInitialized,
                            connectionId: existingConnection?._id
                        }
                    });
                }
                else {
                    // TODO encrypt db password
                    const encryptedPassword = encryptDbPassword(password);
                    const insertedConn = await getDatabase().collection("db-connections").insertOne({
                        name,
                        type,
                        host,
                        port,
                        username,
                        password: encryptedPassword,
                        database,
                        userId: new ObjectId(userId),
                        createdDate: new Date().toISOString()
                    });
                    if (insertedConn && insertedConn.acknowledged) {
                        return res.status(200).json({
                            isSuccess: true,
                            message: "Connection added successfully!",
                            data: {
                                isInitialized: datasource?.isInitialized,
                                connectionId: insertedConn?.insertedId
                            }
                        });
                    }
                }
            }
            catch (error) {
                console.log("error: ", error);
                return res.status(500).json({
                    isSuccess: false,
                    message: "Error while inserting connection",
                    error
                });
            }
        }
    }
    catch (error) {
        console.error("error:", error);
        return res.status(500).json({
            isSuccess: false,
            message: "Error connecting to database",
            data: {
                isInitialized: false,
            },
            error
        });
    }
}
// update helper:
async function updateConnection(_id, data) {
    const response = await getDatabase().collection('db-connections').updateOne({
        _id: new ObjectId(_id)
    }, {
        $set: data
    });
    return response;
}
// Update Connection:
// @ts-ignore   
async function updateDBConnection(req, res) {
    try {
        // @ts-ignore
        const userId = req?.userId;
        const { _id, name, type, host, port, username, password, database, isTestConnection } = req.body;
        if (!userId || !_id || !name || !type || !host || !port || !username || !password || !database) {
            return res.status(400).json({
                isSuccess: false,
                error: "Invalid parameters"
            });
        }
        // Check if the connection parameters already exist for the user
        const connection = await getDatabase().collection("db-connections").findOne({ _id: new ObjectId(_id) });
        // Decrypt the password if it's already exist in the db else add as it is
        let updatedPassword = connection?.password ? decryptDbPassword(connection?.password) : password;
        const datasource = new DataSource({
            type: type,
            host: host,
            port: Number(port),
            username: username,
            password: updatedPassword,
            database: database,
        });
        await SqlDatabase.fromDataSourceParams({ appDataSource: datasource });
        // If It's testConnection don't update in the databse
        if (isTestConnection && datasource.isInitialized) {
            return res.status(200).json({
                isSuccess: true,
                message: "Connection made successfully!",
                data: {
                    isInitialized: datasource?.isInitialized,
                    connectionId: connection?._id
                }
            });
        }
        if (!isTestConnection && datasource.isInitialized) {
            // TODO:
            // Add check for password modification
            const updateParams = { name, type, host, port, username, password, database };
            const updateConnResp = await updateConnection(_id, updateParams);
            // TODO add check for modifiedCount and accordingly change response msg
            return res.status(200).json({
                isSuccess: true,
                message: "Connection Updated Successfully",
                data: updateConnResp
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            isSuccess: false,
            message: "Something went wrong!",
            error
        });
    }
}
// SQL History:
async function addSQLHistory(qaPairs) {
    try {
        await getDatabase().collection('sql_history').insertMany(qaPairs);
    }
    catch (error) {
        console.log("addSQLHistory Error: ", error);
    }
}
// Get All History By connectionId and userId
async function getSQLChatHistory(req, res) {
    // @ts-ignore
    const userId = req?.userId;
    const { connectionId } = req.body;
    try {
        const response = await getDatabase().collection("sql_history").find({
            userId: new ObjectId(userId),
            connectionId: new ObjectId(connectionId),
        }).toArray();
        return res.status(200).json({
            isSuccess: true,
            data: response
        });
    }
    catch (error) {
        console.log("getSQLChatHistory error: ", error);
        return res.status(500).json({
            isSuccess: false,
            error
        });
    }
}
// Chat over SQL data:
async function chatWithSQL(req, res) {
    // @ts-ignore
    const userId = req?.userId;
    const { connectionId, question } = req.body;
    const uniqueId = uuidv4();
    // TODO: needs to handle error
    const dbParams = await getDatabase().collection('db-connections').findOne({
        _id: new ObjectId(connectionId),
        userId: new ObjectId(userId)
    });
    if (!dbParams) {
        return res.status(400).json({
            message: "Connection not found",
            data: dbParams
        });
    }
    // TODO: decrypt password
    const originalPassword = decryptDbPassword(dbParams?.password);
    // initialize db connection based on dbParams
    const datasource = new DataSource({
        type: dbParams?.type,
        host: dbParams?.host,
        port: Number(dbParams?.port),
        username: dbParams?.username,
        password: originalPassword,
        database: dbParams?.database,
    });
    try {
        const db = await SqlDatabase.fromDataSourceParams({
            appDataSource: datasource
        });
        if (!datasource.isInitialized) {
            return res.send({
                isSuccess: false,
                data: {
                    isInitialized: datasource?.isInitialized,
                },
                message: "Error connecting to database",
            });
        }
        // SQL query genration for  with an LLM.
        const prompt = PromptTemplate.fromTemplate(`Based on the table schema below, write a SQL query that would answer the user's question:
            {schema}

            Question: {question}
            SQL Query:`);
        const model = new ChatOpenAI({
            temperature: 0,
            modelName: 'gpt-3.5-turbo-16k',
            streaming: true,
        });
        const sqlQueryGeneratorChain = RunnableSequence.from([
            RunnablePassthrough.assign({
                schema: async () => db.getTableInfo(),
            }),
            prompt,
            model.bind({ stop: ["\nSQLResult:"] }),
            new StringOutputParser(),
        ]);
        const generatedQuery = await sqlQueryGeneratorChain.invoke({
            question
        });
        console.log({ generatedQuery });
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
            {
                result: finalResponsePrompt.pipe(model).pipe(new StringOutputParser()),
                // Pipe the query through here unchanged so it gets logged alongside the result.
                // sql: (previousStepResult) => previousStepResult.query,
            },
        ]);
        try {
            // const finalResponse = await fullChain.invoke({
            //     question: question,
            // });
            const finalResponse = await fullChain.stream({
                question: question,
            });
            let answer = '';
            for await (const chunk of finalResponse) {
                console.log(chunk);
                answer += chunk?.result;
                res.write(chunk?.result);
            }
            res.end();
            /**
             * TODO
             * Add sql history logic
             */
            const questionObj = {
                text: question,
                type: 'question',
                qaPairID: uniqueId,
                userId: new ObjectId(userId),
                connectionId: new ObjectId(connectionId),
            };
            const answerObj = {
                text: answer,
                type: 'answer',
                qaPairID: uniqueId,
                userId: new ObjectId(userId),
                connectionId: new ObjectId(connectionId),
            };
            await addSQLHistory([questionObj, answerObj]);
            return;
        }
        catch (error) {
            console.log("Error while generating answer: ", error);
            return res.status(500).json({
                message: "Error while generating answer",
                error
            });
        }
    }
    catch (error) {
        console.error("error:", error?.sqlMessage);
        return res.status(500).json({
            isSuccess: false,
            message: error?.sqlMessage || "Error connecting to database",
            data: {
                isInitialized: datasource?.isInitialized,
            },
            error
        });
    }
}
async function getAllConnections(req, res) {
    // @ts-ignore
    const userId = req?.userId;
    try {
        const connectionsWithUsers = await getDatabase().collection("db-connections").aggregate([
            {
                $match: { "userId": new ObjectId(userId) } // Match documents with the specified userId
            },
            {
                $lookup: {
                    from: "users", // The collection to join with
                    localField: "userId", // The field from the input documents
                    foreignField: "_id", // The field from the documents of the "users" collection
                    as: "userDetails" // The name of the new array field to store the joined documents
                }
            },
            {
                $unwind: "$userDetails" // Unwind the array created by $lookup to get a single document
            },
            {
                $project: {
                    "_id": 1,
                    "name": 1,
                    "type": 1,
                    "host": 1,
                    "port": 1,
                    "username": 1,
                    "database": 1,
                    "password": 1,
                    "userId": 1,
                    "createdDate": 1,
                    "userDetails.firstName": 1,
                    "userDetails.lastName": 1,
                }
            }
        ]).toArray();
        return res.status(200).json({
            isSuccess: true,
            data: connectionsWithUsers
        });
    }
    catch (error) {
        console.log("Get all connection error: ", error);
        return res.status(500).json({
            isSuccess: false,
            error
        });
    }
}
async function deleteConnection(req, res) {
    const { connectionId } = req.body;
    try {
        const response = await getDatabase().collection('db-connections').findOne({
            _id: new ObjectId(connectionId)
        });
        if (!response) {
            return res.status(400).json({
                isSuccess: false,
                data: response,
                error: "Connection not found!"
            });
        }
        const deleteResp = await getDatabase().collection('db-connections').deleteOne({
            _id: new ObjectId(connectionId)
        });
        return res.status(200).json({
            isSuccess: true,
            data: deleteResp
        });
    }
    catch (error) {
        return res.status(500).json({
            isSuccess: false,
            error
        });
    }
}
export { createDBConnection, chatWithSQL, getAllConnections, deleteConnection, updateDBConnection, getSQLChatHistory };
//# sourceMappingURL=sqlController.js.map