import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './data/store'
import Main from './screens/Main'
import Analytics from './screens/Analytics'
import Budget from './screens/Budget'
import Advice from './screens/Advice'
import Voice from './screens/Voice'
import Text from './screens/Text'
import Scan from './screens/Scan'
import Success from './screens/Success'
import History from './screens/History'
import Detail from './screens/Detail'
import { GoalDetail, Goals } from './screens/Goals'
import { Notifications, Premium, Profile, Subscriptions } from './screens/Account'
import { Phone, Processing, Setup, Welcome } from './screens/Onboarding'

function Protected({ children }: { children: React.ReactNode }) {
  const { state } = useStore()
  return state.profile.onboarded ? <>{children}</> : <Navigate to="/welcome" replace />
}

export default function App() {
  const app = (el: React.ReactNode) => <Protected>{el}</Protected>
  return (
    <div className="device">
      <div className="screen">
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding/phone" element={<Phone />} />
          <Route path="/onboarding/setup" element={<Setup />} />
          <Route path="/onboarding/processing" element={<Processing />} />

          <Route path="/" element={app(<Main />)} />
          <Route path="/analytics" element={app(<Analytics />)} />
          <Route path="/budget" element={app(<Budget />)} />
          <Route path="/advice" element={app(<Advice />)} />
          <Route path="/add/voice" element={app(<Voice />)} />
          <Route path="/add/text" element={app(<Text />)} />
          <Route path="/add/scan" element={app(<Scan />)} />
          <Route path="/saved" element={app(<Success />)} />
          <Route path="/history" element={app(<History />)} />
          <Route path="/tx/:id" element={app(<Detail />)} />
          <Route path="/goals" element={app(<Goals />)} />
          <Route path="/goals/:id" element={app(<GoalDetail />)} />
          <Route path="/profile" element={app(<Profile />)} />
          <Route path="/subscriptions" element={app(<Subscriptions />)} />
          <Route path="/notifications" element={app(<Notifications />)} />
          <Route path="/premium" element={app(<Premium />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
