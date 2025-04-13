import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={2}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          maxWidth: 500, 
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" gutterBottom color="error">
          Something went wrong
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {error.message || 'An unexpected error occurred'}
        </Typography>
        <Box mt={3}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={resetErrorBoundary}
          >
            Try again
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ErrorFallback; 