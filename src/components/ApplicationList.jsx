
import React, { useState, useEffect } from 'react';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingDoc, setDownloadingDoc] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchApplications = async (page = 1, status = '', search = '') => {
    setLoading(true);
    try {
      let url = `http://localhost:4000/api/applications?page=${page}&limit=10`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${search}`;

      const response = await fetch(url, {
        headers: getAuthHeaders()  // ADD THIS
      });
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.current);
      } else {
        setError(data.message || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/applications/admin/stats', {
        headers: getAuthHeaders()  // ADD THIS
      });
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats:', data.message);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchApplications(currentPage, statusFilter, searchTerm);
    fetchStats();
  }, [currentPage, statusFilter, searchTerm]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),  // CHANGE THIS
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchApplications(currentPage, statusFilter, searchTerm);
        fetchStats();
        alert('Status updated successfully!');
      } else {
        const error = await response.json();
        alert('Error updating status: ' + error.message);
      }
    } catch (err) {
      alert('Error updating status');
      console.error('Update error:', err);
    }
  };
  const handleDownloadDocument = async (applicationId, fileName) => {
    setDownloadingDoc(applicationId);
    try {
      const response = await fetch(`http://localhost:4000/api/applications/${applicationId}/publication-document`, {
        headers: getAuthHeaders()  // ADD THIS
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName || `publication-${applicationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert('Error downloading document: ' + error.message);
      }
    } catch (err) {
      alert('Error downloading document');
      console.error('Download error:', err);
    } finally {
      setDownloadingDoc(null);
    }
  };
  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()  // ADD THIS
      });

      if (response.ok) {
        fetchApplications(currentPage, statusFilter, searchTerm);
        fetchStats();
        setSelectedApplication(null);
        alert('Application deleted successfully!');
      } else {
        const error = await response.json();
        alert('Error deleting application: ' + error.message);
      }
    } catch (err) {
      alert('Error deleting application');
      console.error('Delete error:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const renderFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="bg-white shadow-md border-2 border-gray-300 mb-8">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              IIT Patna R&D Applications Dashboard
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Manage and review submitted applications
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.statusCounts.approved}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Under Review</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.statusCounts.under_review}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">With Publications</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.withPublications}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow border border-gray-300 mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name, Email, or Application ID
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Enter search term..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => fetchApplications(1, statusFilter, searchTerm)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white shadow border border-gray-300">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
            <h3 className="text-lg font-semibold text-gray-800">
              Applications List ({applications.length} results)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Application ID
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Email
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Category
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Publications
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Submitted
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-sm font-mono">
                      {app.applicationId}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {app.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {app.email}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {app.category}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      <div className="flex flex-col space-y-1">
                        {app.publicationDetails && (
                          <span className="text-green-600 text-xs">📝 Details Provided</span>
                        )}
                        {app.publicationDocument?.filename && (
                          <span className="text-blue-600 text-xs">📄 Document Uploaded</span>
                        )}
                        {!app.publicationDetails && !app.publicationDocument?.filename && (
                          <span className="text-gray-500 text-xs">No Publications</span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {formatDate(app.submissionTime)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          View Details
                        </button>
                        {app.publicationDocument?.filename && (
                          <button
                            onClick={() => handleDownloadDocument(app.applicationId, app.publicationDocument.originalName)}
                            disabled={downloadingDoc === app.applicationId}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {downloadingDoc === app.applicationId ? 'Downloading...' : 'Download PDF'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-300 px-6 py-3 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {applications.length === 0 && !loading && (
          <div className="bg-white shadow border border-gray-300 p-8 text-center">
            <p className="text-gray-600">No applications found.</p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-300 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Application Details - {selectedApplication.applicationId}
              </h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {selectedApplication.name}</div>
                  <div><strong>Email:</strong> {selectedApplication.email}</div>
                  <div><strong>Phone:</strong> {selectedApplication.phone}</div>
                  <div><strong>Category:</strong> {selectedApplication.category}</div>
                  <div><strong>Date of Birth:</strong> {new Date(selectedApplication.dob).toLocaleDateString()}</div>
                  <div><strong>Gender: </strong>{selectedApplication.gender || 'N/A'}</div>
                  <div><strong>Professional Exam:</strong> {selectedApplication.professionalExam || 'N/A'}</div>
                  <div className="md:col-span-2"><strong>Address:</strong> {selectedApplication.address}</div>
                </div>
              </div>

              {/* Educational Qualifications */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Educational Qualifications</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left">Institute</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Exam</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Name of Examination</th> {/* ADD THIS */}
                        <th className="border border-gray-300 px-3 py-2 text-left">Year</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedApplication.educationalQualifications?.map((edu, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-3 py-2">{edu.institute}</td>
                          <td className="border border-gray-300 px-3 py-2">{edu.examPassed}</td>
                          <td className="border border-gray-300 px-3 py-2">{edu.nameOfExamination}</td> {/* ADD THIS */}
                          <td className="border border-gray-300 px-3 py-2">{edu.yearOfPassing}</td>
                          <td className="border border-gray-300 px-3 py-2">{edu.marksPercentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Work Experience */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Work Experience</h3>
                <div className="space-y-4">
                  {selectedApplication.experience?.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Company:</strong> {exp.companyName}</div>
                        <div><strong>Salary:</strong> {exp.salary}</div>
                        <div><strong>Start Date:</strong> {new Date(exp.startDate).toLocaleDateString()}</div>
                        <div><strong>End Date:</strong> {exp.isCurrentlyWorking ? 'Currently Working' : new Date(exp.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualifying Degree */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Qualifying Degree</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Degree:</strong> {selectedApplication.qualifyingDegree}</div>
                  {selectedApplication.qualifyingDegreeOther && (
                    <div><strong>Other Degree:</strong> {selectedApplication.qualifyingDegreeOther}</div>
                  )}
                  <div className="md:col-span-2"><strong>Specialization:</strong> {selectedApplication.degreeMajorSpecialization}</div>
                </div>
              </div>

              {/* Publication Details */}
              {(selectedApplication.publicationDetails || selectedApplication.publicationDocument?.filename) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Publication Information</h3>

                  {selectedApplication.publicationDetails && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Publication Details:</h4>
                      <div className="bg-gray-50 p-4 rounded border">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">{selectedApplication.publicationDetails}</pre>
                      </div>
                    </div>
                  )}

                  {selectedApplication.publicationDocument?.filename && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Publication Document:</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              📄 {selectedApplication.publicationDocument.originalName}
                            </p>
                            <p className="text-xs text-blue-600">
                              Size: {renderFileSize(selectedApplication.publicationDocument.size)} |
                              Uploaded: {formatDate(selectedApplication.publicationDocument.uploadDate)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownloadDocument(selectedApplication.applicationId, selectedApplication.publicationDocument.originalName)}
                            disabled={downloadingDoc === selectedApplication.applicationId}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {downloadingDoc === selectedApplication.applicationId ? 'Downloading...' : 'Download PDF'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Application Declaration */}
              {/* Application Declaration */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Application Declaration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4"> {/* Changed to md:grid-cols-2 */}
                  <div><strong>Date:</strong> {new Date(selectedApplication.applicationDate).toLocaleDateString()}</div>
                  <div><strong>Place:</strong> {selectedApplication.applicationPlace}</div>
                  <div><strong>Name Declaration:</strong> {selectedApplication.nameDeclaration}</div>
                  {/* ADD THIS NEW FIELD */}
                  <div>
                    <strong>Declaration Agreed:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedApplication.declarationAgreed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedApplication.declarationAgreed ? '✓ Agreed' : '✗ Not Agreed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Status:</strong> {getStatusBadge(selectedApplication.status)}</div>
                  <div><strong>Submission Time:</strong> {formatDate(selectedApplication.submissionTime)}</div>
                  <div><strong>IP Address:</strong> {selectedApplication.ipAddress || 'N/A'}</div>
                  <div><strong>Last Updated:</strong> {formatDate(selectedApplication.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-300 flex justify-between items-center">
              <div className="flex space-x-3">
                <select
                  value={selectedApplication.status}
                  onChange={(e) => handleStatusUpdate(selectedApplication.applicationId, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Print Details
                </button>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ApplicationsList;