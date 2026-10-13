import { useState, useEffect, useCallback } from "react";

import "./App.css";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;

const readUser = () => {

  try {

    return JSON.parse(localStorage.getItem("user")) || null;

  } catch {

    return null;

  }

};

function App() {

  const [token, setToken] = useState(

    () => localStorage.getItem("token") || ""

  );

  const [user, setUser] = useState(readUser);

  const [activeTab, setActiveTab] = useState("Dashboard");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showRegister, setShowRegister] = useState(false);

  const [registerForm, setRegisterForm] = useState({

    name: "",

    email: "",

    password: "",

    department: "AI",

    year: "2",

  });

  const [circulars, setCirculars] = useState([]);

  const [actions, setActions] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [adminDashboard, setAdminDashboard] = useState(null);

  const [myRegistrations, setMyRegistrations] = useState([]);
const [circularForm, setCircularForm] = useState({

    title: "",

    content: "",

    targetDepartment: "AI",

    targetYears: [3],

    requiredAction: "",

    deadline: "",

    requiredDocuments: "",

    status: "PUBLISHED",

  });

  const logout = useCallback(() => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setToken("");

    setUser(null);

    setCirculars([]);

    setActions([]);

    setNotifications([]);

    setActiveTab("Dashboard");

    setError("");

    setSuccess("");

  }, []);

  const apiRequest = useCallback(

    async (path, options = {}) => {

      const currentToken = localStorage.getItem("token") || token;

      const response = await fetch(`${API}${path}`, {

        ...options,

        headers: {

          "Content-Type": "application/json",

          ...(currentToken

            ? { Authorization: `Bearer ${currentToken}` }

            : {}),

          ...options.headers,

        },

      });

      const text = await response.text();

      let data = null;

      if (text) {

        try {

          data = JSON.parse(text);

        } catch {

          data = text;

        }

      }

      if (response.status === 401) {

        logout();

        throw new Error("Your session has expired or the token is invalid. Please log in again.");

      }

      if (!response.ok) {

        throw new Error(

          data?.detail ||

          data?.message ||

          data?.error ||

          (typeof data === "string" ? data : "") ||

          `Request failed (${response.status})`

        );

      }

      return data;

    },

    [token, logout]

  );

  const fetchCirculars = useCallback(async () => {

    const data = await apiRequest("/circulars");

    setCirculars(Array.isArray(data) ? data : []);

  }, [apiRequest]);

  const fetchActions = useCallback(async () => {

    if (!user?.id) return;

    const data = await apiRequest(`/actions/student/${user.id}`);

    setActions(Array.isArray(data) ? data : []);

  }, [apiRequest, user]);

  const fetchNotifications = useCallback(async () => {

    if (!user?.id) return;

    const data = await apiRequest(`/notifications/user/${user.id}`);

    setNotifications(Array.isArray(data) ? data : []);

  }, [apiRequest, user]);

  const fetchAdminDashboard = useCallback(async () => {

    const data = await apiRequest("/admin/dashboard");

    setAdminDashboard(data || null);

  }, [apiRequest]);

  const fetchMyRegistrations = useCallback(async () => {

    const data = await apiRequest("/event-registrations/my");

    setMyRegistrations(Array.isArray(data) ? data : []);

  }, [apiRequest]);

  async function handleEventRegister(circularId) {

    setError("");

    setSuccess("");

    setLoading(true);

    try {

      await apiRequest(`/event-registrations/${circularId}`, { method: "POST" });

      setSuccess("You have registered for this event successfully.");

      await fetchMyRegistrations();

      if (user?.role?.toUpperCase() === "ADMIN") {

        await fetchAdminDashboard();

      }

    } catch (err) {

      setError(err.message || "Unable to register for this event.");

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    if (!token || !user) return;

    let cancelled = false;

    async function loadData() {

      setLoading(true);

      setError("");

      try {

        if (activeTab === "Dashboard" || activeTab === "Circulars") {

          await fetchCirculars();

        }

        if (activeTab === "Dashboard" || activeTab === "My Actions") {

          await fetchActions();

        }

        if (activeTab === "Dashboard" || activeTab === "Notifications") {

          await fetchNotifications();

        }

        if (activeTab === "Dashboard" || activeTab === "Circulars") {

          await fetchMyRegistrations();

        }

        if (activeTab === "Admin Dashboard" && user?.role?.toUpperCase() === "ADMIN") {

          await fetchAdminDashboard();

        }

      } catch (err) {

        if (!cancelled) setError(err.message);

      } finally {

        if (!cancelled) setLoading(false);

      }

    }

    loadData();

    return () => {

      cancelled = true;

    };

  }, [

    token,

    user,

    activeTab,

    fetchCirculars,

    fetchActions,

    fetchNotifications,

    fetchAdminDashboard,

    fetchMyRegistrations,

  ]);

  async function handleLogin(event) {

    event.preventDefault();

    setError("");

    setSuccess("");

    setLoading(true);

    try {

      const response = await fetch(`${API}/auth/login`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, password }),

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(

          data?.detail ||

          data?.message ||

          data?.error ||

          "Login failed. Check your email and password."

        );

      }

      if (!data.token) {

        throw new Error("Login succeeded but no JWT token was returned.");

      }

      const savedUser = {

        id: data.id,

        name: data.name,

        email: data.email,

        role: data.role,

      };

      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(savedUser));

      setToken(data.token);

      setUser(savedUser);

      setActiveTab("Dashboard");

      setSuccess("Login successful!");

    } catch (err) {

      setError(err.message || "Unable to connect to the backend.");

    } finally {

      setLoading(false);

    }

  }

  async function handleRegister(event) {

    event.preventDefault();

    setError("");

    setSuccess("");

    setLoading(true);

    try {

      const response = await fetch(`${API}/auth/register`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          name: registerForm.name.trim(),

          email: registerForm.email.trim(),

          password: registerForm.password,

          department: registerForm.department.trim(),

          year: Number(registerForm.year),

        }),

      });

      const responseText = await response.text();

      let data = null;

      if (responseText) {

        try {

          data = JSON.parse(responseText);

        } catch {

          data = responseText;

        }

      }

      if (!response.ok) {

        throw new Error(

          data?.message || data?.error || data?.detail ||

          (typeof data === "string" ? data : `Registration failed (${response.status}).`)

        );

      }

      setEmail(registerForm.email.trim());

      setPassword("");

      setRegisterForm({

        name: "",

        email: "",

        password: "",

        department: "AI",

        year: "2",

      });

      setShowRegister(false);

      setSuccess("Account created successfully. Please log in with your new email and password.");

    } catch (err) {

      setError(err.message || "Unable to connect to the backend.");

    } finally {

      setLoading(false);

    }

  }


  async function createCircular(event) {

    event.preventDefault();

    setError("");

    setSuccess("");

    try {

      const selectedYears = circularForm.targetYears;

      if (!selectedYears.length) {

        throw new Error("Please select at least one target year.");

      }

      const payload = {

        ...circularForm,

        targetYears: selectedYears.join(","),

        // Keep targetYear for compatibility with older backend code.

        targetYear: Number(selectedYears[0]),

        deadline: circularForm.deadline || null,

      };

      await apiRequest("/circulars", {

        method: "POST",

        body: JSON.stringify(payload),

      });

      setSuccess("Circular created successfully.");

      setCircularForm({

        title: "",

        content: "",

        targetDepartment: "AI",

        targetYears: [3],

        requiredAction: "",

        deadline: "",

        requiredDocuments: "",

        status: "PUBLISHED",

      });

      await fetchCirculars();

    } catch (err) {

      setError(err.message);

    }

  }

  async function completeAction(id) {

    setError("");

    setSuccess("");

    try {

      await apiRequest(`/actions/${id}/complete`, {

        method: "PATCH",

      });

      setSuccess("Action marked as complete.");

      await fetchActions();

    } catch (err) {

      setError(err.message);

    }

  }

  async function markNotificationRead(id) {

    setError("");

    try {

      await apiRequest(`/notifications/${id}/read`, {

        method: "PATCH",

      });

      await fetchNotifications();

    } catch (err) {

      setError(err.message);

    }

  }

  const navItems = [

    { name: "Dashboard", icon: "⌂" },

    { name: "Circulars", icon: "▤" },

    { name: "My Actions", icon: "✓" },

    { name: "Notifications", icon: "♧" },

    { name: "Profile", icon: "♙" },

    ...(user?.role?.toUpperCase() === "ADMIN"

      ? [{ name: "Admin Dashboard", icon: "▦" }]

      : []),

  ];

  if (!token || !user) {

    return (

      <div className="login-page">

        <div className="login-card">

          <div className="brand-mark">CA</div>

          <h1>Campus Action</h1>

          <p className="muted">

            Your campus circulars, organized into actions.

          </p>

          {error && <div className="alert error">{error}</div>}

          {success && <div className="alert success">{success}</div>}

          {showRegister ? (

            <>

              <h2>Create student account</h2>

              <form onSubmit={handleRegister} className="login-form">

                <label htmlFor="register-name">Full name</label>

                <input

                  id="register-name"

                  value={registerForm.name}

                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}

                  placeholder="Enter your full name"

                  required

                />

                <label htmlFor="register-email">Email address</label>

                <input

                  id="register-email"

                  type="email"

                  value={registerForm.email}

                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}

                  placeholder="Enter your email"

                  required

                />

                <label htmlFor="register-password">Password</label>

                <input

                  id="register-password"

                  type="password"

                  minLength={6}

                  value={registerForm.password}

                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}

                  placeholder="Create a password (at least 6 characters)"

                  required

                />

                <label htmlFor="register-department">Department</label>

                <input

                  id="register-department"

                  value={registerForm.department}

                  onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}

                  placeholder="e.g. AI"

                  required

                />

                <label htmlFor="register-year">Academic year</label>

                <select

                  id="register-year"

                  value={registerForm.year}

                  onChange={(e) => setRegisterForm({ ...registerForm, year: e.target.value })}

                  required

                >

                  {[1, 2, 3, 4].map((year) => (

                    <option key={year} value={year}>Year {year}</option>

                  ))}

                </select>

                <button className="primary-btn full-width" disabled={loading}>

                  {loading ? "Creating account..." : "Create account"}

                </button>

              </form>

              <p className="muted small-text">

                Already have an account?{" "}

                <button type="button" className="text-btn" onClick={() => { setShowRegister(false); setError(""); setSuccess(""); }}>

                  Login

                </button>

              </p>

            </>

          ) : (

            <>

              <form onSubmit={handleLogin} className="login-form">

                <label htmlFor="email">Email address</label>

                <input

                  id="email"

                  type="email"

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                  placeholder="Enter your registered email"

                  required

                />

                <label htmlFor="password">Password</label>

                <input

                  id="password"

                  type="password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  placeholder="Enter your password"

                  required

                />

                <button className="primary-btn full-width" disabled={loading}>

                  {loading ? "Logging in..." : "Login"}

                </button>

              </form>

              <p className="muted small-text">

                New to Campus Action?{" "}

                <button type="button" className="text-btn" onClick={() => { setShowRegister(true); setError(""); setSuccess(""); }}>

                  Sign up / Create account

                </button>

              </p>

            </>

          )}

        </div>

      </div>

    );

  }

  return (

    <div className="app">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">CA</div>

          <div>

            <strong>Campus Action</strong>

            <small>Student Portal</small>

          </div>

        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>

          {navItems.map((item) => (

            <button

              key={item.name}

              className={`nav-item ${

                activeTab === item.name ? "active" : ""

              }`}

              onClick={() => {

                setActiveTab(item.name);

                setError("");

                setSuccess("");

              }}

            >

              <span className="nav-icon">{item.icon}</span>

              {item.name}

              {item.name === "Notifications" &&

                notifications.filter((n) => !n.read).length > 0 && (

                  <span className="nav-count">

                    {notifications.filter((n) => !n.read).length}

                  </span>

                )}

            </button>

          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="avatar">

              {(user.name || user.email || "S").charAt(0).toUpperCase()}

            </div>

            <div className="user-mini-info">

              <strong>{user.name || "Student"}</strong>

              <small>{user.role || "STUDENT"}</small>

            </div>

          </div>

          <button className="logout-btn" onClick={logout}>

            ↪ Log out

          </button>

        </div>

      </aside>

      <main className="main">

        <header className="topbar">

          <div>

            <span className="breadcrumb">Workspace / </span>

            <strong>{activeTab}</strong>

          </div>

          <div className="topbar-user">

            <span className="status-dot" />

            Signed in as {user.name || user.email}

          </div>

        </header>

        <div className="page-content">

          {error && (

            <div className="alert error">

              {error}

              {error.toLowerCase().includes("token") && (

                <button onClick={logout}>Log in again</button>

              )}

            </div>

          )}

          {success && <div className="alert success">{success}</div>}

          {loading && (

            <div className="loading-line">Loading data from server...</div>

          )}

          {activeTab === "Dashboard" && (

            <>

              <section className="welcome-section">

                <div>

                  <p className="eyebrow">STUDENT WORKSPACE</p>

                  <h1>Welcome back, {user.name || "Student"}!</h1>

                  <p className="muted">

                    Here is your campus activity at a glance.

                  </p>

                </div>

                <button

                  className="primary-btn"

                  onClick={() => setActiveTab("Circulars")}

                >

                  View circulars →

                </button>

              </section>

              <section className="stats-grid">

                <StatCard

                  label="Total Circulars"

                  value={circulars.length}

                  icon="▤"

                  color="purple"

                />

                <StatCard

                  label="My Actions"

                  value={actions.length}

                  icon="✓"

                  color="blue"

                />

                <StatCard

                  label="Notifications"

                  value={notifications.length}

                  icon="♧"

                  color="orange"

                />

                <StatCard

                  label="Completed Actions"

                  value={

                    actions.filter(

                      (a) => a.status === "COMPLETED" || a.completed

                    ).length

                  }

                  icon="★"

                  color="green"

                />

              </section>

              <section className="panel">

                <div className="panel-heading">

                  <div>

                    <h2>Recent Circulars</h2>

                    <p className="muted">

                      The latest updates available from your campus.

                    </p>

                  </div>

                  <button

                    className="text-btn"

                    onClick={() => setActiveTab("Circulars")}

                  >

                    View all →

                  </button>

                </div>

                {circulars.length === 0 ? (

                  <EmptyState message="No circulars available yet." />

                ) : (

                  <div className="circular-list">

                    {circulars.slice(0, 4).map((item) => (

                      <CircularCard

                        key={item.id}

                        item={item}

                        canRegister={user?.role?.toUpperCase() === "STUDENT"}

                        isRegistered={myRegistrations.some((registration) => registration.eventId === item.id)}

                        onRegister={handleEventRegister}

                        registering={loading}

                      />

                    ))}

                  </div>

                )}

              </section>

            </>

          )}

          {activeTab === "Circulars" && (

            <>

              <PageHeading

                title="Campus Circulars"

                subtitle="View announcements and create circulars when permitted."

              />

              {user?.role?.toUpperCase() === "ADMIN" && (

                <form className="panel" onSubmit={createCircular}>

                <h3>Create a circular</h3>

                <p className="muted small-text">

                  This requires the backend to allow your user to create

                  circulars.

                </p>

                <div className="form-grid">

                  <label>

                    Title

                    <input

                      required

                      value={circularForm.title}

                      onChange={(e) =>

                        setCircularForm({

                          ...circularForm,

                          title: e.target.value,

                        })

                      }

                      placeholder="e.g. Technical Event Registration"

                    />

                  </label>

                  <label>

                    Target department

                    <input

                      required

                      value={circularForm.targetDepartment}

                      onChange={(e) =>

                        setCircularForm({

                          ...circularForm,

                          targetDepartment: e.target.value,

                        })

                      }

                      placeholder="AI"

                    />

                  </label>

                  <fieldset className="year-selection">

                    <legend>Target academic years</legend>

                    <p className="muted small-text">

                      Select every year that should receive this circular.

                    </p>

                    <div className="year-checkboxes">

                      {[1, 2, 3, 4].map((year) => (

                        <label key={year} className="year-checkbox">

                          <input

                            type="checkbox"

                            checked={circularForm.targetYears.includes(year)}

                            onChange={(e) => {

                              const selected = e.target.checked

                                ? [...circularForm.targetYears, year]

                                : circularForm.targetYears.filter(

                                    (selectedYear) => selectedYear !== year

                                  );

                              setCircularForm({

                                ...circularForm,

                                targetYears: selected.sort((a, b) => a - b),

                              });

                            }}

                          />

                          Year {year}

                        </label>

                      ))}

                    </div>

                  </fieldset>

                  <label>

                    Deadline

                    <input

                      type="date"

                      value={circularForm.deadline}

                      onChange={(e) =>

                        setCircularForm({

                          ...circularForm,

                          deadline: e.target.value,

                        })

                      }

                    />

                  </label>

                  <label className="full-span">

                    Description

                    <textarea

                      required

                      value={circularForm.content}

                      onChange={(e) =>

                        setCircularForm({

                          ...circularForm,

                          content: e.target.value,

                        })

                      }

                      placeholder="Enter circular details"

                    />

                  </label>

                  <label>

                    Required action

                    <input

                      required

                      value={circularForm.requiredAction}

                      onChange={(e) =>

                        setCircularForm({

                          ...circularForm,

                          requiredAction: e.target.value,

                        })

                      }

                      placeholder="e.g. Register online"

                    />

                  </label>

                  <label>

                    Required documents

                    <input

                      value={circularForm.requiredDocuments}

                      onChange={(e) =>

                        setCircularForm({

                          ...circularForm,

                          requiredDocuments: e.target.value,

                        })

                      }

                      placeholder="e.g. Student ID"

                    />

                  </label>

                </div>

            <button className="primary-btn" type="submit" disabled={loading}>

                  Create circular

                </button>

              </form>

              )}

              <section className="panel">

                <div className="panel-heading">

                  <div>

                    <h2>All Circulars</h2>

                    <p className="muted">

                      {circulars.length} circular(s) retrieved from the server

                    </p>

                  </div>

                  <button

                    className="secondary-btn"

                    onClick={() =>

                      fetchCirculars().catch((e) => setError(e.message))

                    }

                  >

                    Refresh

                  </button>

                </div>

                {circulars.length === 0 ? (

                  <EmptyState message="No circulars found." />

                ) : (

                  <div className="circular-list">

                    {circulars.map((item) => (

                      <CircularCard

                        key={item.id}

                        item={item}

                        canRegister={user?.role?.toUpperCase() === "STUDENT"}

                        isRegistered={myRegistrations.some((registration) => registration.eventId === item.id)}

                        onRegister={handleEventRegister}

                        registering={loading}

                      />

                    ))}

                  </div>

                )}

              </section>

            </>

          )}

          {activeTab === "My Actions" && (

            <>

              <PageHeading

                title="My Actions"

                subtitle="Track and complete tasks assigned to you."

              />

              <section className="panel">

                {actions.length === 0 ? (

                  <EmptyState message="No actions found for your account." />

                ) : (

                  <div className="data-list">

                    {actions.map((action) => {

                      const done =

                        action.status === "COMPLETED" || action.completed;

                      return (

                        <div className="data-row" key={action.id}>

                          <div className="data-row-main">

                            <h3>{action.title || action.action || "Student task"}</h3>

                            <p className="muted">

                              {action.description ||

                                action.content ||

                                "Review the details and complete this task."}

                            </p>

                            <StatusBadge status={action.status || "PENDING"} />

                          </div>

                          {!done && (

                            <button

                              className="secondary-btn"

                              onClick={() => completeAction(action.id)}

                            >

                              Mark complete

                            </button>

                          )}

                        </div>

                      );

                    })}

                  </div>

                )}

              </section>

            </>

          )}

          {activeTab === "Notifications" && (

            <>

              <PageHeading

                title="Notifications"

                subtitle="Important updates and reminders for you."

              />

              <section className="panel">

                {notifications.length === 0 ? (

                  <EmptyState message="You have no notifications." />

                ) : (

                  <div className="data-list">

                    {notifications.map((notification) => (

                      <div className="data-row" key={notification.id}>

                        <div className="data-row-main">

                          <h3>

                            {notification.title || "Campus notification"}

                          </h3>

                          <p className="muted">

                            {notification.message ||

                              notification.content ||

                              "You have a new campus update."}

                          </p>

                          <StatusBadge

                            status={

                              notification.read ? "READ" : "UNREAD"

                            }

                          />

                        </div>

                        {!notification.read && (

                          <button

                            className="secondary-btn"

                            onClick={() =>

                              markNotificationRead(notification.id)

                            }

                          >

                            Mark as read

                          </button>

                        )}

                      </div>

                    ))}

                  </div>

                )}

              </section>

            </>

          )}

          {activeTab === "Admin Dashboard" && user?.role?.toUpperCase() === "ADMIN" && (

            <>

              <PageHeading

                title="Admin Dashboard"

                subtitle="Monitor student accounts and actual event registrations."

              />

              <section className="stats-grid">

                <StatCard label="Student Accounts" value={adminDashboard?.totalStudents ?? "—"} icon="♙" color="purple" />

                <StatCard label="Event Registrations" value={adminDashboard?.totalEventRegistrations ?? "—"} icon="✓" color="blue" />

                <StatCard label="Students Registered for Events" value={adminDashboard?.uniqueRegisteredStudents ?? "—"} icon="★" color="green" />

              </section>

              <section className="panel">

                <div className="panel-heading">

                  <div>

                    <h2>Event-wise Registrations</h2>

                    <p className="muted">Counts include only records in the event registrations table.</p>

                  </div>

                  <button className="secondary-btn" onClick={() => fetchAdminDashboard().catch((err) => setError(err.message))}>Refresh</button>

                </div>

                {!adminDashboard?.eventCounts?.length ? (

                  <EmptyState message="No event registrations yet. Students' account creation alone does not count as event registration." />

                ) : (

                  <div className="admin-table-wrap">

                    <table className="admin-table">

                      <thead><tr><th>Event</th><th>Event ID</th><th>Registrations</th></tr></thead>

                      <tbody>

                        {adminDashboard.eventCounts.map((event) => (

                          <tr key={event.eventId}>

                            <td>{event.eventTitle}</td><td>{event.eventId}</td><td>{event.registrationCount}</td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>

              <section className="panel">

                <div className="panel-heading">

                  <div>

                    <h2>Registered Students</h2>

                    <p className="muted">Each row represents one student's registration for one event.</p>

                  </div>

                </div>

                {!adminDashboard?.registrations?.length ? (

                  <EmptyState message="No students have registered for events yet." />

                ) : (

                  <div className="admin-table-wrap">

                    <table className="admin-table">

                      <thead><tr><th>Student Name</th><th>Email</th><th>Department</th><th>Year</th><th>Role</th><th>Event</th><th>Registered At</th></tr></thead>

                      <tbody>

                        {adminDashboard.registrations.map((registration) => (

                          <tr key={registration.registrationId}>

                            <td>{registration.studentName}</td>

                            <td>{registration.email}</td>

                            <td>{registration.department || "—"}</td>

                            <td>{registration.year ?? "—"}</td>

                            <td>{registration.role}</td>

                            <td>{registration.eventTitle}</td>

                            <td>{registration.registeredAt ? new Date(registration.registeredAt).toLocaleString() : "—"}</td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>

            </>

          )}

          {activeTab === "Profile" && (

            <>

              <PageHeading

                title="My Profile"

                subtitle="Your account information."

              />

              <section className="panel profile-panel">

                <div className="profile-avatar">

                  {(user.name || user.email || "S")

                    .charAt(0)

                    .toUpperCase()}

                </div>

                <h2>{user.name || "Student"}</h2>

                <p className="muted">{user.email}</p>

                <div className="profile-details">

                  <div>

                    <span>Student ID</span>

                    <strong>{user.id ?? "Not provided"}</strong>

                  </div>

                  <div>

                    <span>Role</span>

                    <strong>{user.role || "STUDENT"}</strong>

                  </div>

                  <div>

                    <span>Session</span>

                    <strong>JWT authenticated</strong>

                  </div>

                </div>

                <button className="secondary-btn" onClick={logout}>

                  Log out

                </button>

              </section>

            </>

          )}

        </div>

      </main>

    </div>

  );

}

function StatCard({ label, value, icon, color }) {

  return (

    <div className="stat-card">

      <div className={`stat-icon ${color}`}>{icon}</div>

      <div>

        <p className="muted">{label}</p>

        <h2>{value}</h2>

      </div>

    </div>

  );

}

function PageHeading({ title, subtitle }) {

  return (

    <section className="page-heading">

      <p className="eyebrow">CAMPUS ACTION</p>

      <h1>{title}</h1>

      <p className="muted">{subtitle}</p>

    </section>

  );

}

function CircularCard({ item, canRegister = false, isRegistered = false, onRegister, registering = false }) {

  return (

    <article className="circular-card">

      <div className="circular-card-top">

        <span className="circular-symbol">▤</span>

        <StatusBadge status={item.status || "PUBLISHED"} />

      </div>

      <h3>{item.title || "Untitled circular"}</h3>

      <p className="circular-description">

        {item.content || "No description provided."}

      </p>

      <div className="circular-meta">

        {item.targetDepartment && (

          <span>Department: {item.targetDepartment}</span>

        )}

        {(item.targetYears || item.targetYear) && (

            <span>

              Years: {item.targetYears || item.targetYear}

            </span>

          )}

        {item.deadline && <span>Deadline: {item.deadline}</span>}

      </div>

      {item.requiredAction && (

        <p className="action-hint">

          <strong>Required action:</strong> {item.requiredAction}

        </p>

      )}

      {item.requiredDocuments && (

        <p className="muted small-text">

          <strong>Documents:</strong> {item.requiredDocuments}

        </p>

      )}

      {canRegister && String(item.status || "PUBLISHED").toUpperCase() === "PUBLISHED" && (

        <button

          type="button"

          className={isRegistered ? "secondary-btn" : "primary-btn"}

          disabled={isRegistered || registering}

          onClick={() => onRegister?.(item.id)}

        >

          {isRegistered ? "Registered" : registering ? "Registering..." : "Register for event"}

        </button>

      )}

    </article>

  );

}

function StatusBadge({ status }) {

  const normalized = String(status || "PENDING").toUpperCase();

  const className =

    normalized === "COMPLETED" ||

    normalized === "PUBLISHED" ||

    normalized === "READ"

      ? "status-badge status-good"

      : normalized === "HIGH" || normalized === "OVERDUE"

      ? "status-badge status-warning"

      : "status-badge";

  return <span className={className}>{normalized}</span>;

}

function EmptyState({ message }) {

  return (

    <div className="empty-state">

      <div className="empty-icon">▤</div>

      <p>{message}</p>

    </div>

  );

}

export default App;
