import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const generateTradeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildDescendantIds = (trades, targetId) => {
  const ids = new Set([targetId]);
  let queue = [targetId];

  while (queue.length > 0) {
    const current = queue.pop();
    trades.forEach((trade) => {
      if (trade.parentId === current && !ids.has(trade.id)) {
        ids.add(trade.id);
        queue.push(trade.id);
      }
    });
  }

  return ids;
};

const useTradeStore = create(
  persist(
    (set, get) => ({
      trades: [],
      courseTradeMap: {},
      batchTradeMap: {},

      createTrade: ({ name, parentId = null }) => {
        const trimmedName = String(name || "").trim();
        if (!trimmedName) {
          return null;
        }

        const newTrade = {
          id: generateTradeId(),
          name: trimmedName,
          parentId: parentId || null,
        };

        set((state) => ({ trades: [...state.trades, newTrade] }));
        return newTrade;
      },

      updateTrade: (id, updates) => {
        set((state) => ({
          trades: state.trades.map((trade) =>
            trade.id === id
              ? {
                  ...trade,
                  name: (updates.name ?? trade.name).trim(),
                  parentId:
                    updates.parentId === undefined
                      ? trade.parentId
                      : updates.parentId || null,
                }
              : trade,
          ),
        }));
      },

      deleteTrade: (id) => {
        const { trades, courseTradeMap, batchTradeMap } = get();
        const idsToRemove = buildDescendantIds(trades, id);

        const nextTrades = trades.filter((trade) => !idsToRemove.has(trade.id));

        const pruneMap = (map) => {
          const next = { ...map };
          Object.keys(next).forEach((key) => {
            if (idsToRemove.has(next[key])) {
              delete next[key];
            }
          });
          return next;
        };

        set({
          trades: nextTrades,
          courseTradeMap: pruneMap(courseTradeMap),
          batchTradeMap: pruneMap(batchTradeMap),
        });
      },

      assignTradeToCourse: (courseId, tradeId) => {
        set((state) => ({
          courseTradeMap: {
            ...state.courseTradeMap,
            [courseId]: tradeId || null,
          },
        }));
      },

      assignTradeToBatch: (batchId, tradeId) => {
        set((state) => ({
          batchTradeMap: {
            ...state.batchTradeMap,
            [batchId]: tradeId || null,
          },
        }));
      },

      getTradeById: (id) => {
        return get().trades.find((trade) => trade.id === id) || null;
      },

      getTradeLabel: (id) => {
        const trade = get().trades.find((t) => t.id === id);
        return trade?.name || "Unassigned";
      },
    }),
    {
      name: "trade-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useTradeStore;
