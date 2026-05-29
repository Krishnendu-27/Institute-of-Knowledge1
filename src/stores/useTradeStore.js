import { create } from "zustand";
import { TRADES, getTradeById, getTradeLabel } from "../constants/trades";

/**
 * Trade Store - Simplified Version
 *
 * Manages trade assignments to courses and batches.
 * Uses hardcoded TRADES constant instead of dynamic creation.
 * No persistence - trades are loaded from constant.
 *
 * Architecture: Trade → Course → Batch
 */
const useTradeStore = create((set, get) => ({
  trades: TRADES,
  courseTradeMap: {},
  batchTradeMap: {},

  /**
   * Assign a trade to a course
   */
  assignTradeToCourse: (courseId, tradeId) => {
    set((state) => ({
      courseTradeMap: {
        ...state.courseTradeMap,
        [courseId]: tradeId || null,
      },
    }));
  },

  /**
   * Assign a trade to a batch
   */
  assignTradeToBatch: (batchId, tradeId) => {
    set((state) => ({
      batchTradeMap: {
        ...state.batchTradeMap,
        [batchId]: tradeId || null,
      },
    }));
  },

  /**
   * Get trade by id from constant
   */
  getTradeById: (id) => {
    return getTradeById(id);
  },

  /**
   * Get trade label by id
   */
  getTradeLabel: (id) => {
    return getTradeLabel(id);
  },
}));

export default useTradeStore;
