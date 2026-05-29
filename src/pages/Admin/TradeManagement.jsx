import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { TRADES } from "../../constants/trades";

/**
 * Trade Management - Read-only View
 *
 * Displays the fixed set of hardcoded trades.
 * No creation, editing, or deletion - trades are managed via constants.
 *
 * Architecture: Trade → Course → Batch
 */
const TradeManagement = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-6 md:p-8"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Trade Management</h1>
          <p className="text-muted-foreground mt-2">
            Fixed set of available trades for your institution. Trades organize
            courses and batches in the hierarchy: Trade → Course → Batch.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Trades are now fixed and managed through the
            application constants. To add or modify trades, please contact your
            system administrator.
          </p>
        </div>

        {/* Trades List */}
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Available Trades</h2>
            <span className="text-sm text-muted-foreground">
              {TRADES.length} total trades
            </span>
          </div>

          {TRADES.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No trades configured.
            </div>
          ) : (
            <div className="divide-y">
              {TRADES.map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 px-6 py-5 hover:bg-muted/30 transition-colors"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BookOpen size={20} />
                  </div>

                  {/* Trade Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {trade.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ID:{" "}
                      <code className="bg-muted px-2 py-1 rounded">
                        {trade.id}
                      </code>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Active
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Architecture Info */}
        <div className="bg-muted/50 border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-foreground">Architecture Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {TRADES.length}
              </div>
              <p className="text-sm text-muted-foreground">Trades</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-2">∞</div>
              <p className="text-sm text-muted-foreground">Courses per Trade</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-2">∞</div>
              <p className="text-sm text-muted-foreground">
                Batches per Course
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TradeManagement;
