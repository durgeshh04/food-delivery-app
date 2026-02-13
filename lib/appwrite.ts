import { CreateUserPrams, SignInParams } from "@/type";
import { Account, Avatars, Client, ID, TablesDB } from "appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_DATABASE_ID!,
  userTableId: process.env.EXPO_PUBLIC_USER_TABLE_ID!,
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
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
      [`userId="${currAccount.$id}"`],
    );

    return {
      account: currAccount,
      profile: userRows.rows[0] ?? null,
    };
  } catch (error: any) {
    // Not logged in → return null
    if (error.code === 401) return null;

    console.log("Get current user error:", error);
    throw error;
  }
};
