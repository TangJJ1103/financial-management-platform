import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/themeProvider";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import HomePage from "./pages/Dashboard/HomePage";
import ProtectedRoute from "./globalFunction/ProtectedRoute";
import LoginPage from "./pages/Login&SignUp/LoginPage";
import AddPersonalExpenses from "./pages/Personal/AddPersonalExpenses";
import PersonalBudget from "./pages/Personal/PersonalBudget";
import PersonalGoals from "./pages/Personal/PersonalGoals";
import ViewPersonalExpenses from "./pages/Personal/ViewPersonalExpenses";
import AddFamilyExpenses from "./pages/Family/AddFamilyExpenses";
import FamilyBudget from "./pages/Family/FamilyBudget";
import FamilyGoals from "./pages/Family/FamilyGoals";
import FamilyManagement from "./pages/Family/FamilyManagement";
import FamilyMembers from "./pages/Family/FamilyMembers";
import FamilyInvitations from "./pages/Family/FamilyInvitations";
import CurrencyConverter from "./pages/Tool/CurrencyConverter";
import ViewFamilyExpenses from "./pages/Family/ViewFamilyExpenses";
import NoInternetPage from "./pages/NoInternet/NoInternetPage";
import "./globalFunction/axiosInterceptor";
// Add the import for the AccountManagement page
import AccountManagement from "./pages/Account";
// Import the NetworkStatusProvider
import NetworkStatusProvider from "./components/NetworkStatusProvider";
// Import the FamilyInvitationsProvider
import { FamilyInvitationsProvider } from "./components/family/FamilyInvitationsContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <NetworkStatusProvider>
          <FamilyInvitationsProvider>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/noInternet" element={<NoInternetPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Routes>
                        <Route path="/home" element={<HomePage />} />

                        {/* Personal Routes */}
                        <Route
                          path="/personal/addExpenses"
                          element={<AddPersonalExpenses />}
                        />
                        <Route
                          path="/personal/budget"
                          element={<PersonalBudget />}
                        />
                        <Route
                          path="/personal/goals"
                          element={<PersonalGoals />}
                        />
                        <Route
                          path="/personal/viewExpenses"
                          element={<ViewPersonalExpenses />}
                        />

                        {/* Family Routes */}
                        <Route
                          path="/family/addExpenses"
                          element={<AddFamilyExpenses />}
                        />
                        <Route
                          path="/family/budget"
                          element={<FamilyBudget />}
                        />
                        <Route path="/family/goals" element={<FamilyGoals />} />
                        <Route
                          path="/family/viewExpenses"
                          element={<ViewFamilyExpenses />}
                        />
                        <Route
                          path="/family/management"
                          element={<FamilyManagement />}
                        />
                        <Route
                          path="/family/members"
                          element={<FamilyMembers />}
                        />
                        <Route
                          path="/family/invitations"
                          element={<FamilyInvitations />}
                        />

                        <Route
                          path="/tools/currency-converter"
                          element={<CurrencyConverter />}
                        />
                        {/* Add the route for the account management page in the Routes component */}
                        <Route
                          path="/account"
                          element={<AccountManagement />}
                        />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </FamilyInvitationsProvider>
        </NetworkStatusProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
