import { useEffect, useState, useCallback } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { MdExpandLess } from "react-icons/md";
import { MdExpandMore } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { RiGeminiLine } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { ModuleSidebarContainer, MobileToggleButton, Overlay } from "./ModuleSidebar.styles";
import Logo from "../../assets/Logo.png";
import { getModuleById } from "../../api/addNewModuleApi";
import { getUserProgressByModule, getUserProgressBySubTopic, getUserProgressStats } from "../../api/userProgressApi";
import { useUser } from "@clerk/clerk-react";
import { getUserByClerkId } from "../../api/userApi";

const courseData1 = {
  title: "",
  topicsList: [],
};

export default function ModuleSidebar({
  isExpanded,
  setIsExpanded,
  setTitle,
  courseProgress,
}) {
  const location = useLocation();
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [totalTopics, setTotalTopics] = useState(0);
  const [totalCompletedTopics, setTotalCompletedTopics] = useState(0);
  const [moduleProgressPercentage, setModuleProgressPercentage] = useState(0);
  const navigate = useNavigate();
  const [slectectedCurrentSubTopic, setSelectedCurrentSubTopic] = useState(null);
  const [courseData, setCourseData] = useState(courseData1);
  const moduleId = useParams().id;
  const { isLoaded, user, isSignedIn } = useUser();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const fetchModuleData = useCallback(async () => {
    try {
      const response = await getModuleById(moduleId);
      console.log("Module data:", response.data);
      
      if (!response.data || !response.data.topicData || response.data.topicData.length === 0) {
        console.error("No topic data found in module response");
        return;
      }
      
      const responseUser = await getUserByClerkId(user.id);
      const userModuleProgress = await getUserProgressByModule({ userId: responseUser.data.user._id, moduleCode: response.data.module_code });
      const userModuleProgressStats = await getUserProgressStats(responseUser.data.user._id);
      
      setExpandedTopic(location.state?.topicIndex || 0);
      setSelectedCurrentSubTopic(location.state?.subtopicIndex || 0);

      userModuleProgressStats.ModuleProgress.map((item) => {
        if (item.moduleCode === response.data.module_code) {
          setTotalCompletedTopics(item.topicStats.completed);
          setModuleProgressPercentage(Number.parseFloat(item.topicStats.completed / (response.data.topicData.length) * 100).toFixed(0));
        }
      });
      
      setTotalTopics(response.data.topicData.length);
      
      const data = {
        title: response.data.moduleName,
        topicsList: await Promise.all(response.data.topicData.map(async (item) => {
          return {
            title: item.topicName,
            topic_code: item.topic_code,
            subtopics: await Promise.all(item.subtopicData.map(async (subitem) => {
              console.log("Processing subtopic:", subitem.subtopicName, "with code:", subitem.subtopic_code);
              const subTopicProgress = await getUserProgressBySubTopic({ 
                userId: responseUser.data.user._id, 
                moduleCode: response.data.module_code, 
                topicCode: item.topic_code, 
                subtopicCode: subitem.subtopic_code 
              });
              
              return {
                title: subitem.subtopicName,
                subtopic_code: subitem.subtopic_code,
                completed: subTopicProgress?.data?.status === "completed" ? true : false,
              };
            })),
          };
        })),
      };
      
      console.log("Final course data structure:", data);
      setCourseData(data);
    } catch (error) {
      console.error("Error in ModuleSidebar apiCaller:", error);
    }
  }, [moduleId, user, location.state]);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData, lastUpdate]);

  // Add event listener for module updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setLastUpdate(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also refresh when navigating back to the page
    const handleFocus = () => {
      setLastUpdate(Date.now());
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setIsExpanded(true);
    }
  }, [isMobile]);

  const toggleExpand = (index) => {
    setExpandedTopic(expandedTopic === index ? null : index);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!isMobile) {
      setIsExpanded(!isExpanded);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.module-sidebar');
      const toggleButton = document.querySelector('.mobile-toggle-button');
      
      if (isMobile && sidebarOpen && 
          !sidebar.contains(event.target) && 
          !toggleButton.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (isMobile && sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);
  return (
    <>
      {isMobile && (
        <MobileToggleButton className="mobile-toggle-button" onClick={toggleSidebar}>
          <GiHamburgerMenu size={24} />
        </MobileToggleButton>
      )}
      
      <Overlay 
        visible={isMobile && sidebarOpen} 
        onClick={() => setSidebarOpen(false)}
      />
      
      <ModuleSidebarContainer
        className="module-sidebar"
        isExpanded={isExpanded}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
      >
        <div className="logo">
          <img src={Logo} alt="logo" />
        </div>

        {/* Progress Bar Section */}
        <div className="progress-section">
          <h1 className="module-sidebar-topic-title">{courseData.title}</h1>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${moduleProgressPercentage}%`, backgroundColor: moduleProgressPercentage>=35? moduleProgressPercentage>=75?"green" :  "orange":"red" }}
            ></div>
          </div>
          <div className="progress-details">
            <div className="progress-details-count">
              <span>{totalCompletedTopics} /{courseData.topicsList.length} Topics completed</span>
              <span></span>
            </div>

            <div className="progress-details-percentage"
            style={{
              fontSize: "16px",
            }} >
              <span>{moduleProgressPercentage}%</span>
            </div>
          </div>
          <button
            className="start-button"
            onClick={() => {
              navigate(`/user/learning/${moduleId}/topic/sampleInterview`);
            }}
          >
            <RiGeminiLine /> View sample interview
          </button>
        </div>

        <div className="course-topics" style={{ overflowY: "auto" }}>
          <h3 className="course-topics-title">Topics</h3>
          {courseData.topicsList?.map((topic, index) => (
            <div key={index} className="topic">
              <div className="topic-title" onClick={() => toggleExpand(index)}>
                <span className="topic-name">{topic.title}</span>
                <span 
                >
                  {expandedTopic === index ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                </span>
              </div>
              {expandedTopic === index && (
                <div className="subtopics">
                  {topic.subtopics.length === 0 ? (
                    <p>No subtopics available</p>
                  ) : (
                    topic.subtopics?.map((subtopic, subIndex) => (
                      <Link
                        key={`${index}-${subIndex}`}
                        className="subtopic-link"
                        to={`/user/learning/${moduleId}/topic`}
                        state={{
                          topicIndex: index,
                          subtopicIndex: subIndex,
                        }}
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        <div key={subIndex} className="subtopic">
                          <div className="subtopic-info" style={{ backgroundColor: slectectedCurrentSubTopic == subIndex ? "lightgray" : "transparent", borderRadius: "5px" }}>
                            <span
                              className={
                                subtopic.completed ? "completed" : "pending"
                              }
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <span>
                                  {subtopic.completed ? (
                                    <FaCheckCircle />
                                  ) : (
                                    <FaCheckCircle style={{ color: "gray" }} />
                                  )}
                                </span>
                                <span className="subtopic-title">
                                  {subtopic.title}
                                </span>
                              </div>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ModuleSidebarContainer>
    </>
  );
}