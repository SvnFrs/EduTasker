import { prisma } from "../config/database.js";

export interface ReorderItem {
  id: string;
  newOrder: number;
}

export interface SingleReorderOptions {
  itemId: string;
  newOrder: number;
  projectId: string;
  tableName: "board" | "task";
  additionalWhereClause?: any;
}

export interface BulkReorderOptions {
  items: ReorderItem[];
  projectId: string;
  tableName: "board" | "task";
  additionalWhereClause?: any;
}

export const reorderSingleItem = async (options: SingleReorderOptions): Promise<void> => {
  const { itemId, newOrder, projectId, tableName, additionalWhereClause = {} } = options;

  const currentItem = await (prisma[tableName] as any).findUnique({
    where: { id: itemId },
  });

  if (!currentItem) {
    throw new Error(`${tableName.charAt(0).toUpperCase() + tableName.slice(1)} not found`);
  }

  const currentOrder = currentItem.order;

  if (currentOrder === newOrder) {
    return;
  }

  const projectWhereClause = tableName === "board" ? { projectId } : { board: { projectId } };

  await (prisma[tableName] as any).updateMany({
    where: {
      ...projectWhereClause,
      ...additionalWhereClause,
      order: { gte: newOrder },
      id: { not: itemId },
    },
    data: {
      order: { increment: 1 },
    },
  });

  await (prisma[tableName] as any).update({
    where: { id: itemId },
    data: { order: newOrder },
  });
};

export const reorderMultipleItems = async (options: BulkReorderOptions): Promise<void> => {
  const { items, projectId, tableName, additionalWhereClause = {} } = options;

  if (items.length === 0) {
    return;
  }

  const itemIds = items.map((item) => item.id);
  const projectWhereClause = tableName === "board" ? { projectId } : { board: { projectId } };

  const existingItems = await (prisma[tableName] as any).findMany({
    where: {
      id: { in: itemIds },
      ...projectWhereClause,
      ...additionalWhereClause,
    },
    select: {
      id: true,
      order: true,
    },
  });

  if (existingItems.length !== itemIds.length) {
    throw new Error(`Some ${tableName}s do not belong to this project or do not exist`);
  }

  const sortedItems = items.sort((a, b) => a.newOrder - b.newOrder);

  for (const { id: itemId, newOrder } of sortedItems) {
    const currentItem = existingItems.find(
      (item: { id: string; order: number }) => item.id === itemId,
    );
    if (!currentItem) continue;

    const currentOrder = currentItem.order;

    if (currentOrder === newOrder) continue;

    const itemAtTargetPosition = await (prisma[tableName] as any).findFirst({
      where: {
        ...projectWhereClause,
        ...additionalWhereClause,
        order: newOrder,
        id: { not: itemId },
      },
    });

    if (itemAtTargetPosition) {
      await (prisma[tableName] as any).updateMany({
        where: {
          ...projectWhereClause,
          ...additionalWhereClause,
          order: { gte: newOrder },
          id: { not: itemId },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    await (prisma[tableName] as any).update({
      where: { id: itemId },
      data: { order: newOrder },
    });

    currentItem.order = newOrder;
  }
};

export const adjustOrderForNewItem = async (
  newOrder: number,
  projectId: string,
  tableName: "board" | "task",
  additionalWhereClause: any = {},
): Promise<void> => {
  const projectWhereClause = tableName === "board" ? { projectId } : { board: { projectId } };

  const existingItem = await (prisma[tableName] as any).findFirst({
    where: {
      ...projectWhereClause,
      ...additionalWhereClause,
      order: newOrder,
    },
  });

  if (existingItem) {
    await (prisma[tableName] as any).updateMany({
      where: {
        ...projectWhereClause,
        ...additionalWhereClause,
        order: { gte: newOrder },
      },
      data: {
        order: { increment: 1 },
      },
    });
  }
};

export const adjustOrderForDeletedItem = async (
  deletedOrder: number,
  projectId: string,
  tableName: "board" | "task",
  additionalWhereClause: any = {},
): Promise<void> => {
  const projectWhereClause = tableName === "board" ? { projectId } : { board: { projectId } };

  await (prisma[tableName] as any).updateMany({
    where: {
      ...projectWhereClause,
      ...additionalWhereClause,
      order: { gt: deletedOrder },
    },
    data: {
      order: { decrement: 1 },
    },
  });
};

export const getNextOrderNumber = async (
  projectId: string,
  tableName: "board" | "task",
  additionalWhereClause: any = {},
): Promise<number> => {
  const projectWhereClause = tableName === "board" ? { projectId } : { board: { projectId } };

  const lastItem = await (prisma[tableName] as any).findFirst({
    where: {
      ...projectWhereClause,
      ...additionalWhereClause,
    },
    orderBy: { order: "desc" },
  });

  return (lastItem?.order || 0) + 1;
};
