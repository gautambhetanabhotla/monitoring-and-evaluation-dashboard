import React, { useState } from 'react';

const Admin = () => {
  const [user, setUser] = useState(null);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/getUser`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  return (
    <div>
      <h2>Admin</h2>
      <button onClick={fetchUserDetails}>Get User Details</button>
      {user && (
        <div>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      )}
    </div>
  );
};

export default Admin;