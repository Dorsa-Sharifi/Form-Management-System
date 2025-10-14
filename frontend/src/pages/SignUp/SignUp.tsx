import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { baseURL } from '@consts/api.ts';
import { Form, Input, Button, Select, Typography, message } from 'antd';
import { JWT_TOKEN_KEY } from "@consts/localStorage.ts";
import styles from './SignUp.module.css';

export interface IUser {
    name: string;
    username: string;
    phone: string;
    password: string;
    role: string;
}

const { Title } = Typography;
const { Option } = Select;

const Register = () => {
    const [user, setUser] = useState<IUser>({
        name: '',
        username: '',
        phone: '',
        password: '',
        role: 'ROLE_USER'
    });

    const navigate = useNavigate();

    const handleFormSubmit = () => {
        const { name, username, phone, password, role } = user;

        if (!name || !username || !phone || !password || !role) {
            message.warning('Please fill all the fields');
            return;
        }

        fetch(`${baseURL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, name, role })
        }).then(res => res.json()).then(json => {
            localStorage.setItem(JWT_TOKEN_KEY, json["token"]);
            navigate('/');
        }).catch(err => console.log(err));
    };

    return (
        <div className={styles.authBackground}>
            <div className={`${styles.authContainer}`}>
                <div className={styles.shape}></div>
                <div className={styles.shape}></div>
            </div>

            <Form
                className={styles.loginForm}
                layout='vertical'
                onFinish={handleFormSubmit}
                initialValues={user}
            >
                <Title level={3}>Sign Up Page</Title>

                <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                    <Input
                        placeholder="Enter your full name"
                        value={user.name}
                        onChange={e => setUser({ ...user, name: e.target.value })}
                    />
                </Form.Item>

                <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                    <Input
                        placeholder="Enter your username"
                        value={user.username}
                        onChange={e => setUser({ ...user, username: e.target.value })}
                    />
                </Form.Item>

                <Form.Item label="Phone Number" name="phone" rules={[{ required: true }]}>
                    <Input
                        placeholder="Enter your phone number"
                        value={user.phone}
                        onChange={e => setUser({ ...user, phone: e.target.value })}
                    />
                </Form.Item>

                <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                    <Input.Password
                        placeholder="Enter your password"
                        value={user.password}
                        onChange={e => setUser({ ...user, password: e.target.value })}
                    />
                </Form.Item>

                <Form.Item label="Role" name="role">
                    <Select
                        defaultValue="ROLE_USER"
                        onChange={value => setUser({ ...user, role: value })}
                    >
                        <Option value="ROLE_USER">User</Option>
                        <Option value="ROLE_ADMIN">Admin</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Sign Up
                    </Button>
                </Form.Item>

                <div className={styles.switch}>
                    <Link to="/login">Already have an account? Sign In</Link>
                </div>
            </Form>
        </div>
    );
};

export default Register;
