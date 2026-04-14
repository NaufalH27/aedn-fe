import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css"; 

function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmationPassword: "",
    fullName: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup data:", form);
  };

  return (
    <div className="signup-wrapper">
      <div className="auth-container">
        <h2>Sign Up</h2>
        <p className="title">Sign Up To Account</p>

        <form onSubmit={handleSubmit}>
          <input name="fullName" placeholder="FULL NAME" onChange={handleChange} />
          <input name="username" placeholder="USERNAME" onChange={handleChange} />
          <input name="email" placeholder="EMAIL" onChange={handleChange} />
          <input name="password" type="password" placeholder="PASSWORD" onChange={handleChange} />
           <input name="confirmationPassword" type="password" placeholder="CONFIRM PASSWORD" onChange={handleChange} />

          <button type="submit">SIGN UP</button>
        </form>

        <p>
          Already have account? <Link to="/login">Login Here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;