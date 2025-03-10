import React from "react";
import "./ContainerLoader.css";

const ContainerLoader = ({ message = "Loading" }) => {
  return (
    <div className="loader-container">
      <div className="crane-container-loader">
        <div className="crane">
          <div className="crane-top"></div>
          <div className="crane-arm"></div>
          <div className="crane-cable"></div>
        </div>
        <div className="container">
          <div className="container-ridges"></div>
        </div>
        <div className="base"></div>
      </div>
      <div className="loading-text">{message}</div>
    </div>
  );
};

export default ContainerLoader;
