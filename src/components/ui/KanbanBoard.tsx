"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export type KanbanCard = {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  [key: string]: any;
};

export type KanbanBoardProps = {
  columns: string[];
  cards: KanbanCard[];
  onCardMoved: (cardId: string, newStatus: string) => void;
  onCardClick?: (cardId: string) => void;
};

export default function KanbanBoard({ columns, cards, onCardMoved, onCardClick }: KanbanBoardProps) {
  const [boardData, setBoardData] = useState<Record<string, KanbanCard[]>>({});

  useEffect(() => {
    const newBoardData: Record<string, KanbanCard[]> = {};
    columns.forEach(col => {
      newBoardData[col] = cards.filter(c => c.status === col);
    });
    setBoardData(newBoardData);
  }, [cards, columns]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = boardData[source.droppableId];
      const destColumn = boardData[destination.droppableId];
      const sourceItems = [...sourceColumn];
      const destItems = [...destColumn];
      const [removed] = sourceItems.splice(source.index, 1);
      
      removed.status = destination.droppableId;
      destItems.splice(destination.index, 0, removed);
      
      setBoardData({
        ...boardData,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      });

      onCardMoved(removed.id, destination.droppableId);
    } else {
      const column = boardData[source.droppableId];
      const copiedItems = [...column];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setBoardData({
        ...boardData,
        [source.droppableId]: copiedItems
      });
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[500px]">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((colId) => {
          const columnCards = boardData[colId] || [];
          return (
            <div key={colId} className="flex-shrink-0 w-80 flex flex-col bg-muted/30 rounded-2xl border border-border">
              <div className="p-4 border-b border-border flex justify-between items-center bg-card rounded-t-2xl">
                <h3 className="font-semibold text-foreground capitalize">{colId}</h3>
                <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                  {columnCards.length}
                </span>
              </div>

              <Droppable droppableId={colId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-4 flex flex-col gap-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                  >
                    {columnCards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 bg-card rounded-xl border cursor-pointer transition-all ${snapshot.isDragging ? 'shadow-lg border-primary rotate-2 scale-105' : 'shadow-sm border-border hover:border-primary/50 hover:shadow-md'}`}
                            onClick={() => onCardClick?.(card.id)}
                          >
                            <h4 className="font-semibold text-foreground mb-1">{card.title}</h4>
                            {card.subtitle && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{card.subtitle}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
