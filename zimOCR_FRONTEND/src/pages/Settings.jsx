import React, { useState } from "react";
import "./Settings.css";

function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: "enabled",
    smsNotifications: "disabled",
    language: "en",
    defaultRole: "user",
  });

  const handleSettingChange = (setting, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [setting]: value,
    }));
  };

  const handleSave = (settingType) => {
    console.log(`Saved ${settingType} settings:`, settings);
    // Implement saving logic
    alert(`${settingType} settings saved successfully`);
  };

  return (
    <div className="settings">
      <h2 className="page-title">Settings</h2>
      <div className="settings-info">
        <p>Manage your general settings and preferences below.</p>
      </div>

      <div className="settings-container">
        {/* Notification Preferences */}
        <div className="settings-card">
          <h3>Notification Preferences</h3>
          <div className="setting-group">
            <label htmlFor="emailNotifications">Email Notifications:</label>
            <select
              id="emailNotifications"
              value={settings.emailNotifications}
              onChange={(e) =>
                handleSettingChange("emailNotifications", e.target.value)
              }
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div className="setting-group">
            <label htmlFor="smsNotifications">SMS Notifications:</label>
            <select
              id="smsNotifications"
              value={settings.smsNotifications}
              onChange={(e) =>
                handleSettingChange("smsNotifications", e.target.value)
              }
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleSave("Notification")}
          >
            Save
          </button>
        </div>

        {/* Language Settings */}
        <div className="settings-card">
          <h3>Language Settings</h3>
          <div className="setting-group">
            <label htmlFor="language">Select Language:</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => handleSettingChange("language", e.target.value)}
            >
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleSave("Language")}
          >
            Save
          </button>
        </div>

        {/* User Roles */}
        <div className="settings-card">
          <h3>User Roles</h3>
          <div className="setting-group">
            <label htmlFor="defaultRole">Default User Role:</label>
            <select
              id="defaultRole"
              value={settings.defaultRole}
              onChange={(e) =>
                handleSettingChange("defaultRole", e.target.value)
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleSave("User Role")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
