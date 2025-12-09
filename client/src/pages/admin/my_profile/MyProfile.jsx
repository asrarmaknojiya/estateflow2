import React from 'react';
import '../../../assets/css/admin/pages/myProfile.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import purchaseSide from "../../../assets/image/purchaseSide.png";
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { FiMenu } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosInstance';

function MyProfile() {

    const navigate = useNavigate();
    const { state } = useLocation();
    const admin = state?.admin;
    const id = admin.id;

    const handleEdit = (admin) => navigate("/admin/edit-client", { state: { admin } });

    const moveToTrash = async () => {
        try {
            await api.put(`/trash-user/${id}`, { status: "trash" });
            navigate("/admin/manage-clients")
        } catch (err) {
            console.error(err);
        }
    };

    const profileData = {
        name: 'John Doe',
        img: purchaseSide,
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        altPhone: '+91 87654 32109',
        address: '123 Main Street, Palanpur, Gujarat, India - 385001',
        status: 'Active',
        roles: ['Broker', 'Buyer', 'Retailer', 'Seller']
    };




    const handleHamburgerClick = () => {
        if (window.toggleAdminSidebar) window.toggleAdminSidebar();
    };



    return (
        <>
            <Sidebar />
            <div className="admin-panel-header-div no-navbar">
                <div className="add-form-header">
                    <Link to="/admin/manage-clients" className="back-arrow-btn">
                        <HiOutlineArrowLeft />
                    </Link>
                    <h5>{profileData.name}</h5>
                    <button className="form-hamburger-btn" onClick={handleHamburgerClick} aria-label="Toggle sidebar">
                        <FiMenu />
                    </button>
                </div>

                <div className="profile-container">
                    <div className="profile-card-wrapper">
                        {/* Profile Card */}
                        <div className="profile-info-card">
                            {/* Header with Actions */}
                            <div className="profile-card-header">
                                <h6>Profile Information</h6>
                                <div className="profile-action-btns">
                                    <button className="primary-btn">
                                        <FaEdit onClick={() => handleEdit(admin)} /> Edit
                                    </button>
                                    <button className="delete-btn" onClick={moveToTrash}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>

                            {/* Profile Content */}
                            <div className="profile-content">
                                {/* Profile Image and Basic Info */}
                                <div className="profile-basic-info">
                                    <div className="profile-avatar">
                                        <img
                                            src={profileData.img}
                                            alt="Profile"
                                        />
                                    </div>
                                    <div className="profile-basic-details">
                                        <h4>{profileData.name}</h4>
                                        <p className="profile-email">{profileData.email}</p>
                                        <span className={`profile-status-badge ${profileData.status.toLowerCase()}`}>
                                            {profileData.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Profile Details Grid */}
                                <div className="profile-details-wrapper">
                                    <div className="profile-detail-item">
                                        <label>Full Name</label>
                                        <p>{profileData.name}</p>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Email Address</label>
                                        <p>{profileData.email}</p>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Phone Number</label>
                                        <p>{profileData.phone}</p>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Alternate Number</label>
                                        <p>{profileData.altPhone}</p>
                                    </div>

                                    <div className="profile-detail-item full-width">
                                        <label>Address</label>
                                        <p>{profileData.address}</p>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Status</label>
                                        <span className={`status ${profileData.status.toLowerCase()}`}>
                                            {profileData.status}
                                        </span>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Roles</label>
                                        <div className="profile-roles-container">
                                            {profileData.roles.map((role, index) => (
                                                <span key={index} className="profile-role-badge">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MyProfile;