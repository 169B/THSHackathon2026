import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("69bd4b5a00212be16c71");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
