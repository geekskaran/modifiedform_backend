const API_CONFIG = {
  baseURL: 'http://localhost:4000/api',
  timeout: 10000
};

export const API_ENDPOINTS = {
  auth: {
    login: `${API_CONFIG.baseURL}/auth/login`,
    verify: `${API_CONFIG.baseURL}/auth/verify`
  },
  dashboard: {
    overview: `${API_CONFIG.baseURL}/dashboard/overview`
  },
  templates: {
    list: `${API_CONFIG.baseURL}/email-templates`,
    create: `${API_CONFIG.baseURL}/email-templates`,
    categories: `${API_CONFIG.baseURL}/email-templates/utils/categories`,
    variables: `${API_CONFIG.baseURL}/email-templates/utils/variables`
  },
  applications: {
    list: `${API_CONFIG.baseURL}/applications`,
    stats: `${API_CONFIG.baseURL}/applications/admin/stats`
  },
  bulkEmail: {
    list: `${API_CONFIG.baseURL}/bulk-email`,
    create: `${API_CONFIG.baseURL}/bulk-email/create`,
    stats: `${API_CONFIG.baseURL}/bulk-email/stats/overview`
  }
};

export default API_CONFIG;