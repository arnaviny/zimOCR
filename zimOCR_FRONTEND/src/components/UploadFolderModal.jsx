import React, { useState } from "react";
import "./UploadFolderModal.css";

const UploadFolderModal = ({ isOpen, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFolderUpload = (event) => {
    const files = event.target.files;
    setSelectedFiles([...files]);
  };

  const handleSubmit = () => {
    console.log("Uploaded files:", selectedFiles);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Folder</h2>
        <input
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handleFolderUpload}
        />
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFolderModal;
