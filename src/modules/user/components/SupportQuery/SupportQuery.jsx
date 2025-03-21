import React, { useState } from "react";
import {
  Container,
  Modal,
  ModalContent,
  Dropdown,
  Button,
  CloseButton,
  TextBox,
  Title,
} from "../../components/SupportQuery/SupportQuery.style";
import { createSupportQuery } from "../../../../api/supportQueryApi";
import { useUser } from "@clerk/clerk-react";
import { getUserByClerkId } from "../../../../api/userApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const SupportQuery = ({ isOpen, onClose }) => {
  const [priority, setPriority] = useState("Low");
  const [category, setCategory] = useState("Content");
  const [query, setQuery] = useState("");
  const { isSignedIn, user, isLoaded } = useUser();

  const handleSend = async () => {
    try {
      const userData = await getUserByClerkId(user.id);
      const data = await createSupportQuery({
        user_id: userData.data.user._id,
        priority,
        category,
        status: "Created",
        query_description: query,
      });

      // Show toast on successful query submission
      toast.success("Query sent successfully!");

      alert("Query sent successfully!");
      onClose();
    } catch (error) {
      // Show toast on error
      toast.error("Error sending query. Please try again.");
    }
  };

  return (
    <Container isOpen={isOpen}>
      <Modal>
        <Title>Submit a Query</Title>
        <ModalContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "15px",
            }}
          >
            <label>Select Category</label>
            <Dropdown
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Content">Content</option>
              <option value="Billing">Billing</option>
              {/* <option value="Support">Support</option> */}
              <option value="General">General</option>
              <option value="Technical">Technical</option>
            </Dropdown>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "15px",
            }}
          >
            <label>Mention Your Query</label>
            <TextBox
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your issue..."
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              justifyContent: "space-between",
              flexDirection: "row",
              marginLeft: "20px",
            }}
          >
            <Button
              onClick={onClose}
              style={{
                backgroundColor: "white",
                color: "red",
                border: "1px solid red",
              }}
            >
              Close
            </Button>
            <Button
              onClick={handleSend}
              style={{ backgroundColor: "#2390ac", marginRight: "10px" }}
            >
              Send
            </Button>
          </div>
        </ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </Modal>

      {/* ToastContainer should be placed at the root of your component tree */}
      <ToastContainer />
    </Container>
  );
};

export default SupportQuery;
