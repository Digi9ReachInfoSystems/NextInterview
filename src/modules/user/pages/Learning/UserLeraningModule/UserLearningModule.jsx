import React, { useEffect, useState } from "react";
import { UserLearningModuleWrapper } from "./UserLearnigModule.styles"; // Import styled component
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { VscBook } from "react-icons/vsc";
import { LuClock4 } from "react-icons/lu";
import { TbClockEdit } from "react-icons/tb";
import { RiGeminiLine } from "react-icons/ri";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineExpandLess } from "react-icons/md";
import { MdOutlineExpandMore } from "react-icons/md";
import { FaCircleChevronRight } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { getModuleById } from "../../../../../api/addNewModuleApi";
import { Link } from "react-router-dom";

const UserLearningModule = () => {
  const [expandedTopic, setExpandedTopic] = useState(null);
  const moduleId = useParams().id;
  const [courseData, setCourseData] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const apiCaller = async () => {
      try {
        console.log("ModuleId", moduleId);
        const response = await getModuleById(moduleId);
        console.log(response);
        const data = {
          title: response.data.moduleName,
          topics: response.data.topicData.length,
          duration: response.data.approxTimeTaken,
          lastUpdated: new Date(response.data.updatedAt).toLocaleDateString(),
          description: response.data.description,
          learningGoals: response.data.userLearntData?.map(
            (item) => item.learntData
          ),

          topicsList: response.data.topicData?.map((item) => {
            return {
              title: item.topicName,
              subtopics: item.subtopicData.map(
                (subitem) => subitem.subtopicName
              ),
            };
          }),
          imageUrl: response.data?.imageURL, // Course Image URL
        };
        console.log("data", data);
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    apiCaller();
  }, []);

  const toggleExpand = (index) => {
    setExpandedTopic(expandedTopic === index ? null : index);
  };

  return (
    <UserLearningModuleWrapper>
      {/* Image and course details section */}
      <div className="course-header">
        <img src={courseData.imageUrl} alt="Course" className="course-image" />
        <div className="course-info">
          <h1 className="course-info-title">{courseData.title}</h1>
        </div>
        <div className="course-actions">
          <div className="course-details">
            <span className="topics">
              <span className="topic-icon">
                <VscBook size={28} />
              </span>
              <span className="topic-information">
                <span className="topics-title">Topics:</span>{" "}
                <span className="topics-count">{courseData.topics}</span>
              </span>
            </span>
            <span className="topics">
              <span className="duration-icon">
                <LuClock4 size={28} />
              </span>
              <span className="topic-information">
                <span className="topics-title">Maximum time taken:</span>{" "}
                <span className="topics-count">
                  Less than {courseData.duration} hrs
                </span>
              </span>
            </span>
            <span className="topics">
              <span className="last-updated-icon">
                <TbClockEdit size={28} />
              </span>
              <span className="topic-information">
                <span className="topics-title">Last updated on:</span>{" "}
                <span className="topics-count">{courseData.lastUpdated}</span>
              </span>
            </span>
          </div>
          <div className="course-action-btns">
            <button
              className="view-sample-btn"
              onClick={() => {
                navigate(`/user/learning/${moduleId}/topic/sampleInterview`);
              }}
            >
              <RiGeminiLine /> View Sample Interview
            </button>
            <Link
              to={`/user/learning/${moduleId}/topic`}
              state={{ topicIndex: 0, subtopicIndex: 0 }}
            >
              {" "}
              <button className="start-learning-btn">Start Learning</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Course Overview and Learning Details */}
      <div className="course-overview">
        <h3 className="course-overview-title">Course Overview</h3>
        <p className="course-overview-description">{courseData.description}</p>
      </div>

      {/* Learning Goals */}
      <div className="learning-goals">
        <h3 className="course-overview-title">What you will learn</h3>
        <ul className="learning-goals-list">
          {courseData.learningGoals?.map((goal, index) => (
            <li key={index}>
              <span className="check">
                <FaCheckCircle />
              </span>{" "}
              {goal}
            </li>
          ))}
        </ul>
      </div>

      {/* Course Topics */}
      <div className="course-topics">
        <h3 className="course-overview-title">Topics</h3>
        {courseData.topicsList?.map((topic, index) => (
          <div key={index} className="topic">
            <div className="topic-title" onClick={() => toggleExpand(index)}>
              <span>{topic.title}</span>
              <span>
                {expandedTopic === index ? (
                  <MdOutlineExpandLess size={38} />
                ) : (
                  <MdOutlineExpandMore size={38} />
                )}
              </span>{" "}
              {/* Toggle indicator */}
            </div>
            {expandedTopic === index && (
              <div className="subtopics">
                {topic.subtopics.map((subtopic, subIndex) => (
                  <p key={subIndex}>
                    {" "}
                    <FaCircleChevronRight size={24} className="subtopicicon" />
                    {subtopic}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </UserLearningModuleWrapper>
  );
};

export default UserLearningModule;
