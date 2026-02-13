import { ID } from "appwrite";
import { appwriteConfig, storage, tablesDB } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

//
// 🧹 Clear table rows
//
async function clearTable(tableId: string) {
  const rows = await tablesDB.listRows(appwriteConfig.databaseId, tableId);

  await Promise.all(
    rows.rows.map((row: any) =>
      tablesDB.deleteRow(appwriteConfig.databaseId, tableId, row.$id),
    ),
  );
}

//
// 🧹 Clear storage
//
async function clearStorage() {
  const files = await storage.listFiles(appwriteConfig.bucketId);

  await Promise.all(
    files.files.map((file: any) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id),
    ),
  );
}

//
// 📤 Upload image to storage
//
async function uploadImageToStorage(imageUrl: string) {
  const file = await storage.createFile(appwriteConfig.bucketId, ID.unique(), {
    uri: imageUrl,
    name: imageUrl.split("/").pop() || "image.jpg",
    type: "image/jpeg",
  } as any);

  return storage.getFileView(appwriteConfig.bucketId, file.$id);
}

//
// 🌱 Seed database
//
async function seed() {
  console.log("🌱 Starting seed...");

  // 1️⃣ Clear tables
  await clearTable(appwriteConfig.categoriesTableId);
  await clearTable(appwriteConfig.customizationsTableId);
  await clearTable(appwriteConfig.menuTableId);
  await clearTable(appwriteConfig.menuCustomizationsTableId);
  await clearStorage();

  // 2️⃣ Create Categories
  const categoryMap: Record<string, string> = {};

  for (const cat of data.categories) {
    const row = await tablesDB.createRow(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesTableId,
      ID.unique(),
      {
        name: cat.name,
        description: cat.description,
      },
    );

    categoryMap[cat.name] = row.$id;
  }

  // 3️⃣ Create Customizations
  const customizationMap: Record<string, string> = {};

  for (const cus of data.customizations) {
    const row = await tablesDB.createRow(
      appwriteConfig.databaseId,
      appwriteConfig.customizationsTableId,
      ID.unique(),
      {
        name: cus.name,
        price: cus.price,
        type: cus.type,
      },
    );

    customizationMap[cus.name] = row.$id;
  }

  // 4️⃣ Create Menu Items
  const menuMap: Record<string, string> = {};

  for (const item of data.menu) {
    const row = await tablesDB.createRow(
      appwriteConfig.databaseId,
      appwriteConfig.menuTableId,
      ID.unique(),
      {
        name: item.name,
        description: item.description,
        image_url: item.image_url,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryMap[item.category_name],
      },
    );

    menuMap[item.name] = row.$id;

    for (const cusName of item.customizations) {
      await tablesDB.createRow(
        appwriteConfig.databaseId,
        appwriteConfig.menuCustomizationsTableId,
        ID.unique(),
        {
          menu: row.$id,
          customizations: customizationMap[cusName],
        },
      );
    }
  }

  console.log("✅ Seeding complete.");
}

export default seed;
