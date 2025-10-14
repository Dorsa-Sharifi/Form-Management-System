import React, { useEffect, useState } from "react";
import Section from "@pages/Section";
import styles from './AdminPanel.module.css';
import { useNavigate } from "react-router-dom";
import {getAllForms, Form, getAllSharedForms} from "@services/apiService.ts";
import {JWT_TOKEN_KEY} from "@consts/localStorage.ts";

export interface FormItem {
  title: string;
  id: number;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [sharedForms, setSharedForms] = useState<FormItem[]>([]);

  const handleAiIconClick = () => {
    navigate('/ai-assistant');
  };

  const handleLogout = () => {
    localStorage.removeItem(JWT_TOKEN_KEY);
    navigate('/login');
  };


  useEffect(() => {
    const fetchForms = async () => {
      try {
        const formsData = await getAllForms();
        // Map backend Form objects to FormItem interface
        const items = formsData.map((form: Form) => ({
          title: form.title, // Backend uses 'title' field
          id: form.id,
        }));
        setForms(items);
      } catch (error) {
        console.error("Failed to load forms:", error);
      }
    };
    const fetchSharedForms = async () => {
      try {
        const formsData = await getAllSharedForms();
        // Map backend Form objects to FormItem interface
        const items = formsData.map((form: Form) => ({
          title: form.title, // Backend uses 'title' field
          id: form.id,
        }));
        setSharedForms(items);
      } catch (error) {
        console.error("Failed to load forms:", error);
      }
    };

    fetchForms();
    fetchSharedForms();
  }, []);

  return (
      <div className={styles.adminpanel}>
        <div className={styles.header}>
          Admin Panel
          <div
              className={styles.aiIcon}
              onClick={handleAiIconClick}
              style={{ cursor: 'pointer' }}
          >
            <i className="fas fa-robot"></i>
          </div>
          <button
              className={styles.logoutIcon}
              onClick={handleLogout}
              title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
        <div className={styles.content}>
          <Section title="Owned Forms" items={forms} indicator isOwned={true} />
          <Section title="Shared Forms" items={sharedForms} isOwned={false}/>
        </div>
      </div>
  );
};

export default AdminPanel;
