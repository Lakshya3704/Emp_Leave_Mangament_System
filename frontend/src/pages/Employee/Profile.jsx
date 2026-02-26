import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfileAPI, changePasswordAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlineLockClosed,
} from "react-icons/hi";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfileAPI(form);
      setUser(res.data.data);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await changePasswordAPI({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          View and manage your profile information
        </p>
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            <HiOutlineUser size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500">{user?.designation || "Employee"}</p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
              {user?.employeeId}
            </span>
          </div>
        </div>

        {!editing ? (
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <HiOutlineMail className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <HiOutlinePhone className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.phone || "Not set"}
                </p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <HiOutlineOfficeBuilding className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">Department</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.department}
                </p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <HiOutlineBriefcase className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">Designation</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.designation || "Not set"}
                </p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <HiOutlineIdentification className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">Employee ID</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.employeeId}
                </p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <HiOutlineCalendar className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">Joining Date</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.joiningDate
                    ? new Date(user.joiningDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="col-span-2 flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setEditing(true)} className="btn-primary">
                Edit Profile
              </button>
              <button
                onClick={() => setChangingPassword(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <HiOutlineLockClosed size={16} />
                Change Password
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm({ name: user.name, phone: user.phone });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      {changingPassword && (
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineLockClosed />
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="input-field"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="input-field"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
