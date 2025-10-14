import React from 'react';
import Button from '@components/Button';
import styles from './Home.module.css';

const Home: React.FC = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to My App! 🎉</h1>
            <p className={styles.subtitle}>Let's build something amazing together.</p>

            <div className={styles.buttons}>
                <Button onClick={() => alert('Primary button clicked')}>
                    Get Started
                </Button>

                <Button variant="secondary" onClick={() => alert('Secondary button clicked')}>
                    Learn More
                </Button>
            </div>
        </div>
    );
};

export default Home;
