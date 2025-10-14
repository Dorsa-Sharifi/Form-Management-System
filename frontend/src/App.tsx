import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import NotFound from "@pages/NotFound";
import Login from 'pages/SignIn/SignIn'
import Register from 'pages/SignUp/SignUp'
import Home from 'pages/Home/Home'
import {JWT_TOKEN_KEY} from "@consts/localStorage.ts";
import ReportsPage from "@pages/Form/Reports"
import AdminPanel from '@pages/AdminPanel';
import CreateForm from "@pages/Form/CreateForm/CreateForm.tsx";
import FillForm from '@pages/Form/FillForm/FillForm';
import {GoogleOAuthProvider} from "@react-oauth/google";
import AiAssistant from '@pages/Ai/AiAssistant';

const App = () => {
    return (
        <GoogleOAuthProvider clientId="1011307097195-8nqhla0igioesrh94acasua0b5sncds0.apps.googleusercontent.com">
            <BrowserRouter>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/' element={<PrivateRoute />}>
                        <Route path='/' element={<Home />} />
                    </Route>
                    <Route path="/reports/:forumId" element={<ReportsPage />} />
                    <Route path="/panel" element={<AdminPanel/>}/>
                    <Route path="/panel/form/edit/:formId" element={
                        <CreateForm create_or_edit="edit" name={''} params={{
                            formId: undefined
                        }}/>
                    }/>
                    <Route path="/panel/fillform/:formId" element={<FillForm />} />
                    <Route path="/panel/createform" element={
                        <CreateForm name={''} params={{
                            formId: undefined
                        }}/>
                    }/>
                    <Route path="*" element={<NotFound />} />
                    <Route path="/ai-assistant" element={<AiAssistant />} />
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
    )
};

const PrivateRoute = () => {
    const token = localStorage.getItem(JWT_TOKEN_KEY)
    if (token == null){
        return <Navigate to='/login' />
    } else {
        return <Navigate to='/panel' />
    }
}

export default App;
