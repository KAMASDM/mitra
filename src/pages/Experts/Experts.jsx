// src/pages/Experts/Experts.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Stack,
  IconButton,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LocationOn,
  Schedule,
  Verified,
  Star,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { getProfessionals } from '../../services/userService';

const MotionCard = motion(Card);

const categories = ['All', 'Mental Health', 'Legal Aid', 'Medical Services', 'Career & Placement', 'Financial Guidance'];

const Experts = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState(new Set());

  // Fetch data from Firestore based on filters
  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getProfessionals({
          verified: true,
          category: selectedCategory,
          sortBy: sortBy,
        });

        if (result.success) {
          setAllProfessionals(result.professionals);
          setFilteredProfessionals(result.professionals);
        } else {
          setError(result.error || 'Failed to fetch professionals.');
        }
      } catch (err) {
        setError('An error occurred while fetching professionals.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [selectedCategory, sortBy]); // Re-fetch when category or sort option changes

  // Handle client-side search filtering
  useEffect(() => {
    const results = allProfessionals.filter(professional =>
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (professional.specialties && professional.specialties.some(specialty =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
    setFilteredProfessionals(results);
  }, [searchTerm, allProfessionals]);


  const toggleFavorite = (professionalId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(professionalId)) {
      newFavorites.delete(professionalId);
    } else {
      newFavorites.add(professionalId);
    }
    setFavorites(newFavorites);
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
            Find Your Expert
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
            Connect with verified professionals who understand your unique needs and provide safe, inclusive support.
          </Typography>
        </Box>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 6, p: 4, borderRadius: 3, bgcolor: 'background.paper', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, specialization, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="price">Price: Low to High</MenuItem>
                  <MenuItem value="experience">Most Experienced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                {filteredProfessionals.length} professionals found
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Professionals Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', p: 4, bgcolor: 'rgba(255,0,0,0.05)', borderRadius: 2 }}>
            {error.toString()}
            <br />
            If this is an index error, please ensure you have created the necessary composite indexes in your Firestore database.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {filteredProfessionals.map((professional, index) => (
              <Grid item xs={12} sm={6} lg={4} key={professional.id}>
                <MotionCard
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'visible',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.light' }}>{professional.name.charAt(0)}</Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{professional.name}</Typography>
                    <Typography variant="body1" color="primary" sx={{ mb: 1 }}>{professional.specialization}</Typography>
                    <Rating value={professional.rating} readOnly precision={0.5} />
                    <Chip label={professional.category} size="small" sx={{ mt: 2 }}/>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* No Results */}
        {!loading && filteredProfessionals.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
              No professionals found matching your criteria
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSortBy('rating');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Experts;