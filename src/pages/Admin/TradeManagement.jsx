import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Edit3, Plus, Trash2, X } from "lucide-react";
import useTradeStore from "../../stores/useTradeStore";

const buildTree = (trades) => {
  const map = new Map();
  trades.forEach((trade) => map.set(trade.id, { ...trade, children: [] }));

  const roots = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const flattenTree = (nodes, level = 0, rows = []) => {
  nodes.forEach((node) => {
    rows.push({ node, level });
    if (node.children?.length) {
      flattenTree(node.children, level + 1, rows);
    }
  });
  return rows;
};

const TradeManagement = () => {
  const trades = useTradeStore((state) => state.trades);
  const createTrade = useTradeStore((state) => state.createTrade);
  const updateTrade = useTradeStore((state) => state.updateTrade);
  const deleteTrade = useTradeStore((state) => state.deleteTrade);

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingParentId, setEditingParentId] = useState("");

  const treeRows = useMemo(() => {
    const tree = buildTree(trades);
    return flattenTree(tree);
  }, [trades]);

  const handleCreate = (event) => {
    event.preventDefault();
    const created = createTrade({ name, parentId: parentId || null });
    if (created) {
      setName("");
      setParentId("");
    }
  };

  const handleEditStart = (trade) => {
    setEditingId(trade.id);
    setEditingName(trade.name);
    setEditingParentId(trade.parentId || "");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
    setEditingParentId("");
  };

  const handleEditSave = () => {
    if (!editingId) return;
    updateTrade(editingId, {
      name: editingName,
      parentId: editingParentId || null,
    });
    handleEditCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-6 md:p-8 transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trade Management</h1>
          <p className="text-muted-foreground mt-2">
            Organize courses and batches with a nested trade structure.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Trade Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Computer Trade"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Parent Trade
            </label>
            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">No Parent (Root)</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              <Plus size={18} />
              Add Trade
            </button>
          </div>
        </form>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Trade Hierarchy
            </h2>
            <span className="text-sm text-muted-foreground">
              {trades.length} total trades
            </span>
          </div>

          {treeRows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No trades created yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {treeRows.map(({ node, level }) => {
                const isEditing = editingId === node.id;
                return (
                  <div
                    key={node.id}
                    className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4"
                  >
                    <div className="flex-1 flex items-center gap-3">
                      <span
                        className="text-xs text-muted-foreground"
                        style={{ marginLeft: `${level * 16}px` }}
                      >
                        {level > 0 ? ">".repeat(level) : ""}
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      ) : (
                        <p className="font-semibold text-foreground">
                          {node.name}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      {isEditing && (
                        <select
                          value={editingParentId}
                          onChange={(event) =>
                            setEditingParentId(event.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">No Parent</option>
                          {trades
                            .filter((trade) => trade.id !== node.id)
                            .map((trade) => (
                              <option key={trade.id} value={trade.id}>
                                {trade.name}
                              </option>
                            ))}
                        </select>
                      )}

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleEditSave}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors"
                          >
                            <Check size={16} /> Save
                          </button>
                          <button
                            type="button"
                            onClick={handleEditCancel}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors"
                          >
                            <X size={16} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditStart(node)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors"
                          >
                            <Edit3 size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTrade(node.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TradeManagement;
