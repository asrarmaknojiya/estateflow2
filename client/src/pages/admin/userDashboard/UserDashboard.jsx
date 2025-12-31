import React, { useEffect } from 'react';
import { ShoppingCart, TrendingUp, Package, Briefcase } from 'lucide-react';
import '../../../assets/css/admin/pages/userDashboard.css';
import Sidebar from '../layout/Sidebar';
import purchaseSide from "../../../assets/image/purchaseSide.png";
import saleSide from "../../../assets/image/saleSide.png";
import inventorySide from "../../../assets/image/inventorySide.png";
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { FiMenu } from 'react-icons/fi';

function UserDashboard() {

    const { state } = useLocation();
    const client = state?.user;
    console.log(client.name)

    const navigate = useNavigate()

    const handleProfile = () => navigate("/admin/profile", { state: { client } });
    const handleHamburgerClick = () => {
        if (window.toggleAdminSidebar) window.toggleAdminSidebar();
    };


    return (
        <>
            <Sidebar />


            <div className="view-admin-container admin-panel-header-div no-navbar">
                <div className="add-form-header">
                    <Link to="/admin/manage-clients" className="back-arrow-btn">
                        <HiOutlineArrowLeft />
                    </Link>
                    <h5>{client.name}</h5>
                    <button className="form-hamburger-btn" onClick={handleHamburgerClick} aria-label="Toggle sidebar">
                        <FiMenu />
                    </button>
                </div>
                <div className="dashboard-cards-grid">

                    {/* Your Purchase Card */}
                    <div className="dashboard-info-card dashboard-info-card-purchase" >
                        <div className="card-content-wrapper">
                            <div className="card-text-section">
                                <h6>Purchase</h6>
                                <p>You can save your ride booking View, Confirm or Cancel Bookings.</p>
                                <NavLink to={'/admin/buycard'}>
                                    <button className="card-action-btn">VIEW DETAILS</button>
                                </NavLink>
                            </div>
                            <div className="card-icon-section" >
                                <div className="icon-wrapper" >
                                    <img src={purchaseSide} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Card */}
                    <div className="dashboard-info-card dashboard-info-card-sale">
                        <div className="card-content-wrapper">
                            <div className="card-text-section">
                                <h6>Sales</h6>
                                <p>You can see your Account or you can edit the profile if you want.</p>
                                <NavLink to={'/admin/salescard'}>
                                    <button className="card-action-btn">VIEW DETAILS</button>
                                </NavLink>
                            </div>
                            <div className="card-icon-section" >
                                <div className="icon-wrapper" >
                                    <img src={saleSide} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Card */}
                    <div className="dashboard-info-card dashboard-info-card-inventory">
                        <div className="card-content-wrapper">
                            <div className="card-text-section">
                                <h6>Inventory</h6>
                                <p>You can Check Reviews You have Submitted.</p>
                                <NavLink to={'/admin/salescard'}>
                                    <button className="card-action-btn">VIEW DETAILS</button>
                                </NavLink>
                            </div>
                            <div className="card-icon-section" >
                                <div className="icon-wrapper" >
                                    <img src={inventorySide} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Broker Card */}
                    <div className="dashboard-info-card dashboard-info-card-broker">
                        <div className="card-content-wrapper">
                            <div className="card-text-section">
                                <h6>Broker</h6>
                                <p>You can see your Account or you can edit the profile if you want.</p>
                                <NavLink to={'/admin/salescard'}>
                                    <button className="card-action-btn">VIEW DETAILS</button>
                                </NavLink>
                            </div>
                            <div className="card-icon-section" >
                                <div className="icon-wrapper" >
                                    <img src={saleSide} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Profile Card */}
                    <div className="dashboard-info-card dashboard-info-card-profile">
                        <div className="card-content-wrapper">
                            <div className="card-text-section">
                                <h6>Profile</h6>
                                <p>You can see your Account or you can edit the profile if you want.</p>
                                <button className="card-action-btn" onClick={() => handleProfile(client)}>VIEW DETAILS</button>
                            </div>
                            <div className="card-icon-section" >
                                <div className="icon-wrapper" >
                                    <img src={purchaseSide} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default UserDashboard;