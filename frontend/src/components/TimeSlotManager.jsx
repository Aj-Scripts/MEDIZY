import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimeSlotManager = ({ initialSchedule = {}, onSave }) => {
  const [schedule, setSchedule] = useState(() => {
    const defaultSchedule = {};
    DAYS.forEach(day => {
      defaultSchedule[day] = initialSchedule[day] || [];
    });
    return defaultSchedule;
  });

  const [selectedDays, setSelectedDays] = useState(() => {
    return DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: initialSchedule[day]?.length > 0 || false
    }), {});
  });

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleAddTimeSlot = () => {
    if (!startTime || !endTime || !Object.values(selectedDays).some(v => v)) return;
    
    const newTimeSlot = `${startTime}-${endTime}`;
    const newSchedule = { ...schedule };
    
    // Add the time slot only to selected days
    DAYS.forEach(day => {
      if (selectedDays[day]) {
        newSchedule[day] = [
          ...(schedule[day] || []).filter(slot => slot !== newTimeSlot),
          newTimeSlot
        ].sort();
      }
    });
    
    setSchedule(newSchedule);
    setStartTime('');
    setEndTime('');
  };

  const handleRemoveTimeSlot = (timeSlot) => {
    const newSchedule = {};
    DAYS.forEach(day => {
      newSchedule[day] = schedule[day].filter(slot => slot !== timeSlot);
    });
    setSchedule(newSchedule);
  };

  const handleSave = () => {
    onSave(schedule);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Time Slots Management
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Day Selection */}
        <Typography variant="subtitle2" gutterBottom>
          Select Days
        </Typography>
        <FormGroup row sx={{ mb: 2 }}>
          {DAYS.map(day => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={selectedDays[day]}
                  onChange={() => setSelectedDays(prev => ({
                    ...prev,
                    [day]: !prev[day]
                  }))}
                />
              }
              label={day}
            />
          ))}
        </FormGroup>

        <Divider sx={{ my: 2 }} />
        
        {/* Time Slot Input */}
        <Typography variant="subtitle2" gutterBottom>
          Add Time Slot
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            inputProps={{ step: 300 }}
            sx={{ width: 150 }}
          />
          <TextField
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            inputProps={{ step: 300 }}
            sx={{ width: 150 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTimeSlot}
            disabled={!startTime || !endTime || !Object.values(selectedDays).some(v => v)}
          >
            Add Time Slot
          </Button>
        </Box>

        {/* Time Slots List */}
        <Typography variant="subtitle2" gutterBottom>
          Current Time Slots
        </Typography>
        <List>
          {Object.entries(schedule).map(([day, slots]) => (
            slots.length > 0 && (
              <ListItem key={day}>
                <ListItemText
                  primary={`${day}: ${slots.join(', ')}`}
                />
                {slots.map(slot => (
                  <IconButton
                    key={`${day}-${slot}`}
                    edge="end"
                    onClick={() => handleRemoveTimeSlot(slot)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                ))}
              </ListItem>
            )
          ))}
        </List>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave} color="primary">
          Save Schedule
        </Button>
      </Box>
    </Box>
  );
};

export default TimeSlotManager;