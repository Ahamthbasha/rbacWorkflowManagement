// pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Shield, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Lock,
  BarChart3,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Star,
} from 'lucide-react';
import type { RootState } from '../../../redux/store';
import Header from '../../../layout/commonLayout/Header';
import Footer from '../../../layout/commonLayout/Footer';

const LandingPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const isLoggedIn = !!user.userId;

  const features = [
    {
      icon: Shield,
      title: 'Role-Based Access Control',
      description: 'Granular access control with User, Manager, and Admin roles. Each role has specific permissions and access levels.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FileText,
      title: 'Workflow Management',
      description: 'Create, track, and manage workflow requests with real-time status updates and notifications.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Clock,
      title: 'Approval Process',
      description: 'Streamlined approval workflow with manager review, admin closure, and automatic notifications.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless collaboration between users, managers, and administrators with transparent communication.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and reports to track request trends, approval rates, and performance metrics.',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Lock,
      title: 'Secure Authentication',
      description: 'JWT-based authentication with secure cookies, token refresh, and role-based authorization.',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const workflowSteps = [
    {
      step: '1',
      title: 'Submit Request',
      description: 'User creates a new workflow request with details and priority level',
      icon: FileText,
    },
    {
      step: '2',
      title: 'Manager Review',
      description: 'Manager reviews, approves, rejects, or requests clarification',
      icon: Users,
    },
    {
      step: '3',
      title: 'Admin Closure',
      description: 'Admin closes approved requests or reopens if needed',
      icon: CheckCircle,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'IT Manager',
      content: 'This system has transformed how we handle internal requests. The role-based access is perfect for our organization.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'System Administrator',
      content: 'The workflow automation saves us hours every week. Highly recommended for any organization!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Director',
      content: 'Excellent platform for managing approvals and tracking requests. The interface is intuitive and efficient.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime', icon: TrendingUp },
    { value: '10K+', label: 'Requests Processed', icon: CheckCircle },
    { value: '500+', label: 'Happy Users', icon: Users },
    { value: '24/7', label: 'Support', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Introducing RBA Workflow 2.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Intelligent{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Workflow Management
              </span>
              <br />
              with RBAC
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              Streamline your business processes with our powerful role-based access control system. 
              Manage requests, approvals, and workflows seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Get Started Free
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Workflows
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to manage, track, and optimize your business processes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 hover:scale-105"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Workflow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              From submission to completion - track every step of the way
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((step) => (
              <div key={step.step} className="text-center relative">
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Start Your First Workflow
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Trusted by organizations worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Streamline Your Workflows?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of organizations using RBA Workflow to manage their processes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;