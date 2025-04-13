import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult, DroppableProvided } from 'react-beautiful-dnd';
import { Container, Box, Typography, Button, Fab, AppBar, Toolbar, CircularProgress, useScrollTrigger, Avatar, Stack, alpha } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderSpecial from '@mui/icons-material/FolderSpecial';
import Layers from '@mui/icons-material/Layers';
import { ErrorBoundary } from 'react-error-boundary';
import { 
  fetchData, 
  createItem, 
  createFolder, 
  updateFolder, 
  deleteFolder, 
  deleteItem,
  reorderItems as apiReorderItems,
  ReorderData
} from './services/api';
import { initSocket } from './services/socket';
import { Item, Folder, DragResult } from './types';
import ItemComponent from './components/ItemComponent';
import FolderComponent from './components/FolderComponent';
import AddDialog from './components/AddDialog';
import ErrorFallback from './components/ErrorFallback';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchData();
      setItems(data.items);
      setFolders(data.folders);
    } catch (error) {
      console.error('Error loading data', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const cleanup = initSocket({
      onItemCreate: (item) => {
        setItems((prevItems) => [...prevItems, item]);
      },
      onItemUpdate: (updatedItem) => {
        setItems((prevItems) =>
          prevItems.map((item) => (item._id === updatedItem._id ? updatedItem : item))
        );
      },
      onItemDelete: (id) => {
        setItems((prevItems) => prevItems.filter((item) => item._id !== id));
      },
      onFolderCreate: (folder) => {
        setFolders((prevFolders) => [...prevFolders, folder]);
      },
      onFolderUpdate: (updatedFolder) => {
        setFolders((prevFolders) => {
          const folderExists = prevFolders.some(folder => folder._id === updatedFolder._id);
          if (!folderExists) {
            return prevFolders;
          }
          return prevFolders.map((folder) => 
            (folder._id === updatedFolder._id ? updatedFolder : folder)
          );
        });
      },
      onFolderDelete: (id) => {
        setFolders((prevFolders) => prevFolders.filter((folder) => folder._id !== id));
        setItems((prevItems) => prevItems.filter((item) => item.folderId !== id));
      },
      onReorder: (data) => {
        if (data.items) {
          setItems((prevItems) => {
            const updatedItems = [...prevItems];
            data.items.forEach(({ id, order, folderId }: { id: string; order: number; folderId: string | null }) => {
              const index = updatedItems.findIndex((item) => item._id === id);
              if (index !== -1) {
                updatedItems[index] = {
                  ...updatedItems[index],
                  order,
                  folderId,
                };
              }
            });
            return updatedItems.sort((a, b) => a.order - b.order);
          });
        }

        if (data.folders) {
          setFolders((prevFolders) => {
            const updatedFolders = [...prevFolders];
            data.folders.forEach(({ id, order }: { id: string; order: number }) => {
              const index = updatedFolders.findIndex((folder) => folder._id === id);
              if (index !== -1) {
                updatedFolders[index] = {
                  ...updatedFolders[index],
                  order,
                };
              }
            });
            return updatedFolders.sort((a, b) => a.order - b.order);
          });
        }
      },
    });

    return cleanup;
  }, []);

  const handleAddItem = useCallback(async (title: string, icon: string, folderId: string | null) => {
    try {
      await createItem({ title, icon, folderId });
    } catch (error) {
      console.error('Error adding item', error);
      setError('Failed to add item. Please try again.');
    }
  }, []);

  const handleAddFolder = useCallback(async (name: string) => {
    try {
      await createFolder({ name });
    } catch (error) {
      console.error('Error adding folder', error);
      setError('Failed to add folder. Please try again.');
    }
  }, []);

  const handleDeleteFolder = useCallback(async (id: string) => {
    try {
      await deleteFolder(id);
    } catch (error) {
      console.error('Error deleting folder', error);
      setError('Failed to delete folder. Please try again.');
    }
  }, []);

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      await deleteItem(id);
    } catch (error) {
      console.error('Error deleting item', error);
      setError('Failed to delete item. Please try again.');
    }
  }, []);

  const handleToggleFolder = useCallback(async (id: string, isOpen: boolean) => {
    try {
      await updateFolder(id, { isOpen });
    } catch (error) {
      console.error('Error toggling folder', error);
      setError('Failed to toggle folder. Please try again.');
    }
  }, []);

  // Create stable droppable IDs
  const rootDroppableId = useMemo(() => 'root', []);
  const foldersDroppableId = useMemo(() => 'folders', []);
  
  // Function to get a folder's droppable ID
  const getFolderDroppableId = useCallback((folderId: string) => {
    return `folder-${folderId}`;
  }, []);
  
  // Function to extract folder ID from a droppable ID
  const getFolderIdFromDroppableId = useCallback((droppableId: string) => {
    if (droppableId === rootDroppableId) {
      return null;
    }
    if (droppableId.startsWith('folder-')) {
      return droppableId.replace('folder-', '');
    }
    return null;
  }, [rootDroppableId]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    try {
      if (!result) {
        return;
      }
      
      const { source, destination, draggableId, type } = result as DragResult;
      
      if (!source || !draggableId || !type) {
        return;
      }
      
      if (!destination) {
        return;
      }

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      if (type === 'item') {
        const itemExists = items.some(item => item._id === draggableId);
        if (!itemExists) {
          return;
        }
      } else if (type === 'folder') {
        const draggedFolderId = draggableId.replace('folder-', '');
        const folderExists = folders.some(folder => folder._id === draggedFolderId);
        if (!folderExists) {
          return;
        }
      }

      if (type === 'folder') {
        const orderedFolders = [...folders].sort((a, b) => a.order - b.order);
        
        const draggedFolderId = draggableId.replace('folder-', '');
        const folderIndex = orderedFolders.findIndex(f => f._id === draggedFolderId);
        
        if (folderIndex === -1) {
          return;
        }
        
        const [movedFolder] = orderedFolders.splice(folderIndex, 1);
        
        orderedFolders.splice(destination.index, 0, movedFolder);
        
        const folderUpdates = orderedFolders.map((folder, index) => ({
          id: folder._id,
          order: index,
        }));
        
        setFolders(
          orderedFolders.map((folder, index) => ({
            ...folder,
            order: index,
          }))
        );
        
        try {
          const reorderData: ReorderData = { folders: folderUpdates };
          await apiReorderItems(reorderData);
        } catch (error) {
          console.error('Error reordering folders', error);
          setError('Failed to save folder reordering. Refreshing data...');
          loadData();
        }
        
        return;
      }
      
      const itemId = draggableId;
      const sourceDroppableId = source.droppableId;
      const destinationDroppableId = destination.droppableId;
      
      let sourceFolderId: string | null = null;
      let destinationFolderId: string | null = null;
      
      sourceFolderId = getFolderIdFromDroppableId(sourceDroppableId);
      destinationFolderId = getFolderIdFromDroppableId(destinationDroppableId);
      
      const itemToMove = items.find(item => item._id === itemId);
      if (!itemToMove) {
        return;
      }
      
      const sourceItems = items
        .filter(item => item.folderId === sourceFolderId)
        .sort((a, b) => a.order - b.order);
        
      const destinationItems = sourceFolderId === destinationFolderId
        ? sourceItems
        : items
            .filter(item => item.folderId === destinationFolderId)
            .sort((a, b) => a.order - b.order);
      
      const newSourceItems = [...sourceItems];
      
      const sourceItemIndex = newSourceItems.findIndex(item => item._id === itemId);
      if (sourceItemIndex !== -1) {
        newSourceItems.splice(sourceItemIndex, 1);
      }
      
      if (sourceFolderId === destinationFolderId) {
        newSourceItems.splice(destination.index, 0, itemToMove);
        
        const itemUpdates = newSourceItems.map((item, index) => ({
          id: item._id,
          order: index,
          folderId: sourceFolderId
        }));
        
        setItems(items.map(item => {
          if (item.folderId === sourceFolderId) {
            const idx = newSourceItems.findIndex(i => i._id === item._id);
            if (idx !== -1) {
              return { ...item, order: idx };
            }
          }
          return item;
        }));
        
        try {
          const reorderData: ReorderData = { items: itemUpdates };
          await apiReorderItems(reorderData);
        } catch (error) {
          console.error('Error reordering items', error);
          setError('Failed to save item reordering. Refreshing data...');
          loadData();
        }
      } else {
        const newDestinationItems = [...destinationItems];
        
        const updatedItem = { ...itemToMove, folderId: destinationFolderId };
        newDestinationItems.splice(destination.index, 0, updatedItem);
        
        const sourceUpdates = newSourceItems.map((item, index) => ({
          id: item._id,
          order: index,
          folderId: sourceFolderId
        }));
        
        const destinationUpdates = newDestinationItems.map((item, index) => ({
          id: item._id,
          order: index,
          folderId: destinationFolderId
        }));
        
        const allUpdates = [
          ...sourceUpdates,
          ...destinationUpdates
        ];
        
        setItems(items.map(item => {
          if (item._id === itemId) {
            return { ...item, order: destination.index, folderId: destinationFolderId };
          } else if (item.folderId === sourceFolderId) {
            const idx = newSourceItems.findIndex(i => i._id === item._id);
            if (idx !== -1) {
              return { ...item, order: idx };
            }
          } else if (item.folderId === destinationFolderId) {
            const idx = newDestinationItems.findIndex(i => i._id === item._id);
            if (idx !== -1) {
              return { ...item, order: idx };
            }
          }
          return item;
        }));
        
        try {
          const reorderData: ReorderData = { items: allUpdates };
          await apiReorderItems(reorderData);
        } catch (error) {
          console.error('Error moving item between containers', error);
          setError('Failed to move item. Refreshing data...');
          loadData();
        }
      }
    } catch (error) {
      console.error('Unexpected error during drag and drop:', error);
      setError('An unexpected error occurred. Refreshing data...');
      loadData();
    }
  }, [items, folders, getFolderIdFromDroppableId, loadData]);

  const toggleDialog = useCallback((isOpen: boolean) => {
    setDialogOpen(isOpen);
  }, []);

  const rootItems = useMemo(() => 
    items
      .filter((item) => item.folderId === null)
      .sort((a, b) => a.order - b.order),
    [items]
  );

  const getFolderItems = useCallback((folderId: string) => {
    return items
      .filter((item) => item.folderId === folderId)
      .sort((a, b) => a.order - b.order);
  }, [items]);

  const handleErrorReset = () => {
    setError(null);
    loadData();
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleErrorReset}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div>
          <AppBar 
            position="sticky" 
            elevation={3}
            sx={{ 
              background: `linear-gradient(90deg, #3f51b5 0%, #002984 100%)`,
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Toolbar sx={{ py: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha('#ffffff', 0.2), 
                    color: '#ffffff',
                    width: 40, 
                    height: 40,
                    mr: 2,
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.3),
                      transform: 'rotate(10deg)'
                    }
                  }}
                >
                  <Layers />
                </Avatar>
                <Typography 
                  variant="h5" 
                  component="div" 
                  sx={{ 
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Items Organizer
                </Typography>
              </Box>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Stack direction="row" spacing={1}>
                <Button 
                  startIcon={<FolderSpecial />}
                  variant="contained" 
                  color="secondary" 
                  onClick={() => setDialogOpen(true)}
                  sx={{ 
                    bgcolor: alpha('#ffffff', 0.15),
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.25),
                      transform: 'translateY(-2px)'
                    },
                    fontWeight: 500,
                    px: 2,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    '&:active': {
                      transform: 'translateY(1px)'
                    }
                  }}
                >
                  Add New
                </Button>
              </Stack>
            </Toolbar>
          </AppBar>

          <Container maxWidth="md" sx={{ mt: 5, mb: 5, px: { xs: 2, sm: 3 } }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box 
                textAlign="center" 
                p={3} 
                bgcolor="error.light" 
                color="error.contrastText"
                borderRadius={1}
                mb={2}
              >
                <Typography>{error}</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={handleErrorReset}
                >
                  Retry
                </Button>
              </Box>
            ) : (
              <>
                <Box mb={4}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Folders
                  </Typography>
                  <Droppable droppableId={foldersDroppableId} type="folder" direction="vertical" isDropDisabled={false}>
                    {(provided: DroppableProvided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        style={{
                          minHeight: '60px',
                          padding: '12px',
                          backgroundColor: snapshot.isDraggingOver 
                            ? 'rgba(63, 81, 181, 0.15)' 
                            : '#f9f9f9',
                          borderRadius: '8px',
                          border: snapshot.isDraggingOver 
                            ? '2px dashed #3f51b5' 
                            : '1px solid #e0e0e0',
                          transition: 'all 0.3s ease',
                          boxShadow: snapshot.isDraggingOver 
                            ? 'inset 0 0 8px rgba(63, 81, 181, 0.2)' 
                            : 'none',
                        }}
                        data-testid="folder-droppable"
                      >
                        {folders.length === 0 && !snapshot.isDraggingOver && (
                          <Typography
                            variant="body1"
                            sx={{
                              textAlign: 'center',
                              color: 'text.secondary',
                              py: 2,
                              fontStyle: 'italic'
                            }}
                          >
                            No folders yet. Add a folder using the + button.
                          </Typography>
                        )}
                        
                        {snapshot.isDraggingOver && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              right: 0, 
                              bottom: 0, 
                              pointerEvents: 'none',
                              zIndex: 0,
                              animation: 'pulse 1.5s infinite',
                              '@keyframes pulse': {
                                '0%': { opacity: 0.2 },
                                '50%': { opacity: 0.4 },
                                '100%': { opacity: 0.2 },
                              },
                            }} 
                          />
                        )}
                        
                        {folders.map((folder, index) => (
                          <FolderComponent
                            key={folder._id}
                            folder={folder}
                            items={getFolderItems(folder._id)}
                            index={index}
                            onDelete={handleDeleteFolder}
                            onDeleteItem={handleDeleteItem}
                            onToggleFolder={handleToggleFolder}
                            getDroppableId={getFolderDroppableId}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Box>

                <Box mb={2}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Items
                  </Typography>
                  <Droppable droppableId={rootDroppableId} type="item" direction="vertical" isDropDisabled={false}>
                    {(provided: DroppableProvided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        style={{ 
                          minHeight: '120px', 
                          padding: '12px', 
                          backgroundColor: snapshot.isDraggingOver 
                            ? 'rgba(63, 81, 181, 0.15)' 
                            : '#f9f9f9',
                          borderRadius: '8px',
                          border: snapshot.isDraggingOver 
                            ? '2px dashed #3f51b5' 
                            : '1px solid #e0e0e0',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          boxShadow: snapshot.isDraggingOver 
                            ? 'inset 0 0 8px rgba(63, 81, 181, 0.2)' 
                            : 'none',
                        }}
                        data-testid="root-items-droppable"
                      >
                        {rootItems.length === 0 && !snapshot.isDraggingOver && (
                          <Typography
                            variant="body1"
                            sx={{
                              textAlign: 'center',
                              color: 'text.secondary',
                              py: 2,
                              fontStyle: 'italic'
                            }}
                          >
                            No items in the root area. Add items or drag them here.
                          </Typography>
                        )}
                        
                        {snapshot.isDraggingOver && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              right: 0, 
                              bottom: 0, 
                              backgroundColor: 'rgba(63, 81, 181, 0.05)',
                              pointerEvents: 'none',
                              zIndex: 0,
                              borderRadius: '4px',
                              animation: 'pulse 1.5s infinite',
                              '@keyframes pulse': {
                                '0%': { opacity: 0.3 },
                                '50%': { opacity: 0.7 },
                                '100%': { opacity: 0.3 },
                              },
                            }} 
                          />
                        )}
                        
                        {rootItems.map((item, index) => (
                          <ItemComponent
                            key={item._id}
                            item={item}
                            index={index}
                            onDelete={handleDeleteItem}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Box>
              </>
            )}
          </Container>

          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setDialogOpen(true)}
          >
            <AddIcon />
          </Fab>

          <AddDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onAddItem={handleAddItem}
            onAddFolder={handleAddFolder}
            folders={folders}
          />
        </div>
      </DragDropContext>
    </ErrorBoundary>
  );
}

export default App;
