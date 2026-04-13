import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css"; 

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="auth-container">
      <h2>Welcome !</h2>
      <p>Login Account</p>

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="USERNAME"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="PASSWORD"
          onChange={handleChange}
        />

        <button type="submit">LOGIN</button>
      </form>

      <p>
        Don't have account? <Link to="/signup">Register Here</Link>
      </p>
    </div>
  );
}

export default Login;