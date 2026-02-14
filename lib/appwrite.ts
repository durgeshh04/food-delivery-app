import { CreateUserPrams, GetMenuParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  ID,
  Query,
  Storage,
  TablesDB,
} from "appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_DATABASE_ID!,
  bucketId: process.env.EXPO_PUBLIC_BUCKET_ID!,
  userTableId: process.env.EXPO_PUBLIC_USER_TABLE_ID!,
  categoriesTableId: process.env.EXPO_PUBLIC_CATEGORIES_TABLE_ID!,
  menuTableId: process.env.EXPO_PUBLIC_MENU_TABLE_ID!,
  customizationsTableId: process.env.EXPO_PUBLIC_CUSTOMIZATION_TABLE_ID!,
  menuCustomizationsTableId:
    process.env.EXPO_PUBLIC_MENU_CUSTOMIZATION_TABLE_ID!,
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({
  email,
  password,
  fullname,
}: CreateUserPrams) => {
  try {
    // 1️⃣ Create auth account
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      fullname,
    );

    if (!newAccount) throw new Error("Failed to create user");

    // 2️⃣ Sign in
    await account.createEmailPasswordSession(email, password);

    // 3️⃣ Generate avatar
    const avatarUrl = avatars.getInitials(fullname);

    // 4️⃣ Create row in your Table
    const newUser = await tablesDB.createRow(
      appwriteConfig.databaseId,
      appwriteConfig.userTableId,
      ID.unique(),
      {
        userId: newAccount.$id,
        fullname,
        email,
        avatar: avatarUrl,
      },
    );

    return newUser;
  } catch (error) {
    console.log("Create user error:", error);
    throw error;
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  return await account.createEmailPasswordSession(email, password);
};

export const getCurrentUser = async () => {
  try {
    const currAccount = await account.get();
    if (!currAccount) return null;

    const userRows = await tablesDB.listRows(
      appwriteConfig.databaseId,
      appwriteConfig.userTableId,
      [Query.equal("userId", currAccount.$id)],
    );

    const profile = userRows.rows[0] ?? null;

    return {
      account: currAccount,
      profile,
    };
  } catch (error: any) {
    if (error.code === 401) return null;
    console.log("Get current user error:", error);
    throw error;
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await tablesDB.listRows(
      appwriteConfig.databaseId,
      appwriteConfig.menuTableId,
      queries,
    );

    return menus.rows;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

export const getCategories = async () => {
  try {
    const categories = await tablesDB.listRows(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesTableId,
    );

    return categories.rows;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
