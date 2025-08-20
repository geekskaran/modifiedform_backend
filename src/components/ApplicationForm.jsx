
import React, { useState } from 'react';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    // Personal Information
    name: '',
    address: '',
    phone: '',
    email: '',
    category: '',
    dob: '',
    gender: '',
    professionalExam: '',
    professionalExamValidity: '',

    // Educational Qualifications
    educationalQualifications: [
      {
        institute: '',
        examPassed: '',
        nameOfExamination: '',
        examPassedOther: '', // ADD THIS
        yearOfPassing: '',
        marksPercentage: ''
      }
    ],

    // Experience
    experience: [
      {
        companyName: '',
        startDate: '',
        endDate: '',
        isCurrentlyWorking: false,
        salary: ''
      }
    ],

    // Qualifying Degree
    qualifyingDegree: '',
    qualifyingDegreeOther: '',
    degreeMajorSpecialization: '',

    // Publication Details
    publicationDetails: '',

    // Signature Section
    applicationDate: '',
    applicationPlace: '',
    nameDeclaration: ''

  });



  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [backendErrors, setBackendErrors] = useState([]);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  // File upload states
  const [publicationFile, setPublicationFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // OTP Verification States
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  // Logo URL - Replace this with your actual logo URL
  const LOGO_URL = "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Indian_Institute_of_Technology%2C_Patna.svg/1200px-Indian_Institute_of_Technology%2C_Patna.svg.png";

  // File validation function
  const validateFile = (file) => {
    // Add null/undefined check
    if (!file) {
      return 'Please select a file';
    }

    const allowedTypes = ['application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    // Safe check for file.type
    if (!file.type || !allowedTypes.includes(file.type)) {
      return 'Only PDF files are allowed';
    }

    // Safe check for file.size
    if (!file.size || file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFileError('');

    // Safe check for event and files
    if (!e || !e.target || !e.target.files || e.target.files.length === 0) {
      setPublicationFile(null);
      return;
    }

    const file = e.target.files[0];

    if (!file) {
      setPublicationFile(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      if (e.target) {
        e.target.value = ''; // Clear the input
      }
      return;
    }

    setPublicationFile(file);
  };

  // Remove selected file
  const removeFile = () => {
    setPublicationFile(null);
    setFileError('');
    // Clear the file input
    const fileInput = document.getElementById('publicationFile');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Add this function after successful submission:
const trackFormSubmission = () => {
  if (window.gtag) {
    window.gtag('event', 'form_submit', {
      event_category: 'Application',
      event_label: 'JRF Application Submitted',
      value: 1
    });
  }
};

  // OTP Verification Functions
  const sendOTP = async () => {
    const normalizedEmail = formData.email.toLowerCase().trim();

    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setOtpError('Please enter a valid email address first');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch('https://test2.codevab.com/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const result = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setResendCooldown(60); // 60 seconds cooldown
        alert('OTP sent to your email address. Please check your inbox.');

        // Start countdown
        const countdown = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setOtpError(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'GENERAL', label: 'General' },
    { value: 'OBC', label: 'OBC (Other Backward Classes)' },
    { value: 'SC', label: 'SC (Scheduled Caste)' },
    { value: 'ST', label: 'ST (Scheduled Tribe)' },
    { value: 'PwD', label: 'PwD (Person with Disability)' },
    { value: 'EWS', label: 'EWS (Economically Weaker Section)' }
  ];

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const normalizedEmail = formData.email.toLowerCase().trim();

      const response = await fetch('https://test2.codevab.com/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: otp
        })
      });

      const result = await response.json();

      if (response.ok) {
        setEmailVerified(true);
        setOtpSent(false);
        setOtp('');
        alert('Email verified successfully!');
        console.log(`Email verified for: ${normalizedEmail}`);
      } else {
        setOtpError(result.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const examOptions = [
    '10th Class',
    '12th Class',
    'Bachelors (B.Sc/B.Tech/B.E/BCA)',
    'Masters (M.Sc/M.Tech/M.E/MCA/MA)',
    'Others' // ADD THIS
  ];

  const qualifyingDegreeOptions = [
    'B.Sc/B.Tech/B.E/BCA',
    'M.Sc/M.Tech/M.E/MA/MCA',
    'Others'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear backend errors when user starts fixing them
    if (backendErrors.length > 0) {
      setBackendErrors([]);
    }

    // Reset email verification ONLY if email field changes
    if (name === 'email') {
      // Normalize the email before setting
      const normalizedValue = value.toLowerCase().trim();
      setFormData(prev => ({
        ...prev,
        [name]: normalizedValue
      }));

      setEmailVerified(false);
      setOtpSent(false);
      setOtp('');
      setOtpError('');
      return; // Early return since we've already updated formData
    }
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.educationalQualifications];
    updatedEducation[index][field] = value;
    setFormData(prev => ({
      ...prev,
      educationalQualifications: updatedEducation
    }));

    // Clear related errors
    const errorKey = `education_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }

    // Clear backend errors when user starts fixing them
    if (backendErrors.length > 0) {
      setBackendErrors([]);
    }
    // Note: Don't reset email verification here
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];

    if (field === 'isCurrentlyWorking') {
      updatedExperience[index][field] = value;
      if (value) {
        updatedExperience[index].endDate = ''; // Clear end date if currently working
      }
    } else {
      updatedExperience[index][field] = value;
    }

    setFormData(prev => ({
      ...prev,
      experience: updatedExperience
    }));

    // Clear related errors
    const errorKey = `experience_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }

    // Clear backend errors when user starts fixing them
    if (backendErrors.length > 0) {
      setBackendErrors([]);
    }
    // Note: Don't reset email verification here
  };

  const addExperienceRow = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { companyName: '', startDate: '', endDate: '', isCurrentlyWorking: false, salary: '' }
      ]
    }));
  };

  const removeExperienceRow = (index) => {
    if (formData.experience.length > 1) {
      const updatedExperience = formData.experience.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        experience: updatedExperience
      }));
    }
  };

  const addEducationRow = () => {
    setFormData(prev => ({
      ...prev,
      educationalQualifications: [
        ...prev.educationalQualifications,
        { institute: '', examPassed: '', nameOfExamination: '', examPassedOther: '', yearOfPassing: '', marksPercentage: '' }
      ]
    }));
  };

  const removeEducationRow = (index) => {
    if (formData.educationalQualifications.length > 1) {
      const updatedEducation = formData.educationalQualifications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        educationalQualifications: updatedEducation
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.qualifyingDegree) newErrors.qualifyingDegree = 'Qualifying degree is required';
    if (formData.qualifyingDegree === 'Others' && !formData.qualifyingDegreeOther.trim()) {
      newErrors.qualifyingDegreeOther = 'Please specify other qualifying degree';
    }
    if (!formData.degreeMajorSpecialization.trim()) newErrors.degreeMajorSpecialization = 'Degree specialization is required';
    if (!formData.applicationDate) newErrors.applicationDate = 'Application date is required';
    if (!formData.applicationPlace.trim()) newErrors.applicationPlace = 'Application place is required';
    if (!formData.nameDeclaration.trim()) newErrors.nameDeclaration = 'Name declaration is required';

    // Email verification check
    if (!emailVerified) {
      newErrors.email = 'Please verify your email address';
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // File validation if file is selected
    // File validation - now mandatory
    if (!publicationFile) {
      newErrors.publicationFile = 'Publication document is required';
      const fileValidationError = validateFile(publicationFile);
      if (fileValidationError) {
        newErrors.publicationFile = fileValidationError;
      }
    }

    if (!declarationAgreed) {
      newErrors.declarationAgreed = 'You must agree to the declaration to proceed';
    }

    // Education validation
    // Add this to your education validation loop:
    formData.educationalQualifications.forEach((edu, index) => {
      if (!edu.institute.trim()) newErrors[`education_${index}_institute`] = 'Institute name is required';
      if (!edu.examPassed) newErrors[`education_${index}_exam`] = 'Exam passed is required';
      if (edu.examPassed === 'Others' && !edu.examPassedOther.trim()) newErrors[`education_${index}_examOther`] = 'Please specify other exam'; // ADD THIS
      if (!edu.nameOfExamination.trim()) newErrors[`education_${index}_nameOfExamination`] = 'Name of examination is required';
      if (!edu.yearOfPassing.trim()) newErrors[`education_${index}_year`] = 'Year of passing is required';
      if (!edu.marksPercentage.trim()) newErrors[`education_${index}_marks`] = 'Marks/Percentage is required';
    });

    // Experience validation
    // formData.experience.forEach((exp, index) => {
    //   if (!exp.companyName.trim()) newErrors[`experience_${index}_company`] = 'Company name is required';
    //   if (!exp.startDate) newErrors[`experience_${index}_startDate`] = 'Start date is required';
    //   if (!exp.isCurrentlyWorking && !exp.endDate) newErrors[`experience_${index}_endDate`] = 'End date is required';
    //   if (!exp.salary.trim()) newErrors[`experience_${index}_salary`] = 'Salary is required';
    // });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    // Clear previous errors
    setErrors({});

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'educationalQualifications' || key === 'experience') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append file if selected
      if (publicationFile) {
        formDataToSend.append('publicationDocument', publicationFile);
      }

      // Add email verification status
      // Add email verification status
      formDataToSend.append('emailVerified', 'true');
      formDataToSend.append('declarationAgreed', declarationAgreed ? 'true' : 'false'); // ADD THIS LINE

      const response = await fetch('https://test2.codevab.com/api/applications', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setApplicationId(result.applicationId);
        trackFormSubmission();
        setUploadProgress(100);
        alert(`Application submitted successfully! Application ID: ${result.applicationId}`);

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Clear any previous backend errors
        setBackendErrors([]);

        // Handle different types of backend errors
        if (result.errors && Array.isArray(result.errors)) {
          // Handle validation errors array
          const backendErrors = {};
          const errorList = [];

          result.errors.forEach(error => {
            if (error.field) {
              // Map backend field names to frontend field names
              let fieldName = error.field;

              // Handle educational qualifications errors
              if (error.field.includes('educationalQualifications')) {
                const match = error.field.match(/educationalQualifications\.(\d+)\.(.+)/);
                if (match) {
                  const index = match[1];
                  const field = match[2];
                  fieldName = `education_${index}_${field}`;
                }
              }
              backendErrors[fieldName] = error.message;
              errorList.push({
                field: error.field,
                message: error.message
              });
            } else {
              // Handle errors without field specification
              errorList.push({
                field: 'General',
                message: error.message || error
              });
            }
          });

          setErrors(backendErrors);
          setBackendErrors(errorList);

        } else if (result.error) {
          // Handle rate limiting and other specific errors
          setBackendErrors([{
            field: 'System',
            message: result.error
          }]);
        } else if (result.message) {
          // Handle general error messages
          setBackendErrors([{
            field: 'Error',
            message: result.message
          }]);
        } else {
          // Fallback for unknown error format
          setBackendErrors([{
            field: 'General',
            message: 'An unexpected error occurred. Please try again.'
          }]);
        }

        // Scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Submission error:', error);

      // Handle network or connection errors
      setBackendErrors([{
        field: 'Connection',
        message: 'Unable to connect to server. Please check your internet connection and try again.'
      }]);

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">

        {/* Backend Error Display */}
        {backendErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-800">Submission Error</h2>
            </div>
            <div className="bg-white p-4 rounded border border-red-200">
              <p className="text-red-700 mb-3 font-medium">Please resolve the following issues:</p>
              <div className="space-y-2">
                {backendErrors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-red-600 text-sm">
                      {error.field !== 'General' && error.field !== 'Error' && error.field !== 'System' && (
                        <strong className="text-red-700">{error.field}: </strong>
                      )}
                      <span>{error.message}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special handling for rate limiting */}
              {backendErrors.some(error => error.message.includes('Too many')) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-sm">
                    <strong>💡 Tip:</strong> Please wait before trying to submit again. This helps prevent spam and ensures system stability.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-800">Application Submitted Successfully!</h2>
            </div>
            <div className="bg-white p-4 rounded border border-green-200">
              <p className="text-green-700 mb-2">
                <strong>Application ID:</strong> <span className="font-mono text-lg">{applicationId}</span>
              </p>
              <p className="text-green-700 mb-2">
                <strong>Submission Time:</strong> {new Date().toLocaleString()}
              </p>
              <p className="text-green-600 text-sm">
                Please save your Application ID for future reference. A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </div>
        )}

        {/* Classic Header */}
        <div className="bg-white shadow-md border-2 border-gray-300 mb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0">
                <img
                  src={LOGO_URL}
                  alt="IIT Patna Logo"
                  className="h-16 w-16 sm:h-20 sm:w-20"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-center">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 tracking-wide">
                  INDIAN INSTITUTE OF TECHNOLOGY PATNA
                </h1>
                <h2 className="text-sm sm:text-base text-gray-800 font-semibold mb-1">
                  भारतीय प्रौद्योगिकी संस्थान पटना
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">BHITA PATNA-801106</p>
                <p className="text-sm sm:text-base text-gray-800 font-semibold">Application for the post of JRF</p>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">AI- Driven Automated Satellite Image Analysis for Real-Time Land Subsidence Monitoring, Prediction and Alert Systems</p>
              </div>
            </div>

          </div>
        </div>



        {/* Application Form */}
        <div className="space-y-8">

          {/* Personal Information Section */}
          <div className="bg-white shadow border border-gray-300">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name & Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={submitted}
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.name ? 'border-red-500' : ''
                      } ${submitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter your full name"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={submitted}
                    rows="3"
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.address ? 'border-red-500' : ''
                      } ${submitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter your complete address"
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={submitted}
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.category ? 'border-red-500' : ''
                      } ${submitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOB (dd/mm/yy) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.dob ? 'border-red-500' : ''
                      }`}
                  />
                  {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={submitted}
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.gender ? 'border-red-500' : ''
                      } ${submitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone no. (for Correspondence) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.phone ? 'border-red-500' : ''
                      }`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={emailVerified}
                        className={`flex-1 px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.email ? 'border-red-500' : ''
                          } ${emailVerified ? 'bg-green-50 border-green-500' : ''}`}
                        placeholder="Enter your email address"
                      />
                      {!emailVerified && (
                        <button
                          type="button"
                          onClick={sendOTP}
                          disabled={otpLoading || resendCooldown > 0}
                          className={`px-4 py-2 text-sm font-medium rounded focus:outline-none ${otpLoading || resendCooldown > 0
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                          {otpLoading ? 'Sending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      )}
                    </div>

                    {emailVerified && (
                      <div className="flex items-center text-green-600 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Email verified successfully
                      </div>
                    )}

                    {otpSent && !emailVerified && (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-center font-mono text-lg tracking-widest"
                            placeholder="Enter 6-digit OTP"
                            maxLength="6"
                          />
                          <button
                            type="button"
                            onClick={verifyOTP}
                            disabled={otpLoading || otp.length !== 6}
                            className={`px-4 py-2 text-sm font-medium rounded focus:outline-none ${otpLoading || otp.length !== 6
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                          >
                            {otpLoading ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Please check your email for the 6-digit verification code
                        </p>
                      </div>
                    )}

                    {otpError && <p className="text-sm text-red-600">{otpError}</p>}
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Exam (GATE/CSIR-NET, JRF etc.)
                  </label>
                  <input
                    type="text"
                    name="professionalExam"
                    value={formData.professionalExam}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600"
                    placeholder="Enter examination name (e.g., GATE, CSIR-NET, JRF)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Exam Validity Date
                  </label>
                  <input
                    type="date"
                    name="professionalExamValidity"
                    value={formData.professionalExamValidity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Educational Qualifications Section */}
          <div className="bg-white shadow border border-gray-300">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-300 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Educational Qualification</h3>
              <button
                type="button"
                onClick={addEducationRow}
                disabled={submitted}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${submitted
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
              >
                Add Row
              </button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-400">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Institute/ Board
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Exam Passed
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Name of Examination
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Year of Passing
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        % of Marks/CPI
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.educationalQualifications.map((edu, index) => (
                      <tr key={index}>
                        <td className="border border-gray-400 px-2 py-2">
                          <input
                            type="text"
                            value={edu.institute}
                            onChange={(e) => handleEducationChange(index, 'institute', e.target.value)}
                            className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:border-gray-600 text-sm ${errors[`education_${index}_institute`] ? 'border-red-500' : ''
                              }`}
                            placeholder="Institute name"
                          />
                          {errors[`education_${index}_institute`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`education_${index}_institute`]}</p>
                          )}
                        </td>
                        <td className="border border-gray-400 px-2 py-2">
                          <select
                            value={edu.examPassed}
                            onChange={(e) => handleEducationChange(index, 'examPassed', e.target.value)}
                            className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:border-gray-600 text-sm ${errors[`education_${index}_exam`] ? 'border-red-500' : ''}`}
                          >
                            <option value="">Select</option>
                            {examOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {errors[`education_${index}_exam`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`education_${index}_exam`]}</p>
                          )}

                          {/* ADD THIS: Show text input when "Others" is selected */}
                          {edu.examPassed === 'Others' && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={edu.examPassedOther}
                                onChange={(e) => handleEducationChange(index, 'examPassedOther', e.target.value)}
                                className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:border-gray-600 text-sm ${errors[`education_${index}_examOther`] ? 'border-red-500' : ''}`}
                                placeholder="Please specify other exam"
                              />
                              {errors[`education_${index}_examOther`] && (
                                <p className="text-xs text-red-600 mt-1">{errors[`education_${index}_examOther`]}</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-400 px-2 py-2">
                          <input
                            type="text"
                            value={edu.nameOfExamination}
                            onChange={(e) => handleEducationChange(index, 'nameOfExamination', e.target.value)}
                            className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:border-gray-600 text-sm ${errors[`education_${index}_nameOfExamination`] ? 'border-red-500' : ''
                              }`}
                            placeholder="Mtech or Msc or Btech.."
                          />
                          {errors[`education_${index}_nameOfExamination`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`education_${index}_nameOfExamination`]}</p>
                          )}
                        </td>
                        <td className="border border-gray-400 px-2 py-2">
                          <input
                            type="number"
                            value={edu.yearOfPassing}
                            onChange={(e) => handleEducationChange(index, 'yearOfPassing', e.target.value)}
                            className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:border-gray-600 text-sm ${errors[`education_${index}_year`] ? 'border-red-500' : ''
                              }`}
                            placeholder="YYYY"
                            min="1950"
                            max="2030"
                          />
                          {errors[`education_${index}_year`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`education_${index}_year`]}</p>
                          )}
                        </td>
                        <td className="border border-gray-400 px-2 py-2">
                          <input
                            type="text"
                            value={edu.marksPercentage}
                            onChange={(e) => handleEducationChange(index, 'marksPercentage', e.target.value)}
                            className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:border-gray-600 text-sm ${errors[`education_${index}_marks`] ? 'border-red-500' : ''
                              }`}
                            placeholder="85% or 8.5"
                          />
                          {errors[`education_${index}_marks`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`education_${index}_marks`]}</p>
                          )}
                        </td>
                        <td className="border border-gray-400 px-2 py-2 text-center">
                          {formData.educationalQualifications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEducationRow(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white shadow border border-gray-300">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-300 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Work Experience (Optional)</h3>
              <button
                type="button"
                onClick={addExperienceRow}
                disabled={submitted}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${submitted
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
              >
                Add Experience
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-800">
                        Experience {index + 1}
                      </h4>
                      {formData.experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperienceRow(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) => handleExperienceChange(index, 'companyName', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-600 ${errors[`experience_${index}_company`] ? 'border-red-500' : ''
                            }`}
                          placeholder="Enter company name"
                        />
                        {errors[`experience_${index}_company`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`experience_${index}_company`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-600 ${errors[`experience_${index}_startDate`] ? 'border-red-500' : ''
                            }`}
                        />
                        {errors[`experience_${index}_startDate`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`experience_${index}_startDate`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                          disabled={exp.isCurrentlyWorking}
                          className={`w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-600 ${errors[`experience_${index}_endDate`] ? 'border-red-500' : ''
                            } ${exp.isCurrentlyWorking ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                        {errors[`experience_${index}_endDate`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`experience_${index}_endDate`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`currentlyWorking_${index}`}
                            checked={exp.isCurrentlyWorking}
                            onChange={(e) => handleExperienceChange(index, 'isCurrentlyWorking', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`currentlyWorking_${index}`} className="ml-2 text-sm text-gray-700">
                            Currently working in this company
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Salary (per month)
                        </label>
                        <input
                          type="text"
                          value={exp.salary}
                          onChange={(e) => handleExperienceChange(index, 'salary', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-600 ${errors[`experience_${index}_salary`] ? 'border-red-500' : ''
                            }`}
                          placeholder="e.g., ₹50,000 or 50000"
                        />
                        {errors[`experience_${index}_salary`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`experience_${index}_salary`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Qualifying Degree Section */}
          <div className="bg-white shadow border border-gray-300">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
              <h3 className="text-lg font-semibold text-gray-800">Qualifying Degree</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-400">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-400 px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Qualifying degree (B.Sc/B.Tech/B.E/BCA) (M.Sc/M.Tech/M.E/MA/MCA) Others
                      </th>
                      <th className="border border-gray-400 px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Degree/ major/Specialization
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 px-4 py-3">
                        <select
                          name="qualifyingDegree"
                          value={formData.qualifyingDegree}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-600 ${errors.qualifyingDegree ? 'border-red-500' : ''
                            }`}
                        >
                          <option value="">Select Qualifying Degree</option>
                          {qualifyingDegreeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        {errors.qualifyingDegree && <p className="mt-1 text-sm text-red-600">{errors.qualifyingDegree}</p>}

                        {formData.qualifyingDegree === 'Others' && (
                          <div className="mt-3">
                            <input
                              type="text"
                              name="qualifyingDegreeOther"
                              value={formData.qualifyingDegreeOther}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-600 ${errors.qualifyingDegreeOther ? 'border-red-500' : ''
                                }`}
                              placeholder="Please specify other degree"
                            />
                            {errors.qualifyingDegreeOther && <p className="mt-1 text-sm text-red-600">{errors.qualifyingDegreeOther}</p>}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-400 px-4 py-3">
                        <input
                          type="text"
                          name="degreeMajorSpecialization"
                          value={formData.degreeMajorSpecialization}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-600 ${errors.degreeMajorSpecialization ? 'border-red-500' : ''
                            }`}
                          placeholder="e.g., Computer Science, Mechanical Engineering"
                        />
                        {errors.degreeMajorSpecialization && <p className="mt-1 text-sm text-red-600">{errors.degreeMajorSpecialization}</p>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Template Download Section - Add this after the header */}
          {/* Template Download Section with Local File */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-blue-800">Application Template</h2>
            </div>
            <div className="bg-white p-4 rounded border border-blue-200">
              <p className="text-blue-700 mb-3 font-medium">
                📋 <strong>Important Instructions:</strong>
              </p>
              <div className="space-y-2 text-blue-700 text-sm mb-4">
                <p>• Download the application template document below</p>
                <p>• Fill out all required information in the template</p>
                <p>• Convert the completed template to PDF format</p>
                <p>• Upload the PDF in the "Application" section</p>
                <p>• Ensure the document is clear and readable before uploading</p>
              </div>

              <button
                onClick={() => {
                  // Create a download link for locally stored template
                  const link = document.createElement('a');
                  link.href = '/Template.docx'; // File stored in public folder
                  link.download = 'Publication_Template.docx';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download Template
              </button>
            </div>
          </div>

          {/* Publication Details Section */}
          <div className="bg-white shadow border border-gray-300">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
              <h3 className="text-lg font-semibold text-gray-800">Publication Details</h3>
              <p className="text-sm text-gray-600 mt-1">Optional: Provide details about your publications and upload supporting documents</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Publication Details Text Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Details
                  </label>
                  <textarea
                    name="publicationDetails"
                    value={formData.publicationDetails}
                    onChange={handleInputChange}
                    disabled={submitted}
                    rows="6"
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${submitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Please provide details about your publications including:
- Journal/Conference names
- Publication titles
- Year of publication
- DOI/ISBN (if available)
- Impact factor (if applicable)

Example:
1. Smith, J. et al. (2023). Advanced Machine Learning Techniques in Data Science. International Journal of Computer Science, Vol. 15, pp. 45-62. DOI: 10.1234/ijcs.2023.001

2. Conference presentation at IEEE International Conference on AI (2022)..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Provide comprehensive details about your research publications, conference papers, book chapters, etc.
                  </p>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Document Upload <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    {/* File Input */}
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="publicationFile" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${submitted ? 'cursor-not-allowed bg-gray-100' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> document
                          </p>
                          <p className="text-xs text-gray-500">PDF files only (MAX. 5MB)</p>
                        </div>
                        <input
                          id="publicationFile"
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handleFileChange}
                          disabled={submitted}
                        />
                      </label>
                    </div>

                    {/* File Error Display */}
                    {fileError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                        {fileError}
                      </div>
                    )}

                    {/* Selected File Display */}
                    {publicationFile && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-800 truncate">
                                {publicationFile.name}
                              </p>
                              <p className="text-xs text-green-600">
                                {(publicationFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          {!submitted && (
                            <button
                              type="button"
                              onClick={removeFile}
                              className="flex-shrink-0 text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {/* File Upload Guidelines */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">File Upload Guidelines:</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Only PDF files are accepted</li>
                        <li>• Maximum file size: 5MB</li>
                        <li>• File should contain your publication list, certificates, or related documents, Along with the template</li>


                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Declaration Section */}
          <div className="bg-white shadow border border-gray-300">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
              <h3 className="text-lg font-semibold text-gray-800">Application Declaration</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="applicationDate"
                    value={formData.applicationDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.applicationDate ? 'border-red-500' : ''
                      }`}
                  />
                  {errors.applicationDate && <p className="mt-1 text-sm text-red-600">{errors.applicationDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Place <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="applicationPlace"
                    value={formData.applicationPlace}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.applicationPlace ? 'border-red-500' : ''
                      }`}
                    placeholder="Enter place name"
                  />
                  {errors.applicationPlace && <p className="mt-1 text-sm text-red-600">{errors.applicationPlace}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of Applicant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameDeclaration"
                  value={formData.nameDeclaration}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600 ${errors.nameDeclaration ? 'border-red-500' : ''
                    }`}
                  placeholder="Enter your full name for declaration"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.nameDeclaration && <p className="mt-1 text-sm text-red-600">{errors.nameDeclaration}</p>}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Declaration:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.
                    I understand that any false information or misrepresentation may lead to rejection of my application or cancellation
                    of my appointment if selected. I also understand that the decision of the selection committee will be final and binding.
                  </p>
                  <p className="text-sm text-gray-700 mt-3">
                    I agree to abide by the rules and regulations of the Indian Institute of Technology Patna.
                  </p>

                  {/* Declaration Checkbox */}
                  <div className="mt-4 p-3 bg-white border border-gray-300 rounded">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="declarationAgreement"
                        checked={declarationAgreed}
                        onChange={(e) => setDeclarationAgreed(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <label htmlFor="declarationAgreement" className="ml-3 text-sm text-gray-700">
                        <span className="font-medium text-red-600">*</span> I hereby confirm that I have read and understood the above declaration.
                        I agree to all the terms and conditions mentioned above and declare that all information provided is true and accurate.
                      </label>
                    </div>
                    {errors.declarationAgreed && (
                      <p className="mt-2 text-sm text-red-600">{errors.declarationAgreed}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pb-8">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || submitted}
              className={`px-12 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${uploading || submitted
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-800'
                }`}
            >
              {uploading ? 'Submitting...' : submitted ? 'Application Submitted' : 'Submit Application'}
            </button>
          </div>
        </div>

        {/* Thank You Message - Shows only after successful submission */}
        {submitted && (
          <div className="bg-white shadow border border-gray-300 p-8 text-center mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Thank You!</h3>
            <p className="text-gray-600 mb-4">
              Your application has been successfully submitted and is currently under review.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You will be contacted if any additional information is required.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
              >
                Print Application Details
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setApplicationId('');
                  setFormData({
                    name: '',
                    address: '',
                    phone: '',
                    email: '',
                    category: '',
                    dob: '',
                    gender: '',
                    professionalExam: '',
                    professionalExamValidity: '',
                    // Update the educationalQualifications reset to include nameOfExamination:
                    educationalQualifications: [{ institute: '', examPassed: '', nameOfExamination: '', examPassedOther: '', yearOfPassing: '', marksPercentage: '' }],
                    experience: [{ companyName: '', startDate: '', endDate: '', isCurrentlyWorking: false, salary: '' }],
                    qualifyingDegree: '',
                    qualifyingDegreeOther: '',
                    degreeMajorSpecialization: '',
                    publicationDetails: '',
                    applicationDate: '',
                    applicationPlace: '',
                    nameDeclaration: ''
                  });
                  setErrors({});
                  setBackendErrors([]);
                  setEmailVerified(false);
                  setOtpSent(false);
                  setOtp('');
                  setOtpError('');
                  setPublicationFile(null);
                  setFileError('');
                  setUploadProgress(0);
                  setDeclarationAgreed(false);
                  // Clear file input
                  const fileInput = document.getElementById('publicationFile');
                  if (fileInput) {
                    fileInput.value = '';
                  }
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none"
              >
                Submit New Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationForm;