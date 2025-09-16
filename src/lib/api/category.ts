export type ItemCategory = {
  id: string;
  name: string;
  children?: ItemCategory[];
};


import axios from "axios";

function generateId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

async function transformCategories(
  data: { topCategory: string; subCategory: string }[],
): Promise<ItemCategory[]> {
  const categoryMap: { [key: string]: ItemCategory } = {};

  data.forEach((item) => {
    const topId = generateId(item.topCategory);
    if (!categoryMap[topId]) {
      categoryMap[topId] = {
        id: topId,
        name: item.topCategory,
        children: [],
      };
    }

    const subId = generateId(item.subCategory);
    categoryMap[topId].children?.push({
      id: subId,
      name: item.subCategory,
    });
  });

  const topLevelCategories = Object.values(categoryMap);

  return [
    {
      id: "all",
      name: "전체",
      children: topLevelCategories,
    },
  ];
}

export async function fetchCategories(): Promise<ItemCategory[]> {
  try {
    const response = await axios.get(
      "/api/items/categories",
    );
    if (response.data && response.data.data) {
      return transformCategories(response.data.data);
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}