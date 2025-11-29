// src/routes/admin/DashboardRoute.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../../pages/admin/login/Login";
import Dashboard from "../../pages/admin/dashboard/Dashboard";
import Product from "../../pages/admin/product/Product";
import Category from "../../pages/admin/category/Category";
import Order from "../../pages/admin/orders/Order";
import Coupon from "../../pages/admin/coupon/coupon";
import ManageAdmin from "../../pages/admin/manage_admin/ManageAdmin";
import Customer from "../../pages/admin/customers/Customer";
import AddProduct from "../../pages/admin/product/AddProduct";
import AddCategory from "../../pages/admin/category/AddCategory";
import CreateCoupon from "../../pages/admin/coupon/CreateCoupon";
import AddNewAdmin from "../../pages/admin/manage_admin/AddNewAdmin";
import EditAdmin from "../../pages/admin/manage_admin/UpdateAdmin";
import AddNewCustomer from "../../pages/admin/customers/AddNewCustomer";
import Properties from "../../pages/admin/properties/Properties";
import AddProperty from "../../pages/admin/properties/AddProperties";
import EditProperty from "../../pages/admin/properties/UpdateProperties";
import LogoutPage from "../../pages/admin/login/Logout";

const DashboardRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/product" element={<Product />} />
        <Route path="/admin/properties" element={<Properties />} />
        <Route path="/admin/addproperty" element={<AddProperty />} />
        <Route path="/admin/properties/edit/:id" element={<EditProperty />} />
        <Route path="/admin/category" element={<Category />} />
        <Route path="/admin/orders" element={<Order />} />
        <Route path="/admin/coupon" element={<Coupon />} />
        <Route path="/admin/manage-admins" element={<ManageAdmin />} />
        <Route path="/admin/customers" element={<Customer />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/add-category" element={<AddCategory />} />
        <Route path="/admin/create-coupon" element={<CreateCoupon />} />
        <Route path="/admin/add-new_admin" element={<AddNewAdmin />} />
        <Route path="/admin/edit-admin" element={<EditAdmin />} />
        <Route path="/admin/add-new_customer" element={<AddNewCustomer />} />
        <Route path="/logout" element={<LogoutPage />} />
      </Route>
    </Routes>
  );
};

export default DashboardRoute;
