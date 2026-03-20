import { AppHeader } from '../components/layout/AppHeader'
import { AppFooter } from '../components/layout/AppFooter'
import { HomeScreen } from '../screens/HomeScreen'
import { PlannerScreen } from '../screens/PlannerScreen'
import { DashboardScreen } from '../screens/DashboardScreen'

export function AppShell() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main>
        <HomeScreen />
        <PlannerScreen />
        <DashboardScreen />
      </main>
      <AppFooter />
    </div>
  )
}
