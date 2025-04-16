import React, { useEffect, useState } from "react";
import {
    getAllBlogs,
    createBlog,
    deleteBlogById,
    updateBlogById,
} from "../../../../api/blogApi";
import {
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { Editor } from "@tinymce/tinymce-react";
import { uploadFileToFirebase } from "../../../../utils/uploadFileToFirebase";
import { message } from "antd";
import {
    TinyMCEplugins,
    TinyMCEToolbar,
    TinyMCEapiKey,
} from "../../../../config/TinyMceConfig";
import DeleteModule from "../../../admin/components/DeleteModule/DeleteModule";
import "../../../admin/pages/Blog/Blog.scss";
import { Link } from "react-router-dom";
import { ShimmerThumbnail } from "react-shimmer-effects";

const BlogForm = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteBlogId, setDeleteBlogId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editBlogId, setEditBlogId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await getAllBlogs();
                if (Array.isArray(response.data)) {
                    setBlogs(response.data);
                } else {
                    setError("Unexpected response format.");
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setError(error.message);
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            try {
                const imageURL = await uploadFileToFirebase(file, "flashcard");
                setImage(imageURL);
                message.success("Image uploaded successfully!");
            } catch (error) {
                console.error("Error uploading image:", error);
                message.error("Failed to upload image.");
            }
        } else {
            message.error("Please upload a valid image file.");
        }
    };

    const handleCreateBlog = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await createBlog({ title, content, image });
            if (response.data) {
                setBlogs(prev => [...prev, response.data]);
                message.success("Blog created successfully!");
            }
            resetForm();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error creating blog:", error.message);
            setError(error.message);
            message.error("Failed to create blog");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBlog = async (blogId) => {
        try {
            setLoading(true);
            const response = await updateBlogById(blogId, {
                title,
                content,
                image: image || blogs.find(b => b._id === blogId)?.blog_image,
            });
            
            if (response.data) {
                setBlogs(prevBlogs =>
                    prevBlogs.map(b => b._id === blogId ? response.data : b)
                );
                message.success("Blog updated successfully!");
                setIsModalOpen(false);
                resetForm();
            }
        } catch (error) {
            console.error("Error updating blog:", error.message);
            setError(error.message);
            message.error("Failed to update blog");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlog = async () => {
        if (!deleteBlogId) return;
        try {
            setLoading(true);
            await deleteBlogById(deleteBlogId);
            setBlogs(prevBlogs => prevBlogs.filter(b => b._id !== deleteBlogId));
            message.success("Blog deleted successfully!");
        } catch (error) {
            console.error("Error deleting blog:", error.message);
            setError(error.message);
            message.error("Failed to delete blog");
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteBlogId(null);
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setContent("");
        setImage(null);
        setImagePreview(null);
        setIsEditMode(false);
        setEditBlogId(null);
    };

    const handleDeleteClick = (blogId) => {
        setDeleteBlogId(blogId);
        setIsDeleteModalOpen(true);
    };

    const handleEditClick = (blog) => {
        setTitle(blog.blog_title);
        setContent(blog.blog_description);
        setImage(blog.blog_image);
        setImagePreview(blog.blog_image || null);
        setEditBlogId(blog._id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (isEditMode && editBlogId) {
            handleUpdateBlog(editBlogId);
        } else {
            handleCreateBlog(e);
        }
    };

    const modalOverlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        scrollBehavior: "smooth",
        overflow: "auto",
    };

    const modalContentStyle = {
        position: "relative",
        backgroundColor: "#fff",
        padding: "20px",
        width: "500px",
        maxWidth: "95%",
        borderRadius: "8px",
    };

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ textAlign: "right" }}>
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    style={{
                        marginBottom: "10px",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "none",
                        color: "#fff",
                        backgroundColor: "#2390ac",
                    }}
                >
                    Create Blog
                </button>
            </div>

            {success && <p>{success}</p>}
            {error && <p>{error}</p>}

            {isModalOpen && (
                <div
                    style={modalOverlayStyle}
                    onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                    }}
                >
                    <div
                        style={modalContentStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CloseOutlined
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                fontSize: "18px",
                                color: "#db590d",
                                cursor: "pointer",
                            }}
                        />
                        <h2>{isEditMode ? "Edit Blog" : "Create Blog"}</h2>
                        <form onSubmit={handleSubmitForm}>
                            <label style={{ fontWeight: "600", fontFamily: "DM Sans" }}>
                                Title:
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    style={{
                                        display: "block",
                                        marginRight: "20px",
                                        width: "95%",
                                        borderRadius: "5px",
                                        border: "1px solid #ccc",
                                        padding: "8px",
                                    }}
                                />
                            </label>
                            <label style={{ fontWeight: "600", fontFamily: "DM Sans" }}>
                                Content:
                                <Editor
                                    apiKey={TinyMCEapiKey}
                                    init={{
                                        plugins: TinyMCEplugins,
                                        toolbar: TinyMCEToolbar,
                                        branding: false,
                                    }}
                                    value={content || ""}
                                    onEditorChange={(newValue) => setContent(newValue)}
                                />
                            </label>
                            <label style={{
                                display: "block",
                                margin: "10px 0",
                                fontWeight: "600",
                                fontFamily: "DM Sans",
                            }}>
                                Image:
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    style={{ display: "block", margin: "10px 0" }}
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{
                                            maxWidth: "100%",
                                            height: "100px",
                                            marginTop: "10px",
                                        }}
                                    />
                                )}
                            </label>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginRight: "10px",
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    backgroundColor: "#2390ac",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                }}
                            >
                                {loading
                                    ? isEditMode
                                        ? "Updating..."
                                        : "Creating..."
                                    : isEditMode
                                        ? "Update"
                                        : "Create"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                style={{
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    backgroundColor: "#2390ac",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                }}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <DeleteModule
                    onDelete={handleDeleteBlog}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            )}

            <h2 style={{ marginLeft: "60px" }}>Blog List</h2>
            <div className="container">
                <div className="card__container">
                    {loading && blogs.length === 0 ? (
                        [...Array(8)].map((_, index) => (
                            <article 
                                key={index} 
                                className="card__article shimmer-article"
                                style={{
                                    borderRadius: "24px",
                                    position: "relative",
                                }}
                            >
                                <ShimmerThumbnail
                                    height={300}
                                    width={328}
                                    rounded
                                    style={{
                                        borderRadius: "24px",
                                        width: "328px",
                                        height: "300px"
                                    }}
                                />
                                <div className="card__data">
                                    <ShimmerThumbnail
                                        height={24}
                                        width="80%"
                                        style={{
                                            marginBottom: "0.75rem",
                                            borderRadius: "4px"
                                        }}
                                    />
                                    <ShimmerThumbnail
                                        height={16}
                                        width="90%"
                                        style={{
                                            marginBottom: "1rem",
                                            borderRadius: "4px"
                                        }}
                                    />
                                    <ShimmerThumbnail
                                        height={16}
                                        width="30%"
                                        style={{
                                            borderRadius: "4px"
                                        }}
                                    />
                                </div>
                            </article>
                        ))
                    ) : (
                        blogs.map((blog) => (
                            <article
                                key={blog._id}
                                className="card__article"
                                style={{
                                    borderRadius: "24px",
                                    position: "relative",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        display: "flex",
                                        gap: "8px",
                                        color: "#fff",
                                    }}
                                >
                                    <EditOutlined
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "18px",
                                            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
                                            color: "#2390ac",
                                        }}
                                        onClick={() => handleEditClick(blog)}
                                    />
                                    <DeleteOutlined
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "18px",
                                            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
                                            color: "red",
                                        }}
                                        onClick={() => handleDeleteClick(blog._id)}
                                    />
                                </div>
                                <img
                                    src={blog.blog_image || "/placeholder.jpg"}
                                    alt={blog.blog_title || "Blog Image"}
                                    className="card__img"
                                />
                                <div className="card__data">
                                    <h3 className="card__title">{blog.blog_title}</h3>
                                    <span
                                        className="card__description"
                                        dangerouslySetInnerHTML={{
                                            __html: parseJSONContent(blog.blog_description)?.slice(0, 35) + '...',
                                        }}
                                    ></span>
                                    <Link to={`/admin/real-world-scenario/${blog._id}`} className="card__button">
                                        Read More
                                    </Link>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const parseJSONContent = (content) => {
    if (!content) return "";
    try {
        if (typeof content === "string" && (content.trim().startsWith("{") || content.trim().startsWith("["))) {
            const parsedContent = JSON.parse(content);
            return typeof parsedContent === "string"
                ? parsedContent
                : JSON.stringify(parsedContent);
        }
        return content;
    } catch (error) {
        console.error("Error parsing JSON content:", error);
        return content || "";
    }
};

export default BlogForm;