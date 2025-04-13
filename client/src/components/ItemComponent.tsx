import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, Typography, IconButton, Box, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Item } from '../types';

// Dynamically import icons from react-icons
import * as FaIcons from 'react-icons/fa';

// Create an icon mapping with just the needed icon sets
const iconSets: { [key: string]: any } = {
  Fa: FaIcons,
};

interface Props {
  item: Item;
  index: number;
  onDelete: (id: string) => void;
}

const ItemComponent: React.FC<Props> = ({ item, index, onDelete }) => {
  // Dynamically render the icon
  const renderIcon = (iconName: string) => {
    const prefix = iconName.substring(0, 2);
    const iconSet = iconSets[prefix];
    
    if (iconSet && iconSet[iconName]) {
      const IconComponent = iconSet[iconName];
      return <IconComponent size={24} />;
    }
    
    return null;
  };

  return (
    <Draggable 
      draggableId={item._id} 
      index={index}
      shouldRespectForcePress={false}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 1,
            backgroundColor: snapshot.isDragging ? 'rgba(63, 81, 181, 0.15)' : 'white',
            boxShadow: snapshot.isDragging ? '0 8px 16px rgba(63, 81, 181, 0.25)' : 1,
            transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
            outline: snapshot.isDragging ? '2px solid #3f51b5' : 'none',
            position: 'relative',
            zIndex: snapshot.isDragging ? 9999 : 'auto',
            cursor: 'grab',
          }}
        >
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box 
                display="flex" 
                alignItems="center"
                sx={{ width: '100%' }}
              >
                <Box 
                  {...provided.dragHandleProps}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: snapshot.isDragging ? 'primary.main' : 'text.secondary',
                    mr: 1,
                    cursor: 'grab',
                  }}
                >
                  <Tooltip title="Drag to move item">
                    <DragIndicatorIcon 
                      fontSize="small" 
                      sx={{ 
                        opacity: snapshot.isDragging ? 1 : 0.5, 
                        mr: 0.5,
                        display: { xs: 'block', sm: 'block' }
                      }} 
                    />
                  </Tooltip>
                  <Box 
                    color={snapshot.isDragging ? 'primary.dark' : 'primary.main'}
                    sx={{ transition: 'color 0.2s ease' }}
                  >
                    {renderIcon(item.icon)}
                  </Box>
                </Box>
                <Box sx={{ flex: 1, overflow: 'hidden', ml: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: snapshot.isDragging ? 500 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.6,
                      fontSize: '0.7rem',
                      display: 'block',
                      marginTop: '-2px'
                    }}
                  >
                    Created: {new Date(item.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(item._id);
                }} 
                aria-label="delete"
                sx={{
                  opacity: 0.7,
                  '&:hover': { opacity: 1 },
                  ml: 1,
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </CardContent>
          {snapshot.isDragging && (
            <Box 
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                zIndex: 1,
              }}
            >
              ↕
            </Box>
          )}
        </Card>
      )}
    </Draggable>
  );
};

export default ItemComponent; 