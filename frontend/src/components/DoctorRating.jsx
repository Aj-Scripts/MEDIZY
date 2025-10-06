import { useState } from 'react';
import { Box, Typography, Rating, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const DoctorRating = ({ doctorId, currentRating, ratingCount, onRatingSubmit, disabled }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating || rating < 1) return;
    
    setSubmitting(true);
    try {
      await onRatingSubmit(rating, review);
      setOpen(false);
      setRating(0);
      setReview('');
    } catch (err) {
      console.error('Rating submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Display average rating */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Rating
          value={currentRating}
          precision={0.5}
          readOnly
          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
        </Typography>
      </Box>

      {/* Rate button for patients */}
      {!disabled && (
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => setOpen(true)}
          sx={{ mt: 1 }}
        >
          Rate this Doctor
        </Button>
      )}

      {/* Rating dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Rate Dr. {/* doctor name will be shown here */}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="legend" sx={{ mr: 2 }}>Rating:</Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
            </Box>
            <TextField
              multiline
              rows={4}
              label="Review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!rating}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorRating;