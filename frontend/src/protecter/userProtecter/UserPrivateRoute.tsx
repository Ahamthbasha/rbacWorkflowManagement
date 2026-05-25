import {Navigate,Outlet} from 'react-router-dom'

const UserPrivateRoute = () => {
    const isUserAuthenticated = Boolean(localStorage.getItem("user"))

    return isUserAuthenticated ? <Outlet /> : <Navigate to='/user/login'/>
}

export default UserPrivateRoute

