// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   X, 
//   Save, 
//   Eye, 
//   Plus, 
//   Type, 
//   Hash, 
//   Mail, 
//   User, 
//   Calendar,
//   FileText,
//   Phone,
//   MapPin,
//   Tag,
//   Bold,
//   Italic,
//   Underline,
//   AlignLeft,
//   AlignCenter,
//   AlignRight,
//   List,
//   Link2,
//   Image as ImageIcon,
//   Palette
// } from 'lucide-react';

// const EmailTemplateComposer = ({ 
//   isOpen, 
//   onClose, 
//   onSave, 
//   template = null, 
//   selectedApplications = [],
//   mode = 'create' // 'create', 'edit', 'compose'
// }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     category: '',
//     subject: '',
//     htmlContent: '',
//     metadata: {
//       description: '',
//       tags: []
//     }
//   });

//   const [categories] = useState([
//     { value: 'success', label: 'Success/Approval', color: 'green' },
//     { value: 'interview', label: 'Interview', color: 'blue' },
//     { value: 'rejection', label: 'Rejection', color: 'red' },
//     { value: 'general', label: 'General', color: 'gray' },
//     { value: 'followup', label: 'Follow-up', color: 'yellow' },
//     { value: 'reminder', label: 'Reminder', color: 'purple' }
//   ]);

//   const [standardVariables] = useState([
//     { name: 'name', label: 'Student Name', icon: User, description: 'Full name of the student', example: 'John Doe' },
//     { name: 'applicationId', label: 'Application ID', icon: Hash, description: 'Unique application identifier', example: 'RND1234567890' },
//     { name: 'email', label: 'Email Address', icon: Mail, description: 'Student email address', example: 'john@email.com' },
//     { name: 'phone', label: 'Phone Number', icon: Phone, description: 'Student contact number', example: '+91 9876543210' },
//     { name: 'address', label: 'Address', icon: MapPin, description: 'Student address', example: 'New Delhi, India' },
//     { name: 'status', label: 'Application Status', icon: Tag, description: 'Current application status', example: 'Approved' },
//     { name: 'submissionDate', label: 'Submission Date', icon: Calendar, description: 'Date of application submission', example: '2024-01-15' },
//     { name: 'adminName', label: 'Admin Name', icon: User, description: 'Name of the admin sending email', example: 'Dr. Smith' }
//   ]);

//   const [showPreview, setShowPreview] = useState(false);
//   const [activeTab, setActiveTab] = useState('compose');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [cursorPosition, setCursorPosition] = useState(0);
  
//   const subjectRef = useRef(null);
//   const contentRef = useRef(null);

//   // Initialize form data
//   useEffect(() => {
//     if (template) {
//       setFormData({
//         name: template.name || '',
//         category: template.category || '',
//         subject: template.subject || '',
//         htmlContent: template.htmlContent || '',
//         metadata: {
//           description: template.metadata?.description || '',
//           tags: template.metadata?.tags || []
//         }
//       });
//     }
//   }, [template]);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleMetadataChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       metadata: {
//         ...prev.metadata,
//         [field]: value
//       }
//     }));
//   };

//   const insertVariable = (variableName, targetField = 'content') => {
//     const variable = `{{${variableName}}}`;
    
//     if (targetField === 'subject') {
//       const input = subjectRef.current;
//       if (input) {
//         const start = input.selectionStart;
//         const end = input.selectionEnd;
//         const newValue = formData.subject.substring(0, start) + variable + formData.subject.substring(end);
//         handleInputChange('subject', newValue);
        
//         // Set cursor position after variable
//         setTimeout(() => {
//           input.setSelectionRange(start + variable.length, start + variable.length);
//           input.focus();
//         }, 0);
//       }
//     } else {
//       const textarea = contentRef.current;
//       if (textarea) {
//         const start = textarea.selectionStart;
//         const end = textarea.selectionEnd;
//         const newValue = formData.htmlContent.substring(0, start) + variable + formData.htmlContent.substring(end);
//         handleInputChange('htmlContent', newValue);
        
//         // Set cursor position after variable
//         setTimeout(() => {
//           textarea.setSelectionRange(start + variable.length, start + variable.length);
//           textarea.focus();
//         }, 0);
//       }
//     }
//   };

//   const addFormattingTag = (tag) => {
//     const textarea = contentRef.current;
//     if (textarea) {
//       const start = textarea.selectionStart;
//       const end = textarea.selectionEnd;
//       const selectedText = formData.htmlContent.substring(start, end);
      
//       let formattedText = '';
//       switch (tag) {
//         case 'bold':
//           formattedText = `<strong>${selectedText}</strong>`;
//           break;
//         case 'italic':
//           formattedText = `<em>${selectedText}</em>`;
//           break;
//         case 'underline':
//           formattedText = `<u>${selectedText}</u>`;
//           break;
//         case 'h1':
//           formattedText = `<h1>${selectedText}</h1>`;
//           break;
//         case 'h2':
//           formattedText = `<h2>${selectedText}</h2>`;
//           break;
//         case 'p':
//           formattedText = `<p>${selectedText}</p>`;
//           break;
//         case 'div':
//           formattedText = `<div>${selectedText}</div>`;
//           break;
//         case 'br':
//           formattedText = '<br/>';
//           break;
//         default:
//           formattedText = selectedText;
//       }
      
//       const newValue = formData.htmlContent.substring(0, start) + formattedText + formData.htmlContent.substring(end);
//       handleInputChange('htmlContent', newValue);
      
//       setTimeout(() => {
//         textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
//         textarea.focus();
//       }, 0);
//     }
//   };

//   const handlePreview = () => {
//     setShowPreview(true);
//   };

//   const processPreviewContent = () => {
//     let content = formData.htmlContent;
//     let subject = formData.subject;
    
//     // Use sample data for preview
//     const sampleData = {
//       name: 'John Doe',
//       applicationId: 'RND1234567890',
//       email: 'john.doe@email.com',
//       phone: '+91 9876543210',
//       address: 'New Delhi, India',
//       status: 'Under Review',
//       submissionDate: '2024-01-15',
//       adminName: 'Dr. Admin'
//     };

//     // Replace variables in content and subject
//     Object.entries(sampleData).forEach(([key, value]) => {
//       const regex = new RegExp(`{{${key}}}`, 'g');
//       content = content.replace(regex, value);
//       subject = subject.replace(regex, value);
//     });

//     return { content, subject };
//   };

//   const handleSave = async () => {
//     // Validation
//     if (!formData.name.trim()) {
//       setError('Template name is required');
//       return;
//     }
//     if (!formData.category) {
//       setError('Please select a category');
//       return;
//     }
//     if (!formData.subject.trim()) {
//       setError('Subject line is required');
//       return;
//     }
//     if (!formData.htmlContent.trim()) {
//       setError('Email content is required');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       await onSave(formData);
//       onClose();
//     } catch (err) {
//       setError(err.message || 'Failed to save template');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const { content: previewContent, subject: previewSubject } = processPreviewContent();

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
//           <div className="flex items-center space-x-4">
//             <h2 className="text-xl font-semibold text-gray-900">
//               {mode === 'create' ? 'Create Email Template' : mode === 'edit' ? 'Edit Template' : 'Compose Email'}
//             </h2>
//             {selectedApplications.length > 0 && (
//               <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
//                 {selectedApplications.length} recipients selected
//               </span>
//             )}
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={handlePreview}
//               className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               <Eye className="h-4 w-4" />
//               <span>Preview</span>
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={isLoading}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//             >
//               <Save className="h-4 w-4" />
//               <span>{isLoading ? 'Saving...' : 'Save Template'}</span>
//             </button>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700 p-2"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 p-4 mx-6 mt-4 rounded-lg">
//             <p className="text-red-700 text-sm">{error}</p>
//           </div>
//         )}

//         {/* Main Content */}
//         <div className="flex flex-1 overflow-hidden">
//           {/* Compose Area */}
//           <div className="flex-1 flex flex-col overflow-hidden">
//             <div className="p-6 space-y-6 overflow-auto">
//               {/* Template Details */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Template Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     placeholder="e.g., Approval Email Template"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Category *
//                   </label>
//                   <select
//                     value={formData.category}
//                     onChange={(e) => handleInputChange('category', e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((category) => (
//                       <option key={category.value} value={category.value}>
//                         {category.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Subject Line */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Subject Line *
//                 </label>
//                 <input
//                   ref={subjectRef}
//                   type="text"
//                   value={formData.subject}
//                   onChange={(e) => handleInputChange('subject', e.target.value)}
//                   placeholder="e.g., Congratulations! Your Application {{applicationId}} has been Approved"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Click variables from the sidebar to insert them
//                 </p>
//               </div>

//               {/* Formatting Toolbar */}
//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="bg-gray-50 border-b border-gray-200 p-3">
//                   <div className="flex items-center space-x-2 flex-wrap">
//                     <button
//                       onClick={() => addFormattingTag('bold')}
//                       className="p-2 hover:bg-gray-200 rounded"
//                       title="Bold"
//                     >
//                       <Bold className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => addFormattingTag('italic')}
//                       className="p-2 hover:bg-gray-200 rounded"
//                       title="Italic"
//                     >
//                       <Italic className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => addFormattingTag('underline')}
//                       className="p-2 hover:bg-gray-200 rounded"
//                       title="Underline"
//                     >
//                       <Underline className="h-4 w-4" />
//                     </button>
//                     <div className="w-px h-6 bg-gray-300 mx-2"></div>
//                     <button
//                       onClick={() => addFormattingTag('h1')}
//                       className="px-3 py-1 hover:bg-gray-200 rounded text-sm font-medium"
//                       title="Heading 1"
//                     >
//                       H1
//                     </button>
//                     <button
//                       onClick={() => addFormattingTag('h2')}
//                       className="px-3 py-1 hover:bg-gray-200 rounded text-sm font-medium"
//                       title="Heading 2"
//                     >
//                       H2
//                     </button>
//                     <button
//                       onClick={() => addFormattingTag('p')}
//                       className="px-3 py-1 hover:bg-gray-200 rounded text-sm"
//                       title="Paragraph"
//                     >
//                       P
//                     </button>
//                     <div className="w-px h-6 bg-gray-300 mx-2"></div>
//                     <button
//                       onClick={() => addFormattingTag('br')}
//                       className="px-3 py-1 hover:bg-gray-200 rounded text-sm"
//                       title="Line Break"
//                     >
//                       BR
//                     </button>
//                   </div>
//                 </div>

//                 {/* Email Content Editor */}
//                 <textarea
//                   ref={contentRef}
//                   value={formData.htmlContent}
//                   onChange={(e) => handleInputChange('htmlContent', e.target.value)}
//                   placeholder="Write your email content here... You can use HTML tags for formatting.&#10;&#10;Example:&#10;<h2>Dear {{name}},</h2>&#10;<p>We are pleased to inform you that your application <strong>{{applicationId}}</strong> has been reviewed.</p>&#10;<p>Thank you for your interest.</p>&#10;<p>Best regards,<br/>{{adminName}}</p>"
//                   className="w-full h-96 p-4 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm"
//                   style={{ minHeight: '400px' }}
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Template Description
//                 </label>
//                 <textarea
//                   value={formData.metadata.description}
//                   onChange={(e) => handleMetadataChange('description', e.target.value)}
//                   placeholder="Brief description of this template's purpose..."
//                   rows="3"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Right Sidebar - Variables */}
//           <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
//             <div className="p-4">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Insert Variables</h3>
              
//               <div className="space-y-3">
//                 {standardVariables.map((variable) => {
//                   const IconComponent = variable.icon;
//                   return (
//                     <div key={variable.name} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
//                       <div className="flex items-start space-x-3">
//                         <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
//                           <IconComponent className="h-4 w-4 text-blue-600" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h4 className="text-sm font-medium text-gray-900">{variable.label}</h4>
//                           <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
//                           <p className="text-xs text-blue-600 mt-1 font-mono">{{`{${variable.name}}`}}</p>
//                           <p className="text-xs text-gray-500 mt-1">Example: {variable.example}</p>
//                           <div className="flex space-x-2 mt-2">
//                             <button
//                               onClick={() => insertVariable(variable.name, 'subject')}
//                               className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
//                             >
//                               Insert in Subject
//                             </button>
//                             <button
//                               onClick={() => insertVariable(variable.name, 'content')}
//                               className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
//                             >
//                               Insert in Content
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Quick HTML Templates */}
//               <div className="mt-6">
//                 <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick HTML Templates</h4>
//                 <div className="space-y-2">
//                   <button
//                     onClick={() => {
//                       const template = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//   <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Dear {{name}},</h2>
//   <p style="color: #666; line-height: 1.6;">Your content here...</p>
//   <p style="color: #666; line-height: 1.6;">Best regards,<br/>{{adminName}}</p>
// </div>`;
//                       handleInputChange('htmlContent', template);
//                     }}
//                     className="w-full text-left p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
//                   >
//                     Professional Email Template
//                   </button>
//                   <button
//                     onClick={() => {
//                       const template = `<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
//   <tr>
//     <td style="background: #f8f9fa; padding: 20px; text-align: center;">
//       <h1 style="color: #007bff; margin: 0;">Application Update</h1>
//     </td>
//   </tr>
//   <tr>
//     <td style="padding: 20px;">
//       <p>Dear {{name}},</p>
//       <p>Your application {{applicationId}} status: <strong>{{status}}</strong></p>
//       <p>Thank you for your patience.</p>
//     </td>
//   </tr>
// </table>`;
//                       handleInputChange('htmlContent', template);
//                     }}
//                     className="w-full text-left p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
//                   >
//                     Status Update Template
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Preview Modal */}
//         {showPreview && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
//             <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
//               <div className="flex items-center justify-between p-6 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
//                 <button
//                   onClick={() => setShowPreview(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//               <div className="p-6 overflow-auto max-h-[70vh]">
//                 <div className="mb-6">
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">Subject:</h4>
//                   <div className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
//                     {previewSubject || 'No subject'}
//                   </div>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">Email Content:</h4>
//                   <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-[300px]">
//                     <div dangerouslySetInnerHTML={{ __html: previewContent || '<p>No content</p>' }} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EmailTemplateComposer;