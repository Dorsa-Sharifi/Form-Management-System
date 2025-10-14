import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { JWT_TOKEN_KEY } from '@consts/localStorage.ts';
import { baseURL } from '@consts/api.ts';
import styles from './SignIn.module.css';

const { Title } = Typography;

const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        onSuccess: (codeResponse) => {
            fetch(`${baseURL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: codeResponse.code }),
            })
                .then(res => res.json())
                .then(json => {
                    localStorage.setItem(JWT_TOKEN_KEY, json["token"]);
                    navigate('/');
                })
                .catch(err => console.log(err));
        },
        flow: 'auth-code',
    });

    const handleFormSubmit = () => {
        if (!username || !password) {
            message.warning('Please fill all the fields');
            return;
        }

        fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then(res => res.json())
            .then(json => {
                localStorage.setItem(JWT_TOKEN_KEY, json["token"]);
                navigate('/');
            })
            .catch(err => console.log(err));
    };

    return (
        <div className={styles.authBackground}>
            <div className={styles.authContainer}>
                <div className={styles.shape}></div>
                <div className={styles.shape}></div>
            </div>

            <Form
                className={styles.loginForm}
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={{ username, password }}
            >
                <Title level={3}>Sign In Page</Title>

                <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                    <Input
                        placeholder="Enter your username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </Form.Item>

                <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                    <Input.Password
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Sign In
                    </Button>
                </Form.Item>

                <div className={styles.switch}>
                    <Link to="/register">Don’t have an account? Sign Up</Link>
                </div>

                <div className={styles.switch}>
                    <Button type="link" onClick={googleLogin} style={{}}>
                        Login with Google
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Login;
