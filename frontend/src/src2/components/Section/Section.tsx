import React from "react";
import styles from './Section.module.css';

interface Item {
  title: string;
}

interface SectionProps {
  title: string;
  items: Item[];
  indicator?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, items, indicator }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionheader}>
        <div className={styles.headerleft}>
          {indicator && <span className={styles.indicatordot} />}
          <span>{title}</span>
        </div>
        {indicator && (
          <button
            className={styles.addbutton}
            onClick={() => alert(`Add new item to ${title}`)}
          >
            +
          </button>
        )}
      </div>
      <div className={styles.cardgrid}>
        {items.map((item, index) => (
          <div
            key={index}
            className={styles.card}
            onClick={() => alert(`Clicked on: ${item.title}`)}
          >
            <div className={styles.cardtitle}>{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Section;
