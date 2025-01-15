// import React, { useState } from 'react';

// const Users = () => {
//   const [users, setUsers] = useState([]);
//   const [formData, setFormData] = useState({ username: '', email: '', role: '' });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.username && formData.email && formData.role) {
//       setUsers([...users, { id: users.length + 1, ...formData }]);
//       setFormData({ username: '', email: '', role: '' });
//     }
//   };

//   const handleDelete = (id) => {
//     setUsers(users.filter(user => user.id !== id));
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
//       <h1 className="text-2xl font-bold text-center mb-6">Manage Users</h1>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="space-y-2">
//           <label htmlFor="username" className="block text-sm font-medium">Username:</label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             value={formData.username}
//             onChange={handleInputChange}
//             placeholder="Enter username"
//             required
//             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <div className="space-y-2">
//           <label htmlFor="email" className="block text-sm font-medium">Email:</label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={formData.email}
//             onChange={handleInputChange}
//             placeholder="Enter email"
//             required
//             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <div className="space-y-2">
//           <label htmlFor="role" className="block text-sm font-medium">Role:</label>
//           <select
//             id="role"
//             name="role"
//             value={formData.role}
//             onChange={handleInputChange}
//             required
//             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select Role</option>
//             <option value="admin">Admin</option>
//             <option value="editor">Editor</option>
//             <option value="viewer">Viewer</option>
//           </select>
//         </div>
//         <button
//           type="submit"
//           className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           Create User
//         </button>
//       </form>

//       <table className="w-full mt-6 border border-gray-300">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 border border-gray-300">ID</th>
//             <th className="p-2 border border-gray-300">Username</th>
//             <th className="p-2 border border-gray-300">Email</th>
//             <th className="p-2 border border-gray-300">Role</th>
//             <th className="p-2 border border-gray-300">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(user => (
//             <tr key={user.id} className="odd:bg-white even:bg-gray-50">
//               <td className="p-2 border border-gray-300 text-center">{user.id}</td>
//               <td className="p-2 border border-gray-300">{user.username}</td>
//               <td className="p-2 border border-gray-300">{user.email}</td>
//               <td className="p-2 border border-gray-300">{user.role}</td>
//               <td className="p-2 border border-gray-300 text-center">
//                 <button
//                   onClick={() => handleDelete(user.id)}
//                   className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Users;
