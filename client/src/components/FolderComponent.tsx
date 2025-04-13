import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { 
  Paper, 
  Typography, 
  IconButton, 
  Box,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Folder, Item } from '../types';
import ItemComponent from './ItemComponent';

interface Props {
  folder: Folder;
  items: Item[];
  index: number;
  onDelete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onToggleFolder: (id: string, isOpen: boolean) => void;
  getDroppableId?: (folderId: string) => string;
}

const FolderComponent: React.FC<Props> = ({ 
  folder, 
  items, 
  index, 
  onDelete, 
  onDeleteItem,
  onToggleFolder,
  getDroppableId 
}) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFolder(folder._id, !folder.isOpen);
  };

  // Get the droppable ID using the provided function or fallback to default
  const droppableId = getDroppableId ? getDroppableId(folder._id) : `folder-${folder._id}`;

  return (
    <Draggable 
      draggableId={`folder-${folder._id}`} 
      index={index}
      shouldRespectForcePress={false}
    >
      {(draggableProvided, draggableSnapshot) => (
        <Paper
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
          sx={{
            mb: 2,
            backgroundColor: draggableSnapshot.isDragging ? 'rgba(63, 81, 181, 0.1)' : '#f5f5f5',
            boxShadow: draggableSnapshot.isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : 1,
            borderRadius: '8px',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
            outline: draggableSnapshot.isDragging ? '2px solid #3f51b5' : 'none',
            transform: draggableSnapshot.isDragging ? 'scale(1.01)' : 'scale(1)',
          }}
        >
          {/* Folder Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              backgroundColor: draggableSnapshot.isDragging ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
              borderBottom: folder.isOpen ? '1px solid rgba(0, 0, 0, 0.12)' : 'none'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flex: 1,
              }}
              {...draggableProvided.dragHandleProps}
            >
              <Tooltip title="Drag to reorder folder">
                <DragIndicatorIcon sx={{ mr: 1, opacity: 0.5, color: 'text.secondary' }} />
              </Tooltip>
              <FolderIcon color="primary" sx={{ mr: 1 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{folder.name}</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.6,
                    fontSize: '0.7rem',
                    display: 'block',
                    marginTop: '-4px'
                  }}
                >
                  Created: {new Date(folder.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton 
                size="small" 
                onClick={handleToggle} 
                aria-label={folder.isOpen ? "collapse folder" : "expand folder"}
              >
                {folder.isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder._id);
                }}
                aria-label="delete folder"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* Folder Content */}
          {folder.isOpen && (
            <Droppable 
              droppableId={droppableId} 
              type="item" 
              isDropDisabled={false}
            >
              {(droppableProvided, droppableSnapshot) => (
                <Box
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  sx={{ 
                    p: 1,
                    backgroundColor: droppableSnapshot.isDraggingOver 
                      ? 'rgba(63, 81, 181, 0.05)' 
                      : 'white',
                    minHeight: '40px',
                    transition: 'background-color 0.2s ease',
                    border: droppableSnapshot.isDraggingOver 
                      ? '1px dashed rgba(63, 81, 181, 0.5)' 
                      : '1px solid transparent',
                    borderRadius: '4px',
                    margin: '4px',
                  }}
                >
                  {items.length === 0 && !droppableSnapshot.isDraggingOver && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textAlign: 'center', 
                        color: 'text.secondary',
                        p: 1,
                        fontStyle: 'italic'
                      }}
                    >
                      Drop Your Item Here
                    </Typography>
                  )}
                  
                  {droppableSnapshot.isDraggingOver && items.length === 0 && (
                    <Box 
                      sx={{
                        p: 1,
                        textAlign: 'center',
                        backgroundColor: 'rgba(63, 81, 181, 0.1)',
                        borderRadius: '4px',
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'primary.main',
                          fontWeight: 'bold',
                        }}
                      >
                        Drop to add to this folder
                      </Typography>
                    </Box>
                  )}
                  
                  {items.map((item, idx) => (
                    <ItemComponent
                      key={item._id}
                      item={item}
                      index={idx}
                      onDelete={onDeleteItem}
                    />
                  ))}
                  {droppableProvided.placeholder}
                </Box>
              )}
            </Droppable>
          )}
        </Paper>
      )}
    </Draggable>
  );
};

export default FolderComponent; 