import React from "react";
import "./UserManagement.css";

function UserManagement() {
  const users = [
    {
      id: 1,
      name: "Avi Balon",
      email: "avi@example.com",
      status: "Active",
      role: "Admin",
    },
    {
      id: 2,
      name: "Inbal Cohen",
      email: "inbal@example.com",
      status: "Active",
      role: "User",
    },
  ];

  const handleEdit = (userId) => {
    console.log(`Edit user with ID: ${userId}`);
    // Implement edit functionality
  };

  const handleDisable = (userId) => {
    console.log(`Disable user with ID: ${userId}`);
    // Implement disable functionality
  };

  return (
    <div className="user-management">
      <h2 className="page-title">User Management</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.status}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(user.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDisable(user.id)}
                  >
                    Disable
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
