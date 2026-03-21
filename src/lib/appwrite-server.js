import { Client, Databases, Account, ID, Query, Users } from "node-appwrite";

function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    account: new Account(client),
    databases: new Databases(client),
    users: new Users(client),
  };
}

function createSessionClient(session) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setSession(session);

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

const COLLECTION = {
  USERS_DATA: "users_data",
  TASKS: "tasks",
  PREDICTIONS: "predictions",
};

export { createAdminClient, createSessionClient, DATABASE_ID, COLLECTION, ID, Query };
