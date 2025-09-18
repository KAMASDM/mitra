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
  Stack,
  IconButton,
  useTheme,
  alpha,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Pagination,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Apps, // Grid view icon
  ViewList, // List view icon
} from '@mui/icons-material';
import { getProfessionals, getProfessionalsCount } from '../../services/userService';

const MotionCard = motion(Card);

const categories = ['All', 'Mental Health', 'Legal Aid', 'Medical Services', 'Career & Placement', 'Financial Guidance'];

const Experts = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Data state
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // Changed default
  
  // UI state
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination state - simplified
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Fetch ALL professionals once and filter client-side (NO INDEXES NEEDED!)
  const fetchProfessionals = async () => {
    setLoading(true);
    setError('');
    setCurrentPage(1);
    
    try {
      // Simple fetch - get all verified professionals
      const result = await getProfessionals({
        // No filters here - get all verified professionals
        pageSize: 100 // Get more items for better client-side filtering
      });

      console.log('Fetched professionals:', result);
      
      if (result.success) {
        setAllProfessionals(result.professionals);
        // Apply all filters immediately
        applyAllFilters(result.professionals);
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

  // Apply all filters and sorting client-side
  const applyAllFilters = (professionals = allProfessionals) => {
    let filtered = [...professionals];

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(prof => prof.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(professional => {
        const hasNameMatch = (professional.first_name?.toLowerCase() ?? '').includes(lowerCaseSearchTerm) ||
                            (professional.last_name?.toLowerCase() ?? '').includes(lowerCaseSearchTerm);
        const hasSpecializationMatch = professional.specializations?.some(spec =>
          (spec.label?.toLowerCase() ?? '').includes(lowerCaseSearchTerm)
        );
        const hasCategoryMatch = (professional.category?.toLowerCase() ?? '').includes(lowerCaseSearchTerm);
        return hasNameMatch || hasSpecializationMatch || hasCategoryMatch;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0); // ascending
        case 'experience':
          return (b.years_of_experience || 0) - (a.years_of_experience || 0); // descending
        case 'newest':
        default:
          // Sort by createdAt if available
          const aDate = a.createdAt?.toDate?.() || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(0);
          return bDate - aDate; // descending (newest first)
      }
    });

    setFilteredProfessionals(filtered);
    setTotalCount(filtered.length);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Apply search filter to current data
  const applySearchFilter = (professionals = allProfessionals) => {
    // This function is now handled by applyAllFilters
    applyAllFilters(professionals);
  };

  // Handle page change - much simpler now
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Get professionals for current page
  const getCurrentPageProfessionals = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProfessionals.slice(startIndex, endIndex);
  };

  // Effect for initial load
  useEffect(() => {
    fetchProfessionals();
  }, []); // Only run once on mount

  // Effect for filter changes - apply client-side filtering
  useEffect(() => {
    if (allProfessionals.length > 0) {
      applyAllFilters();
    }
  }, [selectedCategory, sortBy, searchTerm]);

  const toggleFavorite = (professionalId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(professionalId)) {
      newFavorites.delete(professionalId);
    } else {
      newFavorites.add(professionalId);
    }
    setFavorites(newFavorites);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <Box sx={{ 
      py: 8, 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}
      >
        {/* Header Section - Centered */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
            Find Your Expert
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'text.secondary', 
            lineHeight: 1.6,
            maxWidth: '600px',
            mx: 'auto'
          }}>
            Connect with verified professionals who understand your unique needs and provide safe, inclusive support.
          </Typography>
        </Box>

        {/* Search and Filter Section - Centered */}
        <Box sx={{ 
          mb: 6, 
          p: { xs: 3, md: 4 }, 
          borderRadius: 3, 
          bgcolor: 'background.paper', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          width: '100%',
          maxWidth: '900px'
        }}>
          <Stack spacing={3} alignItems="center">
            {/* Search Bar - Full Width */}
            <Box sx={{ width: '100%', maxWidth: '400px' }}>
              <TextField
                fullWidth
                placeholder="Search by name, specialization, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Box>
            
            {/* Filters Row */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              alignItems="center" 
              justifyContent="center"
              sx={{ width: '100%' }}
            >
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select 
                  value={selectedCategory} 
                  label="Category" 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="price">Price: Low to High</MenuItem>
                  <MenuItem value="experience">Most Experienced</MenuItem>
                </Select>
              </FormControl>
              
              {/* View Toggle */}
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center"
                sx={{
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  borderRadius: '50px',
                  ml: { sm: 2 }
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
            </Stack>
          </Stack>
        </Box>

        {/* Results Info - Centered */}
        {!loading && !error && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Showing {getCurrentPageProfessionals().length} of {filteredProfessionals.length} professionals
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </Typography>
          </Box>
        )}

        {/* Professionals Display Section - Centered */}
        <Box sx={{ width: '100%', maxWidth: '1000px' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 4, textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
              <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                Error Loading Professionals
              </Typography>
              <Typography color="error" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {error}
              </Typography>
              <Button variant="contained" onClick={() => fetchProfessionals()}>
                Retry
              </Button>
            </Paper>
          ) : filteredProfessionals.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                No professionals found matching your criteria
              </Typography>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ mt: 2 }}
              >
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {viewMode === 'grid' ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 3, 
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  {getCurrentPageProfessionals().map((professional, index) => (
                    <Box key={professional.id} sx={{ width: { xs: '100%', sm: '280px', md: '280px' } }}>
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
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/professional/${professional.id}`)}
                      >
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.light', fontSize: '2rem' }}>
                              {professional?.first_name?.charAt(0)?.toUpperCase() ?? 'P'}
                            </Avatar>
                            
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              mb: 1,
                              wordBreak: 'break-word', 
                              textTransform: 'capitalize',
                              minHeight: '32px'
                            }}>
                              {`${professional?.first_name?.toLowerCase() || ''} ${professional?.last_name?.toLowerCase() || ''}`.trim() || 'Unnamed Professional'}
                            </Typography>
                            
                            <Typography variant="body2" color="primary" sx={{ 
                              mb: 2, 
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {professional?.specializations?.[0]?.label ?? 'No Specialization'}
                            </Typography>
                            
                            {professional?.category && (
                              <Chip 
                                label={professional.category.replace(/_/g, ' ')} 
                                size="small" 
                                sx={{ textTransform: 'capitalize' }} 
                              />
                            )}
                          </Box>
                        </CardContent>
                      </MotionCard>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ width: '100%', maxWidth: '700px' }}>
                  {getCurrentPageProfessionals().map((professional, index) => (
                    <MotionCard
                      key={professional.id}
                      component={motion.div}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      sx={{
                        mb: 2,
                        p: 3,
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                        },
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={() => navigate(`/professional/${professional.id}`)}
                    >
                      <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.light', fontSize: '1.5rem', mr: 3 }}>
                        {professional?.first_name?.charAt(0)?.toUpperCase() ?? 'P'}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize', mb: 0.5 }}>
                          {`${professional?.first_name?.toLowerCase() || ''} ${professional?.last_name?.toLowerCase() || ''}`.trim() || 'Unnamed Professional'}
                        </Typography>
                        
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          {professional?.specializations?.[0]?.label ?? 'No Specialization'}
                        </Typography>
                        
                        {professional?.category && (
                          <Chip
                            label={professional.category.replace(/_/g, ' ')}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        )}
                      </Box>
                    </MotionCard>
                  ))}
                </Box>
              )}

              {/* Pagination - Centered */}
              {totalPages > 1 && (
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '1rem',
                        minWidth: '40px',
                        height: '40px',
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Experts;