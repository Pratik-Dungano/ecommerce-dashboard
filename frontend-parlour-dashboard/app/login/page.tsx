"use client"

import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Crown,
  UserCheck,
  Sparkles,
  Scissors,
  CalendarDays,
  Users2,
  DollarSign,
  Star,
  Phone,
  User,
} from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  })

  const [signupCredentials, setSignupCredentials] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const { login, signup } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(loginCredentials)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message || "Login failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (signupCredentials.password !== signupCredentials.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { name, email, phone, password } = signupCredentials;
      const result = await signup({ 
        name, 
        email, 
        phone, 
        password,
        role: 'employee' // Always set role to employee for signup
      });
      
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message || "Signup failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (role: "super_admin" | "admin" | "employee") => {
    if (role === "super_admin") {
      setLoginCredentials({
        email: "manager@parlour.com",
        password: "manager123",
      })
    } else if (role === "admin") {
      setLoginCredentials({
        email: "sarah.admin@parlour.com",
        password: "password123",
      })
    } else {
      setLoginCredentials({
        email: "emma.johnson@parlour.com",
        password: "password123",
      })
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Auth Forms */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-white dark:bg-slate-950 flex flex-col justify-between p-8 lg:p-12">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Parlour Pro</h1>
          </div>

          <div className="space-y-6 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Fill in your details to get started"}
            </p>
          </div>

          <Card className="bg-transparent border-none shadow-none">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLogin ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={loginCredentials.email}
                        onChange={(e) =>
                          setLoginCredentials({ ...loginCredentials, email: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginCredentials.password}
                        onChange={(e) =>
                          setLoginCredentials({ ...loginCredentials, password: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      <span>Sign in</span>
                    </div>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Demo Access</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => fillDemoCredentials("super_admin")}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-medium">Super Admin</span>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => fillDemoCredentials("admin")}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <UserCheck className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Admin</span>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => fillDemoCredentials("employee")}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <User className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Employee</span>
                    </div>
                  </Button>
                </div>
              </form>
            ) : (
              // Signup Form
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupCredentials.name}
                        onChange={(e) =>
                          setSignupCredentials({ ...signupCredentials, name: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        value={signupCredentials.email}
                        onChange={(e) =>
                          setSignupCredentials({ ...signupCredentials, email: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={signupCredentials.phone}
                        onChange={(e) =>
                          setSignupCredentials({ ...signupCredentials, phone: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signupCredentials.password}
                        onChange={(e) =>
                          setSignupCredentials({ ...signupCredentials, password: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signupCredentials.confirmPassword}
                        onChange={(e) =>
                          setSignupCredentials({ ...signupCredentials, confirmPassword: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Create Account</span>
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          By {isLogin ? "signing in" : "signing up"}, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] bg-gradient-to-br from-purple-600 via-purple-900 to-indigo-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z\' fill=\'rgba(255,255,255,0.07)\'/%3E%3C/svg%3E\')] opacity-10" />

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm mb-8">
              <Sparkles className="h-4 w-4 text-purple-200" />
              <span className="text-sm font-medium text-purple-200">
                {isLogin ? "Welcome Back to Parlour Pro" : "Join Parlour Pro Today"}
              </span>
            </div>

            <h2 className="text-4xl font-bold mb-4">Transform Your Beauty Business</h2>
            <p className="text-lg text-purple-200 mb-12 max-w-lg">
              Streamline operations, boost productivity, and enhance customer experience with our
              comprehensive salon management solution.
            </p>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Smart Scheduling</h3>
                    <p className="text-sm text-purple-200">
                      Effortlessly manage appointments and staff schedules
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Staff Management</h3>
                    <p className="text-sm text-purple-200">Track performance and manage your team efficiently</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Financial Tracking</h3>
                    <p className="text-sm text-purple-200">Monitor revenue and manage expenses easily</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Customer Experience</h3>
                    <p className="text-sm text-purple-200">Build loyalty with exceptional service</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold mb-1">2,000+</div>
                <div className="text-sm text-purple-200">Active Salons</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-sm text-purple-200">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-purple-200">Support Available</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-12 border-t border-white/10">
            <span className="text-sm text-purple-200">Trusted by leading beauty brands worldwide</span>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-20 bg-white/10 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
