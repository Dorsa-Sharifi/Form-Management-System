import React from "react";
import Section from "@components/Section";
import styles from './AdminPanel.module.css';
interface Item {
  title: string;
}

const AdminPanel: React.FC = () => {
  const sampleItems: Item[] = [
    { title: "Feedback Form" },
    { title: "Survey Q1" },
    { title: "Event Signup" },
  ];

  return (
    <div className={styles.adminpanel}>
      <div className={styles.header}>Admin Panel</div>
      <div className={styles.content}>
        <Section title="Active Forms" items={sampleItems} />
        <Section title="Expired Forms" items={sampleItems} />
        <Section title="Templates" items={sampleItems} indicator />
        <Section title="Created Forms" items={sampleItems} indicator />
      </div>
    </div>
  );
};

export default AdminPanel;
