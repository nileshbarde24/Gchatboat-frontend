# Setup Instructions

## Prerequisites

- **Visual Studio 2017 for Windows:** Ensure you have Visual Studio 2017 installed for development.
- **Node.js:** Version 18 or later is required.

## Database Configuration

### MongoDB Atlas

1. **Create Database:**
   - Create a database named `sample_db`.
2. **Create Collections:**

   - In `sample_db`, create the following collections:
     - `chat_history_topic`
     - `documents`
     - `file_storage`
     - `users`
     - `search_history`

3. **Configure Collections for Embedding:**
   - **Atlas Search Index Setup:**
     - Log in to your MongoDB Atlas account.
     - Navigate to your cluster and select `sample_db`.
     - Go to the Collections view, then click on Atlas Search.
     - Click on Create Search Index.
     - Use the JSON Editor for configuration.
     - Select the `documents` collection. For the index name, enter `default`.
     - In the JSON Editor for each index, paste the following configuration:
       ```json
       {
         "mappings": {
           "dynamic": true,
           "fields": {
             "embedding": {
               "type": "knnVector",
               "dimensions": 1536,
               "similarity": "cosine"
             }
           }
         }
       }
       ```
     - Repeat the process for the `search_history` collection with the index name `history`.

## Environment Variables

- `OPENAI_API_KEY`: Update with your OpenAI API key.
- `MODEL`: Specify the model you intend to use.
- `MONGODB_ATLAS_URI`: Update with your mongodb atlas url
