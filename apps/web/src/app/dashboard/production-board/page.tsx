"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "@/lib/store";
import type { BoardCard, BoardColumn } from "@/lib/types";
import { v4 as uuid } from "uuid";
import { Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

function DraggableCard({ card }: { card: BoardCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("bg-white p-3 rounded-xl border shadow-sm mb-2", isDragging && "opacity-40")}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing mt-0.5 touch-none">
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{card.title}</p>
          {card.description && <p className="text-xs text-slate-500 mt-1">{card.description}</p>}
          {card.deadline && <p className="text-xs text-indigo-600 mt-1">📅 {card.deadline}</p>}
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({ column, onAddCard, children }: { column: BoardColumn; onAddCard: (colId: string) => void; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-slate-100 rounded-2xl p-4 min-w-[260px] flex-shrink-0 min-h-[200px] transition-colors",
        isOver && "bg-indigo-50 ring-2 ring-indigo-300"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">{column.title}</h3>
        <span className="text-xs text-slate-400">{column.cards.length}</span>
      </div>
      <div className="min-h-[80px]">{children}</div>
      <button onClick={() => onAddCard(column.id)} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg flex items-center justify-center gap-1">
        <Plus className="w-4 h-4" /> Add card
      </button>
    </div>
  );
}

export default function ProductionBoardPage() {
  const { boardColumns, updateBoardColumns } = useAppStore();
  const [activeCard, setActiveCard] = useState<BoardCard | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const findColumn = (cardId: string): string | undefined => {
    for (const col of boardColumns) {
      if (col.cards.find((c) => c.id === cardId)) return col.id;
    }
    return undefined;
  };

  const resolveColumnId = (id: string): string | undefined => {
    if (boardColumns.some((c) => c.id === id)) return id;
    return findColumn(id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const colId = findColumn(event.active.id as string);
    if (colId) {
      const card = boardColumns.find((c) => c.id === colId)?.cards.find((c) => c.id === event.active.id);
      if (card) setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeColId = findColumn(active.id as string);
    const overColId = resolveColumnId(over.id as string);

    if (!activeColId || !overColId) return;

    const sourceCol = boardColumns.find((c) => c.id === activeColId)!;
    const card = sourceCol.cards.find((c) => c.id === active.id)!;

    if (activeColId === overColId) return;

    updateBoardColumns(
      boardColumns.map((col) => {
        if (col.id === activeColId) return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
        if (col.id === overColId) return { ...col, cards: [...col.cards, card] };
        return col;
      })
    );
  };

  const handleAddCard = (colId: string) => {
    if (addingToColumn === colId && newCardTitle.trim()) {
      const card: BoardCard = { id: uuid(), title: newCardTitle.trim() };
      updateBoardColumns(
        boardColumns.map((col) => (col.id === colId ? { ...col, cards: [...col.cards, card] } : col))
      );
      setNewCardTitle("");
      setAddingToColumn(null);
    } else {
      setAddingToColumn(colId);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">📋 Production Board</h1>
        <p className="text-slate-500 mt-1">Kanban-style workflow to manage every video from brainstorming to upload.</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {boardColumns.map((column) => (
            <div key={column.id}>
              <DroppableColumn column={column} onAddCard={handleAddCard}>
                {column.cards.map((card) => (
                  <DraggableCard key={card.id} card={card} />
                ))}
              </DroppableColumn>
              {addingToColumn === column.id && (
                <div className="mt-2 p-3 bg-white rounded-xl border">
                  <input
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCard(column.id)}
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
                    placeholder="Card title..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleAddCard(column.id)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">Add</button>
                    <button onClick={() => setAddingToColumn(null)} className="px-3 py-1 text-slate-500 text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeCard && (
            <div className="bg-white p-3 rounded-xl border shadow-lg w-[240px] rotate-2">
              <p className="font-medium text-sm">{activeCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
