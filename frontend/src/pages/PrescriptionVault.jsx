import {
  Card,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Avatar,
  Box,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useState } from 'react';

const PrescriptionVault = () => {
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, title: 'Blood Test Report', date: '2025-09-15' },
    { id: 2, title: 'Prescription – Dr. Sarah Wilson', date: '2025-09-10' },
  ]);

  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Prescription Vault
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        {prescriptions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No prescriptions uploaded yet.
          </Typography>
        ) : (
          <List>
            {prescriptions.map((p) => (
              <ListItem
                key={p.id}
                sx={{ borderBottom: '1px solid #f0f0f0' }}
                secondaryAction={
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => alert('Open ' + p.title)}
                  >
                    View
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <DescriptionIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={p.title}
                  secondary={`Uploaded on ${p.date}`}
                />
              </ListItem>
            ))}
          </List>
        )}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => alert('Upload New')}
          >
            Upload New Prescription
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default PrescriptionVault;
