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
    Paper,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
  } from '@mui/material';
  import { motion } from 'framer-motion';
  import { useNavigate } from 'react-router-dom';
  import {
    Search,
    Verified,
    Star,
    Favorite,
    FavoriteBorder,
    Apps, // Grid view icon
    ViewList, // List view icon
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
    const [viewMode, setViewMode] = useState('grid'); // New state for view mode
  
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
          console.log('Fetched professionals:', result);
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
    }, [selectedCategory, sortBy]);
  
    useEffect(() => {
      if (!searchTerm) {
        setFilteredProfessionals(allProfessionals);
        return;
      }
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const results = allProfessionals.filter(professional => {
        const hasNameMatch = (professional.name?.toLowerCase() ?? '').includes(lowerCaseSearchTerm);
        const hasSpecializationMatch = (professional.specialization?.toLowerCase() ?? '').includes(lowerCaseSearchTerm);
        const hasSpecialtyMatch = professional.specialties?.some(specialty =>
          (specialty?.toLowerCase() ?? '').includes(lowerCaseSearchTerm)
        );
        return hasNameMatch || hasSpecializationMatch || hasSpecialtyMatch;
      });
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
        <Container maxWidth="xl" style={{ position: 'relative', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
              Find Your Expert
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
              Connect with verified professionals who understand your unique needs and provide safe, inclusive support.
            </Typography>
          </Box>
  
          {/* Search and Filter Section with View Toggles */}
          <Box sx={{ mb: 6, p: 4, borderRadius: 3, bgcolor: 'background.paper', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <Grid container spacing={3} alignItems="center" justifyContent="space-between" position='relative'>
              <Grid item xs={12} md={10}>
                <Grid container spacing={2} alignItems="center">
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
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ minWidth: 150 }}>
                      <InputLabel>Category</InputLabel>
                      <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Sort By</InputLabel>
                      <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                        <MenuItem value="rating">Highest Rated</MenuItem>
                        <MenuItem value="price">Price: Low to High</MenuItem>
                        <MenuItem value="experience">Most Experienced</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              {/* Right side: View Toggles */}
              <Grid item xs={12} md={2}>
                {/* This is the new container for the view icons */}
                <Stack 
                  direction="row" 
                  spacing={1} 
                  alignItems="center" 
                  justifyContent="flex-end"
                  sx={{
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                    borderRadius: '50px',
                    // p: 0.5,
                    width: 'fit-content',
                    ml: 'auto',
                  }}
                >
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    sx={{
                      borderRadius: '50%',
                      bgcolor: viewMode === 'grid' ? theme.palette.primary.main : 'transparent',
                      color: viewMode === 'grid' ? theme.palette.common.white : theme.palette.text.secondary,
                      border: viewMode === 'grid' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      '&:hover': {
                        bgcolor: viewMode === 'grid' ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
                      },
                      p: '8px',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Apps />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode('list')}
                    sx={{
                      borderRadius: '50%',
                      bgcolor: viewMode === 'list' ? theme.palette.primary.main : 'transparent',
                      color: viewMode === 'list' ? theme.palette.common.white : theme.palette.text.secondary,
                      border: viewMode === 'list' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      '&:hover': {
                        bgcolor: viewMode === 'list' ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
                      },
                      p: '8px',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <ViewList />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          </Box>
  
          {/* Professionals Display Section */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: 'center', p: 4, bgcolor: 'rgba(255,0,0,0.05)', borderRadius: 2, maxWidth: '100%', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
              {error.toString()}
              <br />
              If this is an index error, please ensure you have created the necessary composite indexes in your Firestore database.
            </Typography>
          ) : filteredProfessionals.length === 0 ? (
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
          ) : (
            viewMode === 'grid' ? (
              <Grid container spacing={4} mb={4}>
                {filteredProfessionals.map((professional, index) => (
                  <Grid item key={professional.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                      <CardContent sx={{ flexGrow: 1, p: 3, mb: 2 }}>
                        <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.light' }}>
                          {professional?.first_name?.charAt(0)?.toUpperCase() ?? 'P'}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700, minHeight: '32px', wordBreak: 'break-word', textTransform: 'capitalize' }}>
                          {`${professional?.first_name?.toLowerCase() || ''} ${professional?.last_name?.toLowerCase() || ''}`.trim() || 'Unnamed Professional'}
                        </Typography>
                        <Typography variant="body1" color="primary" sx={{ mb: 1, minHeight: '24px', wordBreak: 'break-word' }}>
                          {professional?.specializations?.[0]?.label ?? 'No Specialization'}
                        </Typography>
                        {professional?.domain && (
                          <Chip label={professional.domain.replace(/_/g, ' ')} size="small" sx={{ mt: 2, textTransform: 'capitalize' }} />
                        )}
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <List sx={{ width: '100%', p: 0 }}>
                {filteredProfessionals.map((professional, index) => (
                  <ListItem
                    key={professional.id}
                    component={motion.div}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      transition: 'box-shadow 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                      },
                      width: '100%',
                      mx: 'auto', 
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.light' }}>
                        {professional?.first_name?.charAt(0)?.toUpperCase() ?? 'P'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {`${professional?.first_name?.toLowerCase() || ''} ${professional?.last_name?.toLowerCase() || ''}`.trim() || 'Unnamed Professional'}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" color="primary" sx={{ display: 'inline' }}>
                            {professional?.specializations?.[0]?.label ?? 'No Specialization'}
                          </Typography>
                          {professional?.domain && (
                            <Chip
                              label={professional.domain.replace(/_/g, ' ')}
                              size="small"
                              sx={{ ml: 1, textTransform: 'capitalize' }}
                            />
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )
          )}
        </Container>
      </Box>
    );
  };
  
  export default Experts;
  
  