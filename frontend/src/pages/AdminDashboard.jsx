import { Link } from "react-router-dom";

const AdminDashboard = () => {

  return (
    <div className="dashboard-page">

      <div className="dashboard-heading">

        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your scheduled events</p>
        </div>

        <Link
          to="/admin/events/create"
          className="create-btn"
        >
          + Create Event
        </Link>

      </div>

      <div className="dashboard-placeholder">
        <h2>Welcome to Event Management</h2>
        <p>Your event management dashboard will appear here.</p>
      </div>

    </div>
  );
};

export default AdminDashboard;