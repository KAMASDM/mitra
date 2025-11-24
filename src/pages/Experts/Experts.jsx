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
  Tooltip,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Apps,
  ViewList,
  School,
  AccessTime,
  Language,
  CalendarToday,
  CheckCircleOutline,
  InfoOutlined,
  FilterAltOff,
  Refresh,
} from '@mui/icons-material';
// Import the updated functions from your new logic
import { getProfessionals, getProfessionalTypes } from '../../services/userService';

const MotionCard = motion(Card);

const ProfessionalInfoItem = ({ icon: Icon, label, value }) => {
  const theme = useTheme();

  // Conditionally render N/A or the value
  const displayValue = value === 'N/A' || !value ? 'N/A' : value;

  return (
    <Tooltip title={label}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          mb: 0.2,
          p: 0.3,
          borderRadius: 1,
          bgcolor: displayValue !== 'N/A' ? alpha(theme.palette.primary.light, 0.1) : 'transparent'
        }}
      >
        <Icon sx={{ fontSize: 14, color: displayValue !== 'N/A' ? 'primary.main' : 'text.secondary' }} />
        <Typography
          variant="caption"
          fontWeight={displayValue !== 'N/A' ? 500 : 400}
          color={displayValue !== 'N/A' ? 'text.primary' : 'text.secondary'}
          noWrap
        >
          {displayValue}
        </Typography>
      </Stack>
    </Tooltip>
  );
};

const BiographyDisplay = ({ biography, maxChars = 100 }) => {
  const [showFullBio, setShowFullBio] = useState(false);
  const bio = biography || 'No detailed biography provided.';
  const needsReadMore = bio.length > maxChars;

  const getDisplayedBio = () => {
    if (showFullBio || !needsReadMore) {
      return bio;
    }
    return bio.substring(0, maxChars) + '...';
  };

  return (
    <Box sx={{ my: 0.5, textAlign: 'left', width: '100%', minHeight: needsReadMore ? '60px' : '40px' }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          // REDUCED: mb: 0.2 (from 0.5), and line-clamp to limit lines
          mb: 0.2,
          fontStyle: bio.startsWith('No detailed') ? 'italic' : 'normal',
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitLineClamp: showFullBio ? 'unset' : 3, // Limit to 3 lines when collapsed
          WebkitBoxOrient: 'vertical',
        }}
      >
        {getDisplayedBio()}
      </Typography>
      {needsReadMore && (
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // Prevents card click when button is clicked
            setShowFullBio(!showFullBio);
          }}
          sx={{ p: 0, minWidth: 0, fontSize: '0.7rem', fontWeight: 600 }} // REDUCED: font size to 0.7rem (from 0.75rem)
        >
          {showFullBio ? 'Read Less' : 'Read More'}
        </Button>
      )}
    </Box>
  );
};

// -------------------------------------------------------------------
// 2. MAIN COMPONENT
// -------------------------------------------------------------------
const Experts = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // --- DATA FETCHING LOGIC (Unchanged) ---
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getProfessionalTypes();
      if (result.success) {
        setCategories([{ id: 'All', title: 'All' }, ...result.types]);
      } else {
        setError('Could not load categories. Please try again.');
      }
    };
    fetchCategories();
  }, []);

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getProfessionals({
        professionalTypeId: selectedCategory === 'All' ? null : selectedCategory,
        sortBy: sortBy,
      });

      if (result.success) {
        let filtered = result.professionals;
        if (searchTerm) {
          const lowerCaseSearch = searchTerm.toLowerCase();
          filtered = filtered.filter(p =>
            `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().includes(lowerCaseSearch) ||
            (p.biography || '').toLowerCase().includes(lowerCaseSearch) ||
            (p.specializations?.map(s => s.label).join(', ') || '').toLowerCase().includes(lowerCaseSearch)
          );
        }
        setProfessionals(filtered);
        setCurrentPage(1);
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


  useEffect(() => {
    if (categories.length > 0) {
      fetchProfessionals();
    }
  }, [fetchProfessionals, categories]);

  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat.title;
      return acc;
    }, {});
  }, [categories]);

  // --- HANDLERS & HELPERS (Unchanged) ---
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

  // --- JSX / RENDER ---
  return (
    <Box sx={{
      py: 8,
      bgcolor: '#f9f9f9', // Lighter background for better contrast
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Container
        maxWidth="xl" // Wider container for a more spacious look (Full Width)
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Header Section (Enhanced Styling) */}
        <Box sx={{ textAlign: 'center', mb: 6, width: '100%' }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
            🔎 Find Your Expert Now
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.6, maxWidth: '700px', mx: 'auto' }}>
            Connect with **verified and highly-rated professionals** who provide safe, inclusive support tailored to your needs.
          </Typography>
        </Box>

        {/* Search and Filter Section (Enhanced Styling) */}
        <Box sx={{
          mb: 6,
          p: { xs: 2, md: 3 }, // More padding
          borderRadius: 4, // More rounded corners
          bgcolor: 'common.white', // White background
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)', // Deeper shadow
          width: '100%',
        }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Left Group: Search, Category, and Sort By */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by name, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ minWidth: { sm: 250 }, width: { xs: '100%', sm: 'auto' } }}
              />
              <FormControl size="small" sx={{ minWidth: 180, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
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

            {/* Right Group: View Toggle Icons (Styled) */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '50px',
              p: '4px',
              ml: { md: 2 } // Add margin on medium screens up
            }}>
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

        {/* Results Info (Unchanged) */}
        {!loading && !error && (
          <Box sx={{ mb: 3, textAlign: 'center', width: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
              Showing **{getCurrentPageProfessionals().length}** of **{professionals.length}** professionals
              {selectedCategory !== 'All' && ` in ${categoryMap[selectedCategory]}`}
            </Typography>
          </Box>
        )}

        {/* Professionals Display Section */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Loading/Error/No Results States (Unchanged) */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} color="primary" />
            </Box>
          ) : error || professionals.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', maxWidth: '600px', mx: 'auto', borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" color={error ? 'error' : 'text.secondary'} sx={{ mb: 2 }}>
                {error ? '❌ Error Loading Professionals' : '⚠️ No professionals found matching your criteria'}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {error ? error : 'Try clearing the filters or broadening your search terms.'}
              </Typography>
              <Button
                variant="contained"
                onClick={error ? fetchProfessionals : handleClearFilters}
                color={error ? 'error' : 'primary'}
                startIcon={error ? <Refresh /> : <FilterAltOff />}
              >
                {error ? 'Retry Loading' : 'Clear All Filters'}
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
                /* --------------------- GRID VIEW (MODIFIED) --------------------- */
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, // Better responsive grid
                    gap: 3,
                    width: '100%',
                    // ADDED: Auto-fit to limit card height slightly more and keep them uniform
                    gridAutoRows: '1fr',
                  }}>
                  {getCurrentPageProfessionals().map((professional, index) => (
                    <MotionCard
                      key={professional.id}
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
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)'
                        },
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/professional/${professional.id}`)}
                    >
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          p: 2, // REDUCED: Padding from 3 to 2
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center'
                        }}>
                        <Avatar
                          sx={{
                            width: 60, // REDUCED: Avatar size from 80 to 60
                            height: 60,
                            mb: 1, // REDUCED: Margin bottom from 2 to 1
                            bgcolor: theme.palette.primary.main,
                            color: 'common.white',
                            fontSize: '1.5rem', // REDUCED: Font size from 2rem to 1.5rem
                            border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                          {professional?.first_name?.charAt(0)?.toUpperCase() ?? 'P'}
                        </Avatar>

                        {/* --- Name and Verification --- */}
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}> {/* REDUCED: Margin bottom */}
                          <Typography variant="subtitle1" // REDUCED: Font size from h6 to subtitle1
                            sx={{
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              lineHeight: 1.2,
                              color: 'text.primary',
                            }}>
                            {`${professional?.first_name || ''} ${professional?.last_name || ''}`.trim() || 'Unnamed Professional'}
                          </Typography>
                          {professional.verification_status === 'VERIFIED' && (
                            <Tooltip title="Verified Professional">
                              <CheckCircleOutline sx={{ fontSize: 16, color: 'success.main' }} />
                            </Tooltip>
                          )}
                        </Stack>

                        {/* Primary Specialization */}
                        <Typography variant="body2" // REDUCED: Font size from body1 to body2
                          color="text.primary"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            minHeight: '18px', // REDUCED: Min height
                          }}>
                          {professional?.specializations?.[0]?.label ?? 'General Practitioner'}
                        </Typography>

                        {/* ENHANCED PRIMARY CHIP */}
                        <Chip
                          label={categoryMap[professional.professional_type_id] || 'General Category'}
                          size="small" // REDUCED: Chip size from medium to small
                          color="secondary"
                          sx={{
                            textTransform: 'capitalize',
                            mb: 1, // REDUCED: Margin bottom from 1.5 to 1
                            fontWeight: 600,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            height: '24px' // REDUCED: Height from 28px to 24px
                          }}
                        />

                        {/* BIOGRAPHY DISPLAY - USES NEW maxChars=70 (from 100) */}
                        <BiographyDisplay biography={professional.biography} maxChars={70} />

                        <Divider sx={{ width: '80%', my: 0.5 }} /> {/* REDUCED: Margin from 1 to 0.5 */}

                        {/* Key Professional Details (Grid View - Condensed) */}
                        <Box sx={{ width: '100%', mt: 0.5, mb: 1 }}> {/* REDUCED: Margin top/bottom */}
                          <ProfessionalInfoItem
                            icon={School}
                            label="Qualification"
                            value={professional.educational_qualification || 'N/A'}
                          />
                          <ProfessionalInfoItem
                            icon={AccessTime}
                            label="Experience"
                            value={`${professional.years_of_experience ?? 0} Yrs`}
                          />
                          <ProfessionalInfoItem
                            icon={CalendarToday}
                            label="Availability"
                            value={professional.is_available_online ? 'Online' : professional.is_available_in_person ? 'In-person' : 'N/A'}
                          />
                        </Box>

                        {/* All Specializations (Chips) */}
                        <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={0.5} mt={0.5} sx={{ minHeight: '24px', flexGrow: 1 }}> {/* REDUCED: Margin top and minHeight */}
                          {professional.specializations && professional.specializations.length > 0 ? (
                            professional.specializations.slice(0, 3).map((spec) => (
                              <Chip
                                key={spec.id}
                                label={spec.label}
                                size="small"
                                variant="outlined"
                                color="default"
                                sx={{ fontSize: '0.6rem', height: '18px' }} // REDUCED: Font size and height
                              />
                            ))
                          ) : null}
                          {professional.specializations && professional.specializations.length > 3 && (
                            <Chip label={`+${professional.specializations.length - 3} more`} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: '18px' }} />
                          )}
                        </Stack>

                      </CardContent>
                    </MotionCard>
                  ))}
                </Box>
              ) : (
                /* --------------------- LIST VIEW (MODIFIED) --------------------- */
                <Box sx={{ width: '100%' }}>
                  {getCurrentPageProfessionals().map((professional, index) => (
                    <MotionCard
                      key={professional.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: (index % itemsPerPage) * 0.1 }}
                      sx={{
                        mb: 2,
                        p: 2, // REDUCED: Padding from 3 to 2
                        borderRadius: 3,
                        bgcolor: 'common.white',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                          transform: 'translateY(-2px)'
                        },
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                      }}
                      onClick={() => navigate(`/professional/${professional.id}`)}
                    >
                      {/* Avatar Column */}
                      <Stack alignItems="center" sx={{ mr: 3, width: '60px', flexShrink: 0, pt: 0.5 }}> {/* REDUCED: mr and width */}
                        <Avatar
                          sx={{
                            width: 60, // REDUCED: Avatar size
                            height: 60,
                            bgcolor: theme.palette.primary.main,
                            color: 'common.white',
                            fontSize: '1.5rem',
                            mb: 0.5 // REDUCED: Margin bottom
                          }}>
                          {professional?.first_name?.charAt(0)?.toUpperCase() ?? 'P'}
                        </Avatar>
                      </Stack>

                      {/* Details Column - Full Width Content */}
                      <Box sx={{ flexGrow: 1 }}>
                        {/* --- Name, Verification, and Primary Specialization --- */}
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.2}>
                          <Typography variant="h6"
                            sx={{
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              color: 'text.primary'
                            }}>
                            {`${professional?.first_name || ''} ${professional?.last_name || ''}`.trim() || 'Unnamed Professional'}
                          </Typography>
                          {professional.verification_status === 'VERIFIED' && (
                            <Tooltip title="Verified Professional">
                              <CheckCircleOutline sx={{ fontSize: 18, color: 'success.main' }} />
                            </Tooltip>
                          )}
                          <Tooltip title="View Details" placement="top-start">
                            <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                          </Tooltip>
                        </Stack>

                        {/* Primary Specialization */}
                        <Typography variant="body2" color="primary.main" sx={{ mb: 0.5, fontWeight: 600 }}>
                          {professional?.specializations?.[0]?.label ?? 'General Practitioner'}
                        </Typography>

                        {/* ENHANCED PRIMARY CHIP */}
                        <Chip
                          label={categoryMap[professional.professional_type_id] || 'General Category'}
                          size="small"
                          color="secondary"
                          sx={{
                            textTransform: 'capitalize',
                            mb: 1,
                            fontWeight: 600,
                            borderRadius: '16px',
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.dark,
                            height: '24px'
                          }}
                        />

                        {/* BIOGRAPHY DISPLAY - USES NEW maxChars=100 (from 150) */}
                        <BiographyDisplay biography={professional.biography} maxChars={100} />

                        {/* Key Professional Details (List View - 4 Columns) */}
                        <Box sx={{ my: 1, width: '100%' }}>
                          <Divider sx={{ mb: 1 }} />
                          <Stack
                            direction="row"
                            justifyContent="flex-start"
                            spacing={{ xs: 1, sm: 3 }}
                            flexWrap="wrap"
                          >
                            <Box sx={{ flex: '1 1 200px' }}><ProfessionalInfoItem
                              icon={School}
                              label="Qualification"
                              value={professional.educational_qualification || 'N/A'}
                            /></Box>
                            <Box sx={{ flex: '1 1 200px' }}><ProfessionalInfoItem
                              icon={AccessTime}
                              label="Experience"
                              value={`${professional.years_of_experience ?? 0} Yrs`}
                            /></Box>
                            <Box sx={{ flex: '1 1 200px' }}><ProfessionalInfoItem
                              icon={Language}
                              label="Languages"
                              value={professional.languages_spoken ? professional.languages_spoken.split(',').slice(0, 2).join(', ').trim() : 'N/A'}
                            /></Box>
                            <Box sx={{ flex: '1 1 200px' }}><ProfessionalInfoItem
                              icon={CalendarToday}
                              label="Availability"
                              value={professional.is_available_online ? 'Online' : professional.is_available_in_person ? 'In-person' : 'N/A'}
                            /></Box>
                          </Stack>
                          <Divider sx={{ mt: 1 }} /> {/* REDUCED: Margin top */}
                        </Box>


                        {/* All Specializations (Chips) */}
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.2}> {/* REDUCED: Margin bottom */}
                          Areas of Expertise:
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.2}> {/* REDUCED: Margin top */}
                          {professional.specializations && professional.specializations.length > 0 ? (
                            professional.specializations.slice(0, 5).map((spec) => (
                              <Chip
                                key={spec.id}
                                label={spec.label}
                                size="small"
                                variant="outlined"
                                color="default"
                                sx={{ fontSize: '0.65rem', height: '20px' }} // REDUCED: Font size and height
                              />
                            ))
                          ) : (
                            <Chip label="No specific areas listed" size="small" variant="outlined" color="default" sx={{ fontSize: '0.65rem', height: '20px' }} />
                          )}
                          {professional.specializations && professional.specializations.length > 5 && (
                            <Chip label={`+${professional.specializations.length - 5} more`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: '20px' }} />
                          )}
                        </Stack>

                      </Box>
                      {/* The action button column is fully removed here as requested */}
                    </MotionCard>
                  ))}
                </Box>
              )}

              {/* Pagination (Unchanged) */}
              {totalPages > 1 && (
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', width: '100%' }}>
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