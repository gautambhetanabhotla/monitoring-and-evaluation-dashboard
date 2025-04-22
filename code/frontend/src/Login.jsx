import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { AuthContext } from "./AuthContext.jsx"; // Adjust the import path as necessary

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setError("");

    const result = await login(email, password);
    
    if (result.success) {
      if (result.user.role === "admin") {
        navigate("/clients");
      } else {
        navigate("/projects");
      }
    } else {
      setError(result.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <Card className="w-full max-w-md p-8 bg-gray-800 shadow-2xl rounded-2xl border border-gray-700">
        <CardHeader className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h2>
        </CardHeader>

        <CardBody>
          <p className="text-gray-400 mb-4">Please log in to access your account.</p>
        </CardBody>

        <CardBody>
          {error && (
            <div className="mb-6 p-3 bg-red-900 text-red-200 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email here"
                className="w-full h-14 text-white placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password here"
                className="w-full h-12 text-white placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 duration-300"
            >
              Login
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
