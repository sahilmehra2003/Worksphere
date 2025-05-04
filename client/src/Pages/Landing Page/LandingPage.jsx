import { Outlet } from 'react-router-dom'
import LandingPageNav from '../../components/LandingPageNav'


const LandingPage = () => {
  return (
    <div>
        <LandingPageNav/>
        <Outlet/>
    </div>
  )
}

export default LandingPage
