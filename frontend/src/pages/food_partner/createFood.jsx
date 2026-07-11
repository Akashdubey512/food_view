import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/createFood.css";

function CreateFood() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!name || !description || !videoFile) {
      setError("Please enter a name, description, and select a video.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("video", videoFile);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/v1/food",
        formData,
        {
          withCredentials: true,
        }
      );

      setStatus("Food item created successfully.");
      setName("");
      setDescription("");
      setVideoFile(null);

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create food item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  return (
    <main className="create-food-page">
      <section className="create-food-card">
        <h1>Create Food Item</h1>
        <p>Add a meal with name, description, and a short video.</p>

        <form className="create-food-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Food name"
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the dish"
              rows={5}
              required
            />
          </label>

          <label>
            Video
            <input
              type="file"
              accept="video/*"
              name="video"
              onChange={handleFileChange}
              required
            />
          </label>

          {error && <div className="form-message form-message--error">{error}</div>}
          {status && <div className="form-message form-message--success">{status}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Uploading..." : "Create Food"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default CreateFood;