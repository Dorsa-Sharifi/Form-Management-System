import { useState, useEffect } from 'react'
import { IUser } from '../SignUp/SignUp'
import { getCurrentUser, logoutCurrentUser } from '../../LocalStorage'
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const [currentUser, setCurrentUser] = useState<IUser>()
    const navigate = useNavigate()

    useEffect(() => {
        const user = getCurrentUser()
        if (user == null) {
             navigate('/login')
        }
        setCurrentUser(user)
    }, [])

    const handleLogOut = () => {
        logoutCurrentUser()
        navigate('/login')
    }

    return (
        <div className='auth-background'>
            <div className='home-background auth-container' style={{ color: 'white'}}>
                <div className='shape'></div>
                <div className='shape'></div>
                <h1>Welcome to the Home Page {currentUser?.name}</h1>
            </div>
            <button className='log-out-btn btn-primary' onClick={handleLogOut}>Log Out</button>
        </div>
    )
}

export default Home