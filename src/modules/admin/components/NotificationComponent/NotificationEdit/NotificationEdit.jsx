import React, { useState, useEffect } from "react";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  RadioGroup,
  RadioOption,
  RadioLabel,
  ButtonGroup,
  Button,
  CloseButton,
} from "./NotificationEdit.styles";
import { message } from "antd";
import { updateNotification } from "../../../../../api/notificationApi"; // Assuming this is your API function for updating

const NotificationEdit = ({ isOpen, onClose, onSave, notificationData }) => {
  const [timeVisibility, setTimeVisibility] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ heading: "", subText: "" }); // Validation errors

  // Initial form data structure
  const initialFormData = {
    heading: "",
    subText: "",
    trigger: "Schedule",
    timeZone: "",
    time: "00:00",
    frequency: "",
    notificationType: "Only notification",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
   
    if (isOpen && notificationData) {
      // Populate form with existing notification data when editing
      setFormData({
        heading: notificationData.headingText,
        subText: notificationData.subText,
        trigger: notificationData.Trigger,
        timeZone: notificationData.timeZone,
        time: notificationData.time,
        frequency: notificationData.frequency,
        notificationType: notificationData.notificationType,
      });
      setTimeVisibility(notificationData.trigger === "Schedule");
    } else {
      // Reset form for a fresh start if no data is passed
      setFormData(initialFormData);
      setTimeVisibility(initialFormData.trigger === "Schedule");
    }
    setErrors({ heading: "", subText: "" }); // Reset errors
  }, [isOpen, notificationData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "trigger") {
      setTimeVisibility(value === "Schedule");
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation check
    let newErrors = {};
    if (!formData.heading.trim()) newErrors.heading = "Please fill the above field.";
    if (!formData.subText.trim()) newErrors.subText = "Please fill the above field.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    if (formData.trigger === "Schedule" && (!formData.timeZone || !formData.frequency)) {
      message.error("Please select both time zone and frequency when trigger is 'Schedule'.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateNotification(notificationData._id, {
        id: notificationData._id, // assuming the notificationData has an `id` field
        headingText: formData.heading,
        subText: formData.subText,
        trigger: formData.trigger,
        timeZone: formData.timeZone,
        time: formData.time,
        frequency: formData.frequency,
        notificationType: formData.notificationType,
      });

      if(response.message === "Notification updated successfully!"){
          window.location.reload();
      }
      message.success("Notification updated successfully!");

      onSave(response); // Save and update parent state

      setTimeout(() => {
        onClose(); // Close modal after ensuring state updates
      }, 0);
    } catch (error) {
      console.error("Error updating notification:", error);
      message.error("Failed to update notification.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <ModalHeader>Edit Notification</ModalHeader>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Heading</Label>
            <Input
              type="text"
              name="heading"
              placeholder="Type here"
              value={formData.heading}
              onChange={handleInputChange}
            />
            {errors.heading && (
              <div style={{ color: "red", marginTop: "5px" }}>
                {errors.heading}
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Sub text</Label>
            <TextArea
              name="subText"
              placeholder="Type here"
              rows="3"
              value={formData.subText}
              onChange={handleInputChange}
            />
            {errors.subText && (
              <div style={{ color: "red", marginTop: "5px" }}>
                {errors.subText}
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Trigger</Label>
            <Select name="trigger" value={formData.trigger} onChange={handleInputChange}>
              <option value="Schedule">Schedule</option>
              <option value="Immediately">Immediately</option>
            </Select>
          </FormGroup>

          {timeVisibility && (
            <>
              <FormGroup>
                <Label>Select time zone</Label>
                <Select name="timeZone" value={formData.timeZone} onChange={handleInputChange}>
                  <option value="">Select</option>
                  <option value="UTC">UTC</option>
                  <option value="IST">IST</option>
                  <option value="PST">PST</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Select time</Label>
                <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
              </FormGroup>

              <FormGroup>
                <Label>Frequency</Label>
                <Select name="frequency" value={formData.frequency} onChange={handleInputChange}>
                  <option value="">Select</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </Select>
              </FormGroup>
            </>
          )}

          <RadioGroup>
            <RadioOption>
              <input
                type="radio"
                name="notificationType"
                value="Only notification"
                checked={formData.notificationType === "Only notification"}
                onChange={handleInputChange}
              />
              <RadioLabel>Only notification</RadioLabel>
            </RadioOption>
            <RadioOption>
              <input
                type="radio"
                name="notificationType"
                value="Only e-mail"
                checked={formData.notificationType === "Only e-mail"}
                onChange={handleInputChange}
              />
              <RadioLabel>Only e-mail</RadioLabel>
            </RadioOption>
            <RadioOption>
              <input
                type="radio"
                name="notificationType"
                value="Both notification and e-mail"
                checked={formData.notificationType === "Both notification and e-mail"}
                onChange={handleInputChange}
              />
              <RadioLabel>Both notification and e-mail</RadioLabel>
            </RadioOption>
          </RadioGroup>

          <ButtonGroup>
            <Button
              type="submit"
              disabled={isLoading}
              style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NotificationEdit;
