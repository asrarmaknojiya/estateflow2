import React, { useRef, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { IoMdArrowDropright } from "react-icons/io";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProperty = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    status: "available",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((p) => ({ ...p, image: f }));
  };

  const isValid = () => form.title.trim() && form.price && form.address.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return toast.warn("Please fill required fields");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("address", form.address);
      fd.append("price", form.price);
      fd.append("status", form.status);
      if (form.image) fd.append("image", form.image);

      await api.post("/addproperty", fd);
      toast.success("Property added");
      setTimeout(() => navigate("/admin/properties"), 800);
    } catch (err) {
      console.error("AddProperty error:", err);
      const message = err?.response?.data?.error || "Failed to add property";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="admin-panel-header-div">
        <div className="admin-dashboard-main-header" style={{ marginBottom: 24 }}>
          <div>
            <h5>Add Property</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">Dashboard</Link>
              <IoMdArrowDropright />
              <Link to="/admin/properties" className="breadcrumb-link active">Property List</Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Add Property</span>
            </div>
          </div>

          <div className="admin-panel-header-add-buttons">
            <NavLink to="/admin/properties" className="cancel-btn dashboard-add-product-btn"><HiXMark /> Cancel</NavLink>

            <button
              className="primary-btn dashboard-add-product-btn"
              onClick={handleSubmit}
              disabled={!isValid() || loading}
            >
              <MdSave /> {loading ? "Saving..." : "Save Property"}
            </button>
          </div>
        </div>

        <form className="dashboard-add-content-card-div" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="dashboard-add-content-left-side">
            <div className="dashboard-add-content-card">
              <h6>General Information</h6>
              <div className="add-product-form-container">
                <label>Property Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Type property title here..." />

                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Type property description here..." />

                <label>Address *</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Type property address..." />
              </div>
            </div>

            <div className="dashboard-add-content-card">
              <h6>Media</h6>
              <div className="add-product-form-container">
                <label>Photo</label>
                <div className="add-product-upload-container">
                  <div className="add-product-upload-icon">
                    <img src="https://cdn-icons-png.flaticon.com/512/1829/1829586.png" alt="Upload" />
                  </div>
                  <p className="add-product-upload-text">Drag and drop image here, or click add image</p>

                  <input
                    type="file"
                    id="imageInputFile"
                    name="image"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handleFile}
                    style={{ display: "block", marginTop: 8 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: moved Base Price + Status here */}
          <div className="dashboard-add-content-right-side">
            <div className="dashboard-add-content-card">
              <h6>Pricing & Status</h6>
              <div className="add-product-form-container">
                <label>Base Price *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Type base price here..." />

                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
      </main>
    </>
  );
};

export default AddProperty;
