export interface Item {
  _id: string;
  title: string;
  icon: string;
  folderId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  _id: string;
  name: string;
  isOpen: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DragResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
  draggableId: string;
  type: string;
} 