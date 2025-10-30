import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
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
  Pagination,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Apps, // Grid view icon
  ViewList, // List view icon
} from '@mui/icons-material';
// Import the updated functions from your new logic
import { getProfessionals, getProfessionalTypes } from '../../services/userService';

const MotionCard = motion(Card);

const Experts = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT (Combined from both files) ---
  // Data state
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]); // Dynamic categories from new code

  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // Will store category ID
  const [sortBy, setSortBy] = useState('newest');

  // UI state from old code
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // --- DATA FETCHING LOGIC (From new code) ---

  // EFFECT 1: Fetch categories (professional types) once on component mount.
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getProfessionalTypes();
      if (result.success) {
        // Add "All" option for the filter
        setCategories([{ id: 'All', title: 'All' }, ...result.types]);
      } else {
        setError('Could not load categories. Please try again.');
      }
      // We don't setLoading(false) here because the professional fetch will handle it
    };
    fetchCategories();
  }, []); // Empty dependency array ensures this runs only once.

  // Using useCallback to wrap the main data fetching logic
  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getProfessionals({
        professionalTypeId: selectedCategory === 'All' ? null : selectedCategory, // Pass ID or null
        sortBy: sortBy,
      });

      if (result.success) {
        // Perform client-side search on the server-filtered results
        let filtered = result.professionals;
        if (searchTerm) {
          const lowerCaseSearch = searchTerm.toLowerCase();
          filtered = filtered.filter(p =>
            `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().includes(lowerCaseSearch) ||
            (p.biography || '').toLowerCase().includes(lowerCaseSearch) ||
            (p.specializations?.[0]?.label || '').toLowerCase().includes(lowerCaseSearch)
          );
        }
        setProfessionals(filtered);
        setCurrentPage(1); // Reset to page 1 on new filter/search
      } else {
        setError(result.error || 'Failed to fetch professionals.');
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, searchTerm]);


  // EFFECT 2: Fetch professionals whenever filters change.
  useEffect(() => {
    // Don't run this effect until categories have been loaded
    if (categories.length > 0) {
      fetchProfessionals();
    }
  }, [fetchProfessionals, categories]); // Re-runs when the memoized function changes

  // Create a map for easy category title lookup
  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat.title;
      return acc;
    }, {});
  }, [categories]);


  // --- HANDLERS & HELPERS (Mainly from old code) ---
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
    return professionals.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(professionals.length / itemsPerPage);

  // --- JSX / RENDER (Using the polished UI from the old code) ---
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
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
            Find Your Expert
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.6, maxWidth: '600px', mx: 'auto' }}>
            Connect with verified professionals who understand your unique needs and provide safe, inclusive support.
          </Typography>
        </Box>

        {/* Search and Filter Section - Using the superior layout from the old code */}
        <Box sx={{
          mb: 6,
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          width: '100%',
        }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Left Group: Search, Category, and Sort By */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by name, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ minWidth: { sm: 220 }, width: { xs: '100%', sm: 'auto' } }}
              />
              <FormControl size="small" sx={{ minWidth: 180, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {/* Render categories dynamically */}
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </MenuItem>
                  ))}
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
            <Stack direction="row" spacing={1} alignItems="center" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '50px', p: '4px' }}>
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
            </Stack>
          </Stack>
        </Box>

        {/* Results Info */}
        {!loading && !error && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Showing {getCurrentPageProfessionals().length} of {professionals.length} professionals
              {selectedCategory !== 'All' && ` in ${categoryMap[selectedCategory]}`}
            </Typography>
          </Box>
        )}

        {/* Professionals Display Section */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 4, textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
              <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                Error Loading Professionals
              </Typography>
              <Typography color="error" sx={{ mb: 3 }}>
                {error}
              </Typography>
              <Button variant="contained" onClick={fetchProfessionals}>
                Retry
              </Button>
            </Paper>
          ) : professionals.length === 0 ? (
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
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
              {viewMode === 'grid' ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                  {getCurrentPageProfessionals().map((professional, index) => (
                    <Box key={professional.id}
                      sx={{
                        width: { xs: '100%', sm: '280px', md: '280px' }
                      }}>
                      <MotionCard
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: (index % itemsPerPage) * 0.1 }}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          overflow: 'visible',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)'
                          },
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/professional/${professional.id}`)}
                      >
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              mb: 2,
                              bgcolor: 'primary.light',
                              fontSize: '2rem'
                            }}>
                            {professional?.first_name?.charAt(0)?.toUpperCase() ?? 'P'}
                          </Avatar>
                          <Typography variant="h6"
                            sx={{
                              fontWeight: 700,
                              mb: 1,
                              wordBreak: 'break-word',
                              textTransform: 'capitalize',
                              minHeight: '32px'
                            }}>
                            {`${professional?.first_name || ''} ${professional?.last_name || ''}`.trim() || 'Unnamed Professional'}
                          </Typography>
                          <Typography variant="body2"
                            color="primary"
                            sx={{
                              mb: 2,
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                            {professional?.specializations?.[0]?.label ?? 'No Specialization'}
                          </Typography>
                          <Chip
                            label={categoryMap[professional.professional_type_id] || 'General'}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </CardContent>
                      </MotionCard>
                    </Box>
                  ))}
                </Box>
              ) : ( // List View
                <Box sx={{ width: '100%', maxWidth: '800px' }}>
                  {getCurrentPageProfessionals().map((professional, index) => (
                    <MotionCard
                      key={professional.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: (index % itemsPerPage) * 0.1 }}
                      sx={{
                        mb: 2,
                        p: 3,
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                        },
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => navigate(`/professional/${professional.id}`)}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: 'primary.light',
                          fontSize: '1.5rem',
                          mr: 3
                        }}>
                        {professional?.first_name?.charAt(0)?.toUpperCase() ?? 'P'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6"
                          sx={{
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            mb: 0.5
                          }}>
                          {`${professional?.first_name || ''} ${professional?.last_name || ''}`.trim() || 'Unnamed Professional'}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          {professional?.specializations?.[0]?.label ?? 'No Specialization'}
                        </Typography>
                        <Chip
                          label={categoryMap[professional.professional_type_id] || 'General'}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </MotionCard>
                  ))}
                </Box>
              )}

              {/* Pagination */}
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
                    sx={{ '& .MuiPaginationItem-root': { fontSize: '1rem', minWidth: '40px', height: '40px' } }}
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