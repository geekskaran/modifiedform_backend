// import React, { useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import Header from './Header';

// const AdminLayout = ({ children, user, onLogout }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const closeSidebar = () => {
//     setSidebarOpen(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Sidebar */}
//       <Sidebar 
//         isOpen={sidebarOpen} 
//         onClose={closeSidebar}
//         currentPath={location.pathname}
//       />
      
//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Header */}
//         <Header 
//           user={user}
//           onLogout={onLogout}
//           onToggleSidebar={toggleSidebar}
//         />
        
//         {/* Main Content */}
//         <main className="flex-1 overflow-auto">
//           <div className="p-6">
//             {children}
//           </div>
//         </main>
//       </div>
      
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
//           onClick={closeSidebar}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminLayout;


import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
        currentPath={location.pathname}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          user={user}
          onLogout={onLogout}
          onToggleSidebar={toggleSidebar}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default AdminLayout;