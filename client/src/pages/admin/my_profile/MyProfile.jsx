import React, { useEffect, useState } from 'react';
import '../../../assets/css/admin/pages/myProfile.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Sidebar from '../layout/Sidebar';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { FiMenu } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosInstance';

function MyProfile() {
    const [userRoles, setUserRoles] = useState([]);
    const [userRolesId, setUserRolesId] = useState([]);
    const [matchedRoles, setMatchedRoles] = useState([]);

    const navigate = useNavigate();
    const { state } = useLocation();

    const user = state?.admin;
    const id = user?.id;

    const ROLE_MAP = {
        1: 'Admin',
        2: 'Seller',
        3: 'Buyer',
        4: 'Broker',
        5: 'Retailer',
    };

    const fetchRole = async () => {
        let roles = [];
        try {
            const res = await api.get(`/user-roles/${user.id}`);
            roles = Array.isArray(res.data) ? res.data : [];
            setUserRoles(roles);
            setUserRolesId(roles.map((r) => r.role_id));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRole();
    }, []);

    useEffect(() => {
        setMatchedRoles(userRolesId.map((id) => ROLE_MAP[id]).filter(Boolean));
    }, [userRolesId]);


    const handleEdit = () =>
        navigate('/admin/edit-client', { state: { user } });

    const moveToTrash = async () => {
        try {
            await api.put(`/trash-user/${id}`, { status: 'trash' });
            navigate('/admin/manage-clients');
        } catch (err) {
            console.error(err);
        }
    };

    const profileData = {
        name: user.name || "",
        img: `/uploads/${user.img}` || "",
        email: user.email || "",
        phone: `+91 ${user.number}` || "",
        altPhone: user?.alt_number ? `+91 ${user.alt_number}` : '',
        address: user.address || '',
        status: user.status || "",
    };


    return (
        <>
            <Sidebar />

            <div className="admin-panel-header-div no-navbar">
                <div className="add-form-header">
                    <Link to="/admin/user-dashboard" className="back-arrow-btn">
                        <HiOutlineArrowLeft />
                    </Link>

                    <h5>{profileData.name}</h5>

                    <button
                        className="form-hamburger-btn"
                        onClick={() =>
                            window.toggleAdminSidebar && window.toggleAdminSidebar()
                        }
                    >
                        <FiMenu />
                    </button>
                </div>

                <div className="profile-container">
                    <div className="profile-card-wrapper">
                        <div className="profile-info-card">
                            {/* HEADER */}
                            <div className="profile-card-header">
                                <h6>Profile Information</h6>

                                {/* DESKTOP ACTIONS */}
                                <div className="profile-action-btns">
                                    <button className="primary-btn" onClick={handleEdit}>
                                        <FaEdit /> Edit
                                    </button>

                                    <button className="delete-btn" onClick={moveToTrash}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="profile-content">
                                <div className="profile-basic-info">
                                    <div className="profile-avatar">
                                        <img src={profileData.img} alt="Profile" />
                                    </div>

                                    <div className="profile-basic-details">
                                        <h4>{profileData.name}</h4>
                                        <p className="profile-email">{profileData.email}</p>
                                        <span
                                            className={`profile-status-badge ${profileData.status.toLowerCase()}`}
                                        >
                                            {profileData.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="profile-details-wrapper">
                                    <div className="profile-detail-item">
                                        <label>Full Name</label>
                                        <p>{profileData.name}</p>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Email</label>
                                        <p>{profileData.email}</p>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Number</label>
                                        <p>{profileData.phone}</p>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Alt Number</label>
                                        <p>{profileData.altPhone}</p>
                                    </div>

                                    <div className="profile-detail-item full-width">
                                        <label>Address</label>
                                        <p>{profileData.address}</p>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Status</label>
                                        <span
                                            className={`status ${profileData.status.toLowerCase()}`}
                                        >
                                            {profileData.status}
                                        </span>
                                    </div>

                                    <div className="profile-detail-item">
                                        <label>Roles</label>
                                        <div className="profile-roles-container">
                                            {matchedRoles.map((role, i) => (
                                                <span key={i} className="profile-role-badge">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ✅ MOBILE STICKY ACTIONS */}
                    <div className="mobile-sticky-actions">
                        <button className="primary-btn" onClick={handleEdit}>
                            <FaEdit /> Edit
                        </button>
                        <button className="delete-btn" onClick={moveToTrash}>
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MyProfile;
