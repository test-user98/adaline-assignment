import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
  Grid,
} from '@mui/material';
import { Folder } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAddItem: (title: string, icon: string, folderId: string | null) => void;
  onAddFolder: (name: string) => void;
  folders: Folder[];
}

const POPULAR_ICONS = [
  'FaFile',
  'FaImage',
  'FaLink',
  'FaVideo',
  'FaMusic',
  'FaTable',
  'FaList',
];

const AddDialog: React.FC<Props> = ({
  open,
  onClose,
  onAddItem,
  onAddFolder,
  folders,
}) => {
  const [type, setType] = useState<'item' | 'folder'>('item');
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('FaFile');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setName('');
    setSelectedIcon('FaFile');
    setSelectedFolder(null);
    setTitleError(null);
    setNameError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (type === 'item') {
      if (!title.trim()) {
        setTitleError('Item title is required');
        return;
      }
      
      onAddItem(title, selectedIcon, selectedFolder);
      handleClose();
    } else if (type === 'folder') {
      if (!name.trim()) {
        setNameError('Folder name is required');
        return;
      }
      
      onAddFolder(name);
      handleClose();
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setType(event.target.value as 'item' | 'folder');
    // Reset errors when switching types
    setTitleError(null);
    setNameError(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New {type === 'item' ? 'Item' : 'Folder'}</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <RadioGroup
            row
            value={type}
            onChange={handleTypeChange}
          >
            <FormControlLabel value="item" control={<Radio />} label="Item" />
            <FormControlLabel value="folder" control={<Radio />} label="Folder" />
          </RadioGroup>
        </Box>

        {type === 'item' ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Item Title"
              fullWidth
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) {
                  setTitleError(null);
                }
              }}
              error={!!titleError}
              helperText={titleError}
              required
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Folder (Optional)</InputLabel>
              <Select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                label="Folder (Optional)"
              >
                <MenuItem value="">No Folder</MenuItem>
                {folders.map((folder) => (
                  <MenuItem key={folder._id} value={folder._id}>
                    {folder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle1" gutterBottom>
              Pick an Icon
            </Typography>
            <Grid container spacing={1}>
              {POPULAR_ICONS.map((icon) => (
                <Grid key={icon} sx={{ width: { xs: '33.33%', sm: '25%', md: '16.66%' }, p: 0.5 }}>
                  <Button
                    variant={selectedIcon === icon ? 'contained' : 'outlined'}
                    onClick={() => setSelectedIcon(icon)}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {icon.replace('Fa', '')}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) {
                setNameError(null);
              }
            }}
            error={!!nameError}
            helperText={nameError}
            required
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDialog; 