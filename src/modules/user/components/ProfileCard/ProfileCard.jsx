import React, { useState, useRef, useEffect } from "react";
import { ProfileCardWrapper } from "./ProfileCard.styles";
import { Clerk } from "@clerk/clerk-js";
import { useUser } from "@clerk/clerk-react";
import {
  createUserProfile,
  getUserByClerkId,
  getUserQuestionariesByUserId,
  updateUser,
} from "../../../../api/userApi";
import { Spin } from "antd";

const ProfileCard = () => {
  const clerk = new Clerk(
    "pk_test_bW9kZXN0LW11ZGZpc2gtMTguY2xlcmsuYWNjb3VudHMuZGV2JA"
  );
  const [profileFile, setProfileFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const { isSignedIn, user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    linkedIn: "",
    phone: "",
    experience: "",
    profilePhoto: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg"
  });
  const imageInputRef = useRef(null);

  // Initialize Clerk
  useEffect(() => {
    const loaderFunction = async () => {
      await clerk.load();
    };
    loaderFunction();
  }, []);

  // Fetch user data
  useEffect(() => {
    const apiCaller = async () => {
      if (!isLoaded || !user) return;
      
      try {
        setLoading(true);
        const response = await getUserByClerkId(user.id);
        setUserId(response.data.user._id);
        
        const questionariesResponse = await getUserQuestionariesByUserId(
          response.data.user._id
        );
        
        setFormData({
          username: response.data.user.user_name || "",
          email: response.data.user.user_email || "",
          linkedIn: response.data.user.user_linkedin_profile_link || "",
          phone: response.data.user.user_phone_number || "",
          experience: questionariesResponse.data?.data_experience_response || "",
          profilePhoto: response.data.clerkUserData?.imageUrl || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg"
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    apiCaller();
  }, [isLoaded, user]); // Add dependencies here

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    imageInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setProfileFile(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formDataSub = new FormData();
      formDataSub.append("clerk_id", user.id);
      formDataSub.append("user_name", formData.username);
      
      if (profileFile) {
        formDataSub.append("user_profile_pic", profileFile);
      }

      formDataSub.append("user_Phone_number", formData.phone);
      formDataSub.append("user_email", formData.email);
      
      await updateUser(formDataSub);
      await createUserProfile({
        user_linkedin_profile_link: formData.linkedIn,
        data_experience_response: formData.experience,
        user_id: userId,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ProfileCardWrapper>
      <div className="profile-container">
        <div className="profile-header">
          <h2 className="profile-title">Basic Info</h2>

          {/* Profile Photo Section */}
          <div className="profile-photo-section">
            <h3 className="profile-photo-title">Profile Photo</h3>
            <img
              src={formData.profilePhoto}
              alt="Profile"
              className="profile-photo"
            />
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
              disabled={loading}
            />
            <button 
              className="change-photo-btn" 
              onClick={handleImageClick}
              disabled={loading}
            >
              Change photo
            </button>
          </div>
        </div>
        {/* Form Fields */}
        <div className="profile-content">
          <div className="form-fields">
            <div className="form-group">
              <label>User name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>User mail ID</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Linked profile link</label>
              <input
                type="text"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Phone number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Years of experience in data science</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Save Button */}
            <div className="save-btn-container">
              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProfileCardWrapper>
  );
};

export default ProfileCard;