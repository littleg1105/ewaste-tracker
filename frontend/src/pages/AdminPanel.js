import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { ewasteTracker } = useAuth();
  const { signer, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false); // New state for loading users
  
  const [formData, setFormData] = useState({
    userAddress: '',
    name: '',
    role: '0', // Admin by default
  });

  // Role mappings
  const roleNames = ['Admin', 'User', 'Green Point', 'Transporter', 'Recycling Unit', 'Environment Inspector'];

  // Function to add a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await ewasteTracker.connect(signer).addUser(
        formData.userAddress,
        formData.name,
        parseInt(formData.role)
      );

      await tx.wait();
      setSuccess('User added successfully!');
      
      // Reset form
      setFormData({
        userAddress: '',
        name: '',
        role: '0',
      });
      
      // Refresh user list
      // Note: In reality, we'd need additional methods to fetch users
      // This is a placeholder for future implementation
    } catch (err) {
      setError(err.message || 'Error adding user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch all users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      if (ewasteTracker && role === 0) { // Only run if contract is available and user is Admin
        setLoadingUsers(true);
        setError('');
        try {
          // --- ASSUMPTION: getAllUserAddresses exists ---
          const userAddresses = await ewasteTracker.getAllUserAddresses(); 
          
          const userPromises = userAddresses.map(address => 
            ewasteTracker.users(address) // Fetch details for each address
          );
          
          const usersData = await Promise.all(userPromises);
          
          // Convert Structs/Arrays to Objects and BigInts to Numbers
          const formattedUsers = usersData
            .map(userStruct => ({ // Map the returned struct/array explicitly
              userAddress: userStruct[0],
              name: userStruct[1],
              role: Number(userStruct[2]), // Convert role to Number
              isActive: userStruct[3],
              registrationDate: Number(userStruct[4]) // Convert timestamp to Number
            }))
            .filter(user => user.isActive); // Filter out inactive users
            
          setUsers(formattedUsers); 

        } catch (err) {
          console.error("Error fetching users:", err);
          setError('Failed to load users. Ensure the contract has a getAllUserAddresses function.');
        } finally {
          setLoadingUsers(false);
        }
      }
    };

    fetchUsers();
  }, [ewasteTracker, role]); // Re-run if contract or role changes

  // Check if user has admin role
  if (role !== 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-red-800">You do not have permission to access this page. Only administrators can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      {error && (
        <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded border border-green-200 mb-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ethereum Address
            </label>
            <input
              type="text"
              name="userAddress"
              value={formData.userAddress}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0x..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {roleNames.map((roleName, index) => (
                <option key={index} value={index}>{roleName}</option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 text-white font-medium rounded-md ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Adding User...' : 'Add User'}
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Current Users</h2>
        {loadingUsers ? (
          <p className="text-gray-600">Loading users...</p>
        ) : error && !users.length ? ( // Show error only if user list couldn't be loaded
           <p className="text-red-600">{error}</p>
        ) : users.length === 0 ? (
           <p className="text-gray-600 italic">No active users found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate" title={user.userAddress}>
                    {user.userAddress.substring(0, 6)}...{user.userAddress.substring(user.userAddress.length - 4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {roleNames[user.role]} 
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.registrationDate * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 