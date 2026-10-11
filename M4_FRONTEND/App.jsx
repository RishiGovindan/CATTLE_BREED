import {
  Route,
  Routes,
} from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CompareBar from './components/CompareBar'

import Home from './pages/Home'
import BreedDetails from './pages/BreedDetails'
import Compare from './pages/Compare'
import Recognition from './pages/Recognition'
import Marketplace from './pages/Marketplace'
import ListingDetails from './pages/ListingDetails'
import FarmerProfile from './pages/FarmerProfile'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import MyListings from './pages/MyListings'
import BuyerDashboard from './pages/BuyerDashboard'
import SavedListings from './pages/SavedListings'
import Login from './pages/Login'
import CompleteProfile from './pages/CompleteProfile'
import NotFound from './pages/NotFound'

import RequireAuth from './components/RequireAuth'
import RequireCompleteProfile from './components/RequireCompleteProfile'
import RequireRole from './components/RequireRole'

import {
  AuthProvider,
} from './context/AuthContext'

import {
  CompareProvider,
} from './context/CompareContext'

import useScrollToHash from './hooks/useScrollToHash'


function ScrollManager() {

  useScrollToHash()

  return null
}


export default function App() {

  return (

    <AuthProvider>

      <CompareProvider>

        <div className="app-shell">

          <ScrollManager />

          <Navbar />


          <main>

            <Routes>


              <Route
                path="/"
                element={
                  <Home />
                }
              />


              <Route
                path="/breeds/:breedId"
                element={
                  <BreedDetails />
                }
              />


              <Route
                path="/compare"
                element={
                  <Compare />
                }
              />


              <Route
                path="/recognition"
                element={
                  <Recognition />
                }
              />


              <Route
                path="/login"
                element={
                  <Login />
                }
              />


              <Route
                path="/complete-profile"
                element={
                  <RequireAuth>

                    <CompleteProfile />

                  </RequireAuth>
                }
              />


              <Route
                path="/account"
                element={
                  <RequireAuth>

                    <CompleteProfile />

                  </RequireAuth>
                }
              />


              <Route
                path="/marketplace"
                element={
                  <RequireCompleteProfile>

                    <Marketplace />

                  </RequireCompleteProfile>
                }
              />


              <Route
                path="/marketplace/:listingId"
                element={
                  <RequireCompleteProfile>

                    <ListingDetails />

                  </RequireCompleteProfile>
                }
              />


              <Route
                path="/farmers/:farmerId"
                element={
                  <FarmerProfile />
                }
              />


              <Route
                path="/create-listing"
                element={
                  <RequireCompleteProfile>

                    <RequireRole
                      role="seller"
                      redirectTo="/buyer-dashboard"
                    >

                      <CreateListing />

                    </RequireRole>

                  </RequireCompleteProfile>
                }
              />


              <Route
                path="/edit-listing/:listingId"
                element={
                  <RequireCompleteProfile>

                    <RequireRole
                      role="seller"
                      redirectTo="/buyer-dashboard"
                    >

                      <EditListing />

                    </RequireRole>

                  </RequireCompleteProfile>
                }
              />


              <Route
                path="/saved-listings"
                element={
                  <RequireRole
                    role="buyer"
                    redirectTo="/my-listings"
                    enforceMode
                  >

                    <SavedListings />

                  </RequireRole>
                }
              />


              <Route
                path="/my-listings"
                element={
                  <RequireRole
                    role="seller"
                    redirectTo="/buyer-dashboard"
                  >

                    <MyListings />

                  </RequireRole>
                }
              />


              <Route
                path="/buyer-dashboard"
                element={
                  <RequireRole
                    role="buyer"
                    redirectTo="/my-listings"
                  >

                    <BuyerDashboard />

                  </RequireRole>
                }
              />


              <Route
                path="*"
                element={
                  <NotFound />
                }
              />


            </Routes>

          </main>


          <Footer />

          <CompareBar />

        </div>

      </CompareProvider>

    </AuthProvider>
  )
}