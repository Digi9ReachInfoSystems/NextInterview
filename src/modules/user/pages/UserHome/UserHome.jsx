import React, { useEffect, useState } from "react";
import {
  UserHomeWrapper,
  InterviewFavoriteCardContainer,
  ArrowButton,
} from "./UserHome.styles";
import TakeChallenge from "../../components/UserChalleneges/TakeChallenge";
import UserReminder from "../../components/UserReminder/UserReminder";
import InterviewFavoriteCard from "../../components/InterviewFavoriteCard/InterviewFavoriteCard";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

export default function UserHome() {
  const interviewFavoriteCardData = [
    {
      title: "Diagnosing and Investigating Metrics",
      description: "Analyze data to gain insights and make smarter decisions.",
      topics: 3,
      duration: "Less than 2 hrs",
      imgSrc: [
        "https://th.bing.com/th/id/OIP.hfNK8S7ywtaPVr8WGTV4-wHaE7?rs=1&pid=ImgDetMain",
        "https://th.bing.com/th/id/OIP.hfNK8S7ywtaPVr8WGTV4-wHaE7?rs=1&pid=ImgDetMain",
      ],
    },
    {
      title: "Optimizing System Performance",
      description: "Learn how to enhance system efficiency and responsiveness.",
      topics: 4,
      duration: "2 to 3 hrs",
      imgSrc: [
        "https://th.bing.com/th/id/OIP.hfNK8S7ywtaPVr8WGTV4-wHaE7?rs=1&pid=ImgDetMain",
        "https://th.bing.com/th/id/OIP.hfNK8S7ywtaPVr8WGTV4-wHaE7?rs=1&pid=ImgDetMain",
        "https://th.bing.com/th/id/OIP.hfNK8S7ywtaPVr8WGTV4-wHaE7?rs=1&pid=ImgDetMain",
      ],
    },
    {
      title: "Building Scalable Systems",
      description:
        "Master the art of designing systems that handle growth seamlessly.",
      topics: 5,
      duration: "3+ hrs",
      imgSrc: [
        "https://th.bing.com/th/id/OIP.hfNK8S7ywtaPVr8WGTV4-wHaE7?rs=1&pid=ImgDetMain",
      ],
    },
  ];

  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setStartIndex(
      (prevIndex) => (prevIndex + 1) % interviewFavoriteCardData.length
    );
  };

  const handlePrev = () => {
    setStartIndex(
      (prevIndex) =>
        (prevIndex - 1 + interviewFavoriteCardData.length) %
        interviewFavoriteCardData.length
    );
  };

  const getVisibleCards = () => {
    return Array.from({ length: 4 }, (_, i) => {
      const index = (startIndex + i) % interviewFavoriteCardData.length;
      return interviewFavoriteCardData[index];
    });
  };

  const visibleCards = getVisibleCards();

  return (
    <UserHomeWrapper>
      <div className="userHomerowOne">
        <TakeChallenge />
      </div>
      <div className="reminderContainer">
        <UserReminder />
      </div>
      <div className="interviewFav-container">
        <div className="interviewFav-title">
          <h3>Interview Favourites</h3>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowButton onClick={handlePrev}>
            <FaAngleLeft />
          </ArrowButton>
          <InterviewFavoriteCardContainer>
            {visibleCards.map((cardData, index) => (
              <InterviewFavoriteCard
                key={`${startIndex}-${index}`}
                title={cardData.title}
                description={cardData.description}
                topics={cardData.topics}
                duration={cardData.duration}
                imgSrc={cardData.imgSrc}
              />
            ))}
          </InterviewFavoriteCardContainer>
          <ArrowButton onClick={handleNext}>
            <FaAngleRight />
          </ArrowButton>
        </div>
      </div>
    </UserHomeWrapper>
  );
}
