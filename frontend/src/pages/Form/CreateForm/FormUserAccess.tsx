import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Input, List, Button, Spin, message, Typography, Divider, Avatar } from 'antd';
import { UserOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getFormUsers, getAllUsers, addUserToForm, removeUserFromForm } from '../services/formApi';

interface FormUserAccessProps {
  formId?: string;
}

export interface UserItem {
  id: number;
  username: string;
}

const { Title } = Typography;

const FormUserAccess = forwardRef<any, FormUserAccessProps>(({ formId }, ref) => {
  const [users, setUsers] = useState<UserItem[]>([]); // users with access (edit mode)
  const [allUsers, setAllUsers] = useState<UserItem[]>([]); // all users
  const [search, setSearch] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  // For create mode
  const [pendingUsers, setPendingUsers] = useState<UserItem[]>([]);

  // Expose getSelectedUsers for create mode
  useImperativeHandle(ref, () => ({
    getSelectedUsers: () => pendingUsers.map(u => u.id)
  }), [pendingUsers]);

  // Fetch users with access on mount (edit mode)
  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    getFormUsers(formId)
      .then(setUsers)
      .catch(() => message.error('Failed to load form users'))
      .finally(() => setLoading(false));
  }, [formId]);

  // Fetch all users when search bar is focused
  const handleSearchFocus = () => {
    if (allUsers.length === 0) {
      setLoading(true);
      getAllUsers()
        .then(setAllUsers)
        .catch(() => message.error('Failed to load all users'))
        .finally(() => setLoading(false));
    }
    setSearchActive(true);
  };

  // Filter users for search
  const filteredUsers = allUsers.filter((u) => {
    if (formId) {
      return u.username.toLowerCase().includes(search.toLowerCase()) && !users.some((user) => user.id === u.id);
    } else {
      return u.username.toLowerCase().includes(search.toLowerCase()) && !pendingUsers.some((user) => user.id === u.id);
    }
  });

  // Add user to form (edit mode)
  const handleAddUser = async (user: UserItem) => {
    if (!formId) {
      setPendingUsers(prev => [...prev, user]);
      setSearch('');
      return;
    }
    setAdding(user.id);
    try {
      await addUserToForm(formId, user.id);
      setUsers((prev) => [...prev, user]);
      message.success(`Added ${user.username}`);
      setSearch('');
    } catch {
      message.error('Failed to add user');
    } finally {
      setAdding(null);
    }
  };

  // Remove user from form (edit mode)
  const handleRemoveUser = async (user: UserItem) => {
    if (!formId) {
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      return;
    }
    setRemoving(user.id);
    try {
      await removeUserFromForm(formId, user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      message.success(`Removed ${user.username}`);
    } catch {
      message.error('Failed to remove user');
    } finally {
      setRemoving(null);
    }
  };

  // Render list for edit or create mode
  const userList = formId ? users : pendingUsers;
  const emptyText = formId ? 'No users have access yet.' : 'No users selected.';

  return (
    <div style={{ width: '100%', padding: 8 }}>
      <Title level={5} style={{ marginBottom: 8 }}>{formId ? 'Users with Access' : 'Users to Add'}</Title>
      {loading ? <Spin /> : (
        <List
          dataSource={userList}
          locale={{ emptyText }}
          renderItem={user => (
            <List.Item
              actions={[
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  loading={removing === user.id}
                  onClick={() => handleRemoveUser(user)}
                  key="remove"
                >Remove</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={user.username}
              />
            </List.Item>
          )}
          style={{ marginBottom: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #eee' }}
        />
      )}
      <Divider style={{ margin: '12px 0' }}>Add User</Divider>
      <Input
        placeholder="Search users to add..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={e => setSearch(e.target.value)}
        onFocus={handleSearchFocus}
        allowClear
        style={{ marginBottom: 8 }}
      />
      {searchActive && (
        <List
          dataSource={filteredUsers}
          locale={{ emptyText: search ? 'No matching users.' : 'Type to search.' }}
          renderItem={user => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  loading={adding === user.id}
                  onClick={() => handleAddUser(user)}
                  key="add"
                >Add</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={user.username}
              />
            </List.Item>
          )}
          style={{ maxHeight: 200, overflowY: 'auto', background: '#fafafa', borderRadius: 8, boxShadow: '0 1px 4px #eee' }}
        />
      )}
    </div>
  );
});

export default FormUserAccess; 