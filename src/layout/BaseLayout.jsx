import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar/Sidebar";
import SidebarUser from "../components/user/SidebarUser/SidebarUser";
import { PageWrapper, ContentWrapper } from "./BaseLayout.style";
import Header from "../components/Header/Header";
import NavBar from "../components/admin/Navbar/Navbar";
import UserHeader from "../components/UserHeader/UserHeader";
import ModuleSidebar from "../components/ModuleSidebar/ModuleSidebar";

const BaseLayout = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [title, setTitle] = useState(
    JSON.parse(localStorage.getItem("title")) || ""
  );
  const location = useLocation();

  // Determine layout based on path
  const isAdminPath = location.pathname.startsWith("/admin");
  const isUserPath = location.pathname.startsWith("/user");
  const ModulePath =
    location.pathname.startsWith("/user/learning/") &&
    location.pathname.endsWith("/topic");

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
    if (window.innerWidth <= 768) {
      setIsExpanded(true); // Force expanded view on mobile when opened
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && isMobileSidebarOpen) {
        const sidebar = document.querySelector('.sidebar-wrapper');
        if (sidebar && !sidebar.contains(event.target) && 
            !event.target.closest('.mobile-hamburger')) {
          setIsMobileSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSidebarOpen]);

  return (
    <PageWrapper isExpanded={isExpanded}>
      {isAdminPath ? (
        <>
          <Sidebar
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            setTitle={setTitle}
            isSidebarOpen={isMobileSidebarOpen}
            setIsSidebarOpen={setIsMobileSidebarOpen}
          />
          <ContentWrapper isExpanded={isExpanded}>
            <Header 
              title={title} 
              toggleMobileSidebar={toggleMobileSidebar}
            />
            <NavBar />
            <Outlet />
          </ContentWrapper>
        </>
      ) : ModulePath ? (
        <>
          <ModuleSidebar
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            setTitle={setTitle}
            isSidebarOpen={isMobileSidebarOpen}
            setIsSidebarOpen={setIsMobileSidebarOpen}
          />
          <ContentWrapper isExpanded={isExpanded}>
            <UserHeader 
              title={title} 
              toggleMobileSidebar={toggleMobileSidebar}
            />
            <Outlet />
          </ContentWrapper>
        </>
      ) : isUserPath ? (
        <>
          <SidebarUser
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            setTitle={setTitle}
            isSidebarOpen={isMobileSidebarOpen}
            setIsSidebarOpen={setIsMobileSidebarOpen}
          />
          <ContentWrapper isExpanded={isExpanded}>
            <UserHeader 
              title={title} 
              toggleMobileSidebar={toggleMobileSidebar}
            />
            <Outlet />
          </ContentWrapper>
        </>
      ) : (
        <div>
          <h1>404 - Page Not Found</h1>
        </div>
      )}
    </PageWrapper>
  );
};

export default BaseLayout;