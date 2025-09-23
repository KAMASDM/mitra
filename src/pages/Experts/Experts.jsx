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
import { getProfessionals, getProfessionalsCount, getAllSpecializations } from '../../services/userService';

const MotionCard = motion(Card);

// const categories = ['All', 'Mental Health', 'Legal Aid', 'Medical Services', 'Career & Placement', 'Financial Guidance'];
// src/pages/Experts/Experts.jsx

const categories = [
  { value: 'All', label: 'All' },
  { value: 'Therapeutic Approach', label: 'Mental Health' },
  { value: 'Legal Aid', label: 'Legal Aid' },
  { value: 'Medical Services', label: 'Medical Services' },
  { value: 'Career & Placement', label: 'Career & Placement' },
  { value: 'Financial Guidance', label: 'Financial Guidance' },
];

const Experts = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Data state
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);   // Loading and error state
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // Changed default
  const [favorites, setFavorites] = useState(new Set());   // UI state
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);   // Pagination state - simplified
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchAndMergeData = async () => {
      setLoading(true);
      setError('');
      try {
        // Step 1: Dono collections ka data ek saath fetch karein.
        const [profResult, specResult] = await Promise.all([
          getProfessionals({ pageSize: 100 }),
          getAllSpecializations()
        ]);

        if (!profResult.success || !specResult.success) {
          throw new Error(profResult.error || specResult.error || 'Failed to fetch initial data');
        }

        const professionals = profResult.professionals;
        const specializations = specResult.specializations;

        // Step 2: Data ko 'professional_type_id' ke aadhar par jodein (join karein).
        const mergedProfessionals = professionals.map(prof => {
          const matchingSpec = specializations.find(spec =>
            spec.professional_types?.includes(String(prof.professional_type_id))
          );

          // Agar match mil jaye to 'category' field ko professional object mein add kar dein.
          return matchingSpec ? { ...prof, category: matchingSpec.category } : prof;
        });

        setAllProfessionals(mergedProfessionals);

      } catch (err) {
        setError('An error occurred while fetching data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMergeData();
  }, []); // Yeh dependency array ખાલી hai, isliye yeh sirf ek baar chalega.

  // ==> BADLAAV 3: Ek naya useEffect banaya gaya hai jo filter/sort state change hone par chalta hai.
  useEffect(() => {
    let filtered = [...allProfessionals];

    // Category filter ka logic
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(prof => prof.category === selectedCategory);
    }

    // Search filter ka logic
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(prof => {
        const name = `${prof.first_name || ''} ${prof.last_name || ''}`.toLowerCase();
        return name.includes(lowerCaseSearchTerm) ||
          (prof.category?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
          (prof.biography?.toLowerCase() || '').includes(lowerCaseSearchTerm);
      });
    }

    // Sorting ka logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.hourly_rate || 0) - (b.hourly_rate || 0);
        case 'newest':
        default:
          const aDate = a.created_at?.toDate?.() || new Date(0);
          const bDate = b.created_at?.toDate?.() || new Date(0);
          return bDate - aDate;
      }
    });

    setFilteredProfessionals(filtered);
    setCurrentPage(1); // Filter change hone par page 1 par reset karein.
  }, [selectedCategory, sortBy, searchTerm, allProfessionals]);

  // ==> BADLAAV 4: `handleClearFilters` function ko define kiya gaya hai jo pehle missing tha.
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const getCurrentPageProfessionals = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProfessionals.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProfessionals.length / itemsPerPage);

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
          width: '100%',
          minWidth: '95vw',
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
          p: { xs: 2, md: 2.5 }, // Adjusted padding for a tighter look
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          width: '100%',
        }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }} // Stacks vertically on small screens, row on medium and up
            spacing={2}
            justifyContent="space-between" // This is key: pushes left and right groups apart
            alignItems="center"
          >
            {/* Left Group: Search, Category, and Sort By */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }} // Stacks inputs vertically on extra small screens
              spacing={2}
              alignItems="center"
            >
              <TextField
                variant="outlined"
                size="small" // Match height of Select inputs
                placeholder="Search by name, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ minWidth: { sm: 220 }, width: { xs: '100%', sm: 'auto' } }}
              />
              <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map(cat => <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="price">Price: Low to High</MenuItem>
                  <MenuItem value="experience">Most Experienced</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Right Group: View Toggle Icons */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '50px', // Creates the pill shape
                p: '4px', // Adds padding inside the pill
              }}
            >
              <IconButton
                size="small"
                onClick={() => setViewMode('grid')}
                sx={{
                  bgcolor: viewMode === 'grid' ? 'primary.main' : 'transparent',
                  color: viewMode === 'grid' ? 'common.white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: viewMode === 'grid' ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <Apps />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setViewMode('list')}
                sx={{
                  bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
                  color: viewMode === 'list' ? 'common.white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: viewMode === 'list' ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ViewList />
              </IconButton>
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