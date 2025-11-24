// // src/pages/Auth/Register.jsx
// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Container,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   Link,
//   Stack,
//   Alert,
//   IconButton,
//   InputAdornment,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Checkbox,
//   FormControlLabel,
//   useTheme,
//   alpha,
//   Grid,
//   RadioGroup,
//   Radio,
//   Divider,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import {
//   Visibility,
//   VisibilityOff,
//   Email,
//   Lock,
//   Person,
//   Google,
//   Phone as PhoneIcon,
//   Sms as SmsIcon,
// } from '@mui/icons-material';
// import { signUpWithEmailAndPassword, signInWithGoogle, sendPhoneVerificationCode, verifyPhoneNumber } from '../../services/authService';
// import { getProfessionalTypes } from '../../services/adminService';
// import { toast } from 'react-toastify';

// const MotionCard = motion(Card);
// const RECAPTCHA_CONTAINER_ID = 'recaptcha-container';

// const Register = () => {
//   const theme = useTheme();
//   const navigate = useNavigate();

//   const [authMethod, setAuthMethod] = useState('EMAIL'); // 'EMAIL' or 'PHONE'
//   const [step, setStep] = useState(1); // 1: Info/Recaptcha, 2: OTP

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phoneNumber: '',
//     otp: '',
//     accountType: 'USER',
//     professionalType: '',
//     agreeTerms: false,
//   });
//   const [professionalTypes, setProfessionalTypes] = useState([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (authMethod === 'PHONE' && step === 1) {
//       // ReCAPTCHA is typically invisible and handled in the service layer,
//       // but the div is required to exist in the DOM.
//       if (!document.getElementById(RECAPTCHA_CONTAINER_ID).innerHTML) {
//         // This div acts as the container. The Firebase function will initialize RecaptchaVerifier on it.
//         document.getElementById(RECAPTCHA_CONTAINER_ID).innerHTML = '';
//       }
//     }
//   }, [authMethod, step]);

//   useEffect(() => {
//     const fetchTypes = async () => {
//       const result = await getProfessionalTypes();
//       if (result.success) {
//         setProfessionalTypes(result.types);
//       } else {
//         setError('Could not load professional categories.');
//       }
//     };
//     fetchTypes();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, checked, type } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value,
//     });
//     setError('');
//   };

//   const validateForm = () => {
//     if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
//       setError('Please fill in all required fields.');
//       return false;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match.');
//       return false;
//     }
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters long.');
//       return false;
//     }
//     if (formData.accountType === 'PROFESSIONAL' && !formData.professionalType) {
//       setError('Please select a professional type.');
//       return false;
//     }
//     if (!formData.agreeTerms) {
//       setError('You must agree to the Terms and Conditions.');
//       return false;
//     }
//     return true;
//   };

//   const validatePhoneForm = () => {
//     if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
//       setError('Please fill in all required fields.');
//       return false;
//     }
//     if (formData.accountType === 'PROFESSIONAL' && !formData.professionalType) {
//       setError('Please select a professional type.');
//       return false;
//     }
//     if (!formData.agreeTerms) {
//       setError('You must agree to the Terms and Conditions.');
//       return false;
//     }
//     // Basic phone number format check (Firebase requires E.164 format: +<country_code><number>)
//     if (!formData.phoneNumber.startsWith('+') || formData.phoneNumber.length < 10) {
//       setError('Please enter a valid phone number including country code (e.g., +919876543210).');
//       return false;
//     }
//     return true;
//   };
//   const handleEmailRegistration = async (e) => {
//     e.preventDefault();
//     if (!validateEmailForm()) return;
//     setLoading(true);
//     setError('');

//     // ... (Existing signUpWithEmailAndPassword logic) ...
//     try {
//       const additionalData = {
//         displayName: `${formData.firstName} ${formData.lastName}`,
//         accountType: formData.accountType,
//         ...(formData.accountType === 'PROFESSIONAL' && {
//           professionalType: formData.professionalType,
//         }),
//       };
//       const result = await signUpWithEmailAndPassword(formData.email, formData.password, additionalData);
//       if (result.success) {
//         toast.success('Registration successful! Please check your email to verify your account and log in.');
//         navigate('/login');
//       } else {
//         setError(result.error || 'Registration failed.');
//       }
//     } catch (err) {
//       setError('Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setLoading(true);
//     setError('');
//     try {
//       const additionalData = {
//         displayName: `${formData.firstName} ${formData.lastName}`,
//         accountType: formData.accountType,
//         ...(formData.accountType === 'PROFESSIONAL' && {
//           professionalType: formData.professionalType,
//         }),
//       };
//       const result = await signUpWithEmailAndPassword(formData.email, formData.password, additionalData);
//       if (result.success) {
//         // const localData = {
//         //   user: {
//         //     id: result.user.uid,
//         //     email: result.user.email,
//         //     name: `${formData.firstName} ${formData.lastName}`,
//         //   },
//         //   user_type: formData.accountType,
//         //   token: await result.user.getIdToken(),
//         // };
//         // localStorage.setItem('loginInfo', JSON.stringify(localData));
//         // if (formData.accountType === 'USER') {
//         //   navigate('/client/dashboard');
//         // } else {
//         //   navigate('/professional/dashboard');
//         // }
//         toast.success('Registration successful! Please check your email to verify your account and log in.');
//         navigate('/login');
//       } else {
//         setError(result.error || 'Registration failed.');
//       }
//     } catch (err) {
//       setError('Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSocialLogin = async () => {
//     if (formData.accountType === 'PROFESSIONAL' && !formData.professionalType) {
//       setError('Please select a professional type before continuing with Google.');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const result = await signInWithGoogle({
//         accountType: formData.accountType,
//         professionalType: formData.professionalType
//       });

//       if (result.success) {
//         const localData = {
//           user: {
//             id: result.user.uid,
//             email: result.user.email,
//             name: result.user.displayName,
//           },
//           user_type: result.userData.role,
//           token: await result.user.getIdToken(),
//         };
//         localStorage.setItem('loginInfo', JSON.stringify(localData));

//         if (result.userData.role === 'PROFESSIONAL') {
//           navigate('/professional/dashboard');
//         } else {
//           navigate('/client/dashboard');
//         }
//       } else {
//         setError(result.error || 'Failed to sign in with Google.');
//       }
//     } catch (err) {
//       console.error("Social login component error:", err);
//       setError('An error occurred during social login. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minWidth: '98vw',
//         minHeight: '100vh',
//         overflowX: 'hidden !important',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         py: 8,
//         background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
//       }}
//     >
//       <Container maxWidth="sm">
//         <MotionCard
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           sx={{ borderRadius: 4, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)' }}
//         >
//           <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
//             <Box sx={{ textAlign: 'center', mb: 4 }}>
//               <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
//                 Join Gazra-Mitra
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 Create your account and start your journey with us
//               </Typography>
//             </Box>

//             {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

//             <form onSubmit={handleSubmit}>
//               <Stack spacing={2.5}>
//                 <FormControl component="fieldset">
//                   <RadioGroup row name="accountType" value={formData.accountType} onChange={handleChange}>
//                     <FormControlLabel value="USER" control={<Radio />} label="User" />
//                     <FormControlLabel value="PROFESSIONAL" control={<Radio />} label="Professional" />
//                   </RadioGroup>
//                 </FormControl>

//                 {formData.accountType === 'PROFESSIONAL' && (
//                   <FormControl fullWidth>
//                     <InputLabel id="professional-type-label">Professional Type</InputLabel>
//                     <Select
//                       labelId="professional-type-label"
//                       name="professionalType"
//                       value={formData.professionalType}
//                       label="Professional Type"
//                       onChange={handleChange}
//                       required
//                     >
//                       <MenuItem value=""><em>Select a profession...</em></MenuItem>
//                       {professionalTypes.map((type) => (
//                         <MenuItem key={type.firestoreId} value={type.id}>
//                           {type.title}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 )}

//                 <Grid container spacing={2}>
//                   <Grid item size={{ xs: 12, sm: 6 }}>
//                     <TextField fullWidth name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
//                   </Grid>
//                   <Grid item size={{ xs: 12, sm: 6 }}>
//                     <TextField fullWidth name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
//                   </Grid>
//                   <Grid item size={{ xs: 12 }}>
//                     <TextField fullWidth name="email" type="email" label="Email Address" value={formData.email} onChange={handleChange} required InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>), }} />
//                   </Grid>
//                   <Grid item size={{ xs: 12 }}>
//                     <TextField fullWidth name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formData.password} onChange={handleChange} required InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), }} />
//                   </Grid>
//                   <Grid item size={{ xs: 12 }}>
//                     <TextField fullWidth name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} label="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), }} />
//                   </Grid>
//                 </Grid>

//                 <FormControlLabel control={<Checkbox name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />} label={<Typography variant="body2">I agree to the <Link href="/terms" target="_blank" onClick={(e) => e.stopPropagation()}>Terms and Conditions</Link></Typography>} />

//                 <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600, borderRadius: 3 }}>
//                   {loading ? 'Creating Account...' : 'Register'}
//                 </Button>
//               </Stack>
//             </form>

//             <Divider sx={{ my: 3 }}>OR</Divider>

//             <Button fullWidth variant="outlined" size="large" startIcon={<Google />} onClick={handleSocialLogin} disabled={loading} sx={{ py: 1.5, borderRadius: 3, borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) } }}>
//               Continue with Google
//             </Button>

//             <Box sx={{ textAlign: 'center', mt: 4 }}>
//               <Typography variant="body2" color="text.secondary">
//                 Already have an account?{' '}
//                 <Link component="button" type="button" variant="body2" onClick={() => navigate('/login')} sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
//                   Sign in here
//                 </Link>
//               </Typography>
//             </Box>
//           </CardContent>
//         </MotionCard>
//       </Container>
//     </Box>
//   );
// };

// export default Register;


// src/pages/Auth/Register.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  useTheme,
  alpha,
  Grid,
  RadioGroup,
  Radio,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  Phone as PhoneIcon, // NEW IMPORT
  Sms as SmsIcon,      // NEW IMPORT
} from '@mui/icons-material';
import { 
  signUpWithEmailAndPassword, 
  signInWithGoogle, 
  sendPhoneVerificationCode, // NEW IMPORT
  verifyPhoneNumber // NEW IMPORT
} from '../../services/authService';
import { getProfessionalTypes } from '../../services/adminService';
import { toast } from 'react-toastify';

const MotionCard = motion(Card);

// ID for reCAPTCHA container - MUST BE UNIQUE
const RECAPTCHA_CONTAINER_ID = 'recaptcha-container';

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [authMethod, setAuthMethod] = useState('EMAIL'); // 'EMAIL' or 'PHONE'
  const [step, setStep] = useState(1); // 1: Info/Recaptcha, 2: OTP
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '', 
    otp: '',         
    accountType: 'USER',
    professionalType: '',
    agreeTerms: false,
  });
  const [professionalTypes, setProfessionalTypes] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // This effect ensures the reCAPTCHA container is clean and ready
    if (authMethod === 'PHONE' && step === 1) {
      const recaptchaDiv = document.getElementById(RECAPTCHA_CONTAINER_ID);
      if (recaptchaDiv && !recaptchaDiv.innerHTML) {
          recaptchaDiv.innerHTML = '';
      }
    }
  }, [authMethod, step]);

  useEffect(() => {
    const fetchTypes = async () => {
      const result = await getProfessionalTypes();
      if (result.success) {
        setProfessionalTypes(result.types);
      } else {
        setError('Could not load professional categories.');
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleAuthMethodChange = (newMethod) => {
    setAuthMethod(newMethod);
    setStep(1); // Reset step when changing method
    setError('');
  };

  const validateEmailForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (formData.accountType === 'PROFESSIONAL' && !formData.professionalType) {
      setError('Please select a professional type.');
      return false;
    }
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms and Conditions.');
      return false;
    }
    return true;
  };
  
  const validatePhoneForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
        setError('Please fill in all required fields.');
        return false;
    }
    if (formData.accountType === 'PROFESSIONAL' && !formData.professionalType) {
      setError('Please select a professional type.');
      return false;
    }
    if (!formData.agreeTerms) {
        setError('You must agree to the Terms and Conditions.');
        return false;
    }
    if (!formData.phoneNumber.startsWith('+') || formData.phoneNumber.length < 10) {
        setError('Please enter a valid phone number including country code (e.g., +919876543210).');
        return false;
    }
    return true;
  };

  const handleEmailRegistration = async (e) => {
    e.preventDefault();
    if (!validateEmailForm()) return;
    setLoading(true);
    setError('');

    try {
      const additionalData = {
        displayName: `${formData.firstName} ${formData.lastName}`,
        accountType: formData.accountType,
        ...(formData.accountType === 'PROFESSIONAL' && {
          professionalType: formData.professionalType,
        }),
      };
      const result = await signUpWithEmailAndPassword(formData.email, formData.password, additionalData);
      if (result.success) {
        toast.success('Registration successful! Please check your email to verify your account and log in.');
        navigate('/login');
      } else {
        setError(result.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validatePhoneForm()) return;

    setLoading(true);
    setError('');

    // Clear any previous reCAPTCHA instance
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
    }
    
    const result = await sendPhoneVerificationCode(formData.phoneNumber, RECAPTCHA_CONTAINER_ID);
    
    if (result.success) {
        setStep(2); // Move to OTP verification step
        toast.info(`OTP sent to ${formData.phoneNumber}.`);
    } else {
        setError(result.error || 'Failed to send OTP. Please check your phone number and try again.');
    }
    
    setLoading(false);
  };
  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.otp.length !== 6) {
        setError('Please enter the 6-digit OTP.');
        setLoading(false);
        return;
    }
    
    // Package all necessary form data to create the Firestore profile later
    const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email, 
        accountType: formData.accountType,
        displayName: `${formData.firstName} ${formData.lastName}`,
        ...(formData.accountType === 'PROFESSIONAL' && { professionalType: formData.professionalType }),
    };

    const result = await verifyPhoneNumber(formData.otp, registrationData);

    if (result.success) {
        // Successful phone verification and sign-in. 
        const user = result.user;
        const localData = {
            user: {
                id: user.uid,
                email: user.email || formData.email,
                name: registrationData.displayName,
                phone: user.phoneNumber,
            },
            user_type: result.userData.role,
            token: await user.getIdToken(),
        };
        localStorage.setItem('loginInfo', JSON.stringify(localData));

        toast.success('Phone verification successful! Welcome to Gazra-Mitra.');
        if (result.userData.role === 'PROFESSIONAL') {
          navigate('/professional/dashboard');
        } else {
          navigate('/client/dashboard');
        }
    } else {
        setError(result.error || 'OTP verification failed. Please try again.');
    }
    setLoading(false);
  };
  
  const handleSocialLogin = async () => {
    if (formData.accountType === 'PROFESSIONAL' && !formData.professionalType) {
      setError('Please select a professional type before continuing with Google.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle({
        accountType: formData.accountType,
        professionalType: formData.professionalType
      });

      if (result.success) {
        const localData = {
          user: {
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
          },
          user_type: result.userData.role,
          token: await result.user.getIdToken(),
        };
        localStorage.setItem('loginInfo', JSON.stringify(localData));

        if (result.userData.role === 'PROFESSIONAL') {
          navigate('/professional/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      } else {
        setError(result.error || 'Failed to sign in with Google.');
      }
    } catch (err) {
      console.error("Social login component error:", err);
      setError('An error occurred during social login. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderEmailRegistration = () => (
    <form onSubmit={handleEmailRegistration}>
      <Stack spacing={2.5}>
        {/* Name Fields */}
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
          </Grid>
        </Grid>
        
        {/* Email Field */}
        <TextField fullWidth name="email" type="email" label="Email Address" value={formData.email} onChange={handleChange} required InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>), }} />
        
        {/* Password Fields */}
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formData.password} onChange={handleChange} required InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), }} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} label="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), }} />
          </Grid>
        </Grid>
        
        <FormControlLabel control={<Checkbox name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />} label={<Typography variant="body2">I agree to the <Link href="/terms" target="_blank" onClick={(e) => e.stopPropagation()}>Terms and Conditions</Link></Typography>} />

        <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600, borderRadius: 3 }}>
          {loading ? 'Creating Account...' : 'Register with Email'}
        </Button>
      </Stack>
    </form>
  );

  const renderPhoneRegistration = () => (
    <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}>
      <Stack spacing={2.5}>
        {step === 1 && (
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
                Enter your details and a phone number in **E.164 format** (e.g., **+919876543210**) to receive the OTP.
            </Typography>
            
            {/* Name Fields (for Firestore profile) */}
            <Grid container spacing={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
                </Grid>
            </Grid>
            
            {/* Email Field (Optional for Phone Auth - used for welcome email/future contact) */}
            <TextField fullWidth name="email" type="email" label="Email Address (Optional)" value={formData.email} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>), }} />

            {/* Phone Number Input */}
            <TextField 
                fullWidth 
                name="phoneNumber" 
                type="tel" 
                label="Phone Number (+91 9876543210)" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                required 
                InputProps={{ 
                    startAdornment: (<InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment>), 
                }} 
            />
            
            <FormControlLabel 
                control={<Checkbox name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />} 
                label={<Typography variant="body2">I agree to the <Link href="/terms" target="_blank" onClick={(e) => e.stopPropagation()}>Terms and Conditions</Link></Typography>} 
            />

            {/* Hidden reCAPTCHA container - REQUIRED BY FIREBASE */}
            <div id={RECAPTCHA_CONTAINER_ID} style={{ display: 'none' }} />

            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600, borderRadius: 3 }}>
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </Button>
          </Stack>
        )}
        
        {step === 2 && (
          <Stack spacing={2.5}>
            <Alert severity="info">
                A 6-digit code has been sent to <strong>{formData.phoneNumber}</strong>.
            </Alert>
            
            {/* OTP Input */}
            <TextField 
                fullWidth 
                name="otp" 
                label="Enter 6-Digit OTP" 
                value={formData.otp} 
                onChange={handleChange} 
                required 
                type="number"
                inputProps={{ maxLength: 6 }}
                InputProps={{ 
                    startAdornment: (<InputAdornment position="start"><SmsIcon color="action" /></InputAdornment>), 
                }} 
            />
            
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600, borderRadius: 3 }}>
              {loading ? 'Verifying...' : 'Verify & Register'}
            </Button>

            <Button variant="outlined" onClick={() => setStep(1)} disabled={loading}>
                Edit Phone Number / Resend
            </Button>
          </Stack>
        )}
      </Stack>
    </form>
  );

  return (
    <Box
      sx={{
        minWidth: '98vw',
        minHeight: '100vh',
        overflowX: 'hidden !important',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
      }}
    >
      <Container maxWidth="sm">
        <MotionCard
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ borderRadius: 4, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)' }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                Join Gazra-Mitra
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account and start your journey with us
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Account Type and Auth Method Selector */}
            <Stack spacing={2.5} sx={{ mb: 3 }}>
                <FormControl component="fieldset">
                    <RadioGroup row name="accountType" value={formData.accountType} onChange={handleChange}>
                        <FormControlLabel value="USER" control={<Radio />} label="User" />
                        <FormControlLabel value="PROFESSIONAL" control={<Radio />} label="Professional" />
                    </RadioGroup>
                </FormControl>

                {formData.accountType === 'PROFESSIONAL' && (
                    <FormControl fullWidth>
                        <InputLabel id="professional-type-label">Professional Type</InputLabel>
                        <Select
                            labelId="professional-type-label"
                            name="professionalType"
                            value={formData.professionalType}
                            label="Professional Type"
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value=""><em>Select a profession...</em></MenuItem>
                            {professionalTypes.map((type) => (
                                <MenuItem key={type.firestoreId} value={type.id}>
                                    {type.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                    <Grid container>
                        <Grid item size={{ xs: 6 }}>
                            <Button 
                                fullWidth 
                                variant={authMethod === 'EMAIL' ? 'contained' : 'text'}
                                onClick={() => handleAuthMethodChange('EMAIL')}
                                sx={{ py: 1.5, borderRadius: 0, borderRight: 1, borderColor: 'divider' }}
                            >
                                Register with Email
                            </Button>
                        </Grid>
                        <Grid item size={{ xs: 6 }}>
                            <Button 
                                fullWidth 
                                variant={authMethod === 'PHONE' ? 'contained' : 'text'}
                                onClick={() => handleAuthMethodChange('PHONE')}
                                sx={{ py: 1.5, borderRadius: 0 }}
                            >
                                Register with Phone
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Stack>

            {/* Dynamic Registration Form */}
            {authMethod === 'EMAIL' && renderEmailRegistration()}
            {authMethod === 'PHONE' && renderPhoneRegistration()}

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Button fullWidth variant="outlined" size="large" startIcon={<Google />} onClick={handleSocialLogin} disabled={loading} sx={{ py: 1.5, borderRadius: 3, borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) } }}>
              Continue with Google
            </Button>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link component="button" type="button" variant="body2" onClick={() => navigate('/login')} sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </MotionCard>
      </Container>
    </Box>
  );
};

export default Register;