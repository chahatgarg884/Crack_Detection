// components/CrackDetectionApp.tsx
import React, { useState, useEffect } from 'react';
import {
    User,
    Upload,
    History,
    LogOut,
    Menu,
    X,
    Shield,
    Zap,
    Users,
    Mail,
    Phone,
    MapPin,
    FileText,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';

// API Client for real backend communication
class ApiClient {
    private baseURL = '/api';
    private token: string | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    }

    async login(email: string, password: string) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    }

    async signup(name: string, email: string, password: string) {
        const data = await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });

        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    }

    async uploadImage(file: File) {
        const formData = new FormData();
        formData.append('image', file);

        const headers: Record<string, string> = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    }

    async saveReport(reportData: any) {
        return this.request('/reports', {
            method: 'POST',
            body: JSON.stringify(reportData),
        });
    }

    async getReports() {
        return this.request('/reports');
    }
}
// Types
interface CrackReport {
    id: number;
    filename: string;
    upload_date: string;
    length_mm: number;
    width_mm: number;
    depth_mm: number;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    recommendation: string;
    image_path: string;
}

interface UserType {
    id: number;
    email: string;
    name: string;
}

// Authentication hook with real API
const useAuth = () => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiClient = new ApiClient();

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // You could validate the token here with a /api/auth/verify endpoint
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        }
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.login(email, password);
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            return { success: true };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.signup(name, email, password);
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            return { success: true };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed');
            return { success: false, error: err instanceof Error ? err.message : 'Signup failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        apiClient.clearToken();
        localStorage.removeItem('user');
    };

    return { user, login, signup, logout, isLoading, error };
};

// Components
const HomePage = ({ onShowLogin, onShowSignup }: { onShowLogin: () => void; onShowSignup: () => void }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-indigo-600 mr-2" />
                            <span className="text-xl font-bold text-gray-900">CrackDetect Pro</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onShowLogin}
                                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={onShowSignup}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Advanced Crack Detection
                            <span className="text-indigo-600 block">& Analysis</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Upload images of structural cracks and get instant AI-powered analysis with detailed reports including dimensions, depth measurements, and severity assessments.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onShowSignup}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                            >
                                Get Started Free
                            </button>
                            <button className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CrackDetect Pro?</h2>
                        <p className="text-lg text-gray-600">Advanced AI technology meets construction expertise</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <Zap className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Instant Analysis</h3>
                            <p className="text-gray-600">Get detailed crack analysis reports in seconds with AI-powered image processing</p>
                        </div>
                        <div className="text-center p-6">
                            <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Accurate Measurements</h3>
                            <p className="text-gray-600">Precise dimension and depth calculations using advanced computer vision</p>
                        </div>
                        <div className="text-center p-6">
                            <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Expert Recommendations</h3>
                            <p className="text-gray-600">Receive professional repair recommendations based on severity analysis</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Us Section */}
            <div id="about" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">About CrackDetect Pro</h2>
                            <p className="text-lg text-gray-600 mb-6">
                                We're a team of engineers and AI specialists dedicated to revolutionizing structural inspection through cutting-edge technology. Our platform combines decades of construction expertise with state-of-the-art machine learning to provide accurate, reliable crack detection and analysis.
                            </p>
                            <p className="text-lg text-gray-600 mb-6">
                                Founded in 2024, we've helped thousands of professionals identify and assess structural issues early, preventing costly repairs and ensuring safety compliance across various industries.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-white rounded-lg shadow">
                                    <div className="text-2xl font-bold text-indigo-600">50K+</div>
                                    <div className="text-gray-600">Images Analyzed</div>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow">
                                    <div className="text-2xl font-bold text-indigo-600">99.2%</div>
                                    <div className="text-gray-600">Accuracy Rate</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-indigo-100 rounded-lg p-8 text-center">
                            <Shield className="h-24 w-24 text-indigo-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
                            <p className="text-gray-600">
                                To make structural inspection accessible, accurate, and efficient for professionals worldwide through innovative AI technology.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Us Section */}
            <div id="contact" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
                        <p className="text-lg text-gray-600">Have questions? We're here to help you get started</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="h-5 w-5 text-indigo-600 mr-3" />
                                    <span>support@crackdetectpro.com</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-5 w-5 text-indigo-600 mr-3" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 text-indigo-600 mr-3" />
                                    <span>123 Tech Street, San Francisco, CA 94105</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="How can we help you?"
                                    />
                                </div>
                                <button
                                    onClick={() => alert('Message sent! We\'ll get back to you soon.')}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-indigo-400 mr-2" />
                        <span className="text-xl font-bold">CrackDetect Pro</span>
                    </div>
                    <p className="text-gray-400">© 2025 CrackDetect Pro. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const AuthModal = ({
    isOpen,
    onClose,
    mode,
    onLogin,
    onSignup,
    isLoading,
    error
}: {
    isOpen: boolean;
    onClose: () => void;
    mode: 'login' | 'signup';
    onLogin: (email: string, password: string) => Promise<any>;
    onSignup: (name: string, email: string, password: string) => Promise<any>;
    isLoading: boolean;
    error: string | null;
}) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLocalError(null);

        if (!formData.email || !formData.password) {
            setLocalError('Email and password are required');
            return;
        }

        if (mode === 'signup' && !formData.name) {
            setLocalError('Name is required');
            return;
        }

        try {
            let result;
            if (mode === 'login') {
                result = await onLogin(formData.email, formData.password);
            } else {
                result = await onSignup(formData.name, formData.email, formData.password);
            }

            if (result.success) {
                onClose();
                setFormData({ name: '', email: '', password: '' });
            } else {
                setLocalError(result.error || 'Authentication failed');
            }
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Authentication failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {(error || localError) && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error || localError}
                    </div>
                )}

                <div className="space-y-4">
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Your name"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Password"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 px-4 rounded-md transition-colors"
                    >
                        {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }: { user: UserType; onLogout: () => void }) => {
    const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [reports, setReports] = useState<CrackReport[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<CrackReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiClient = new ApiClient();

    // Load reports on mount and when switching to history tab
    useEffect(() => {
        if (activeTab === 'history') {
            loadReports();
        }
    }, [activeTab]);

    const loadReports = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.getReports();
            setReports(response.reports);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setAnalysisResult(null);
        }
    };

    const analyzeCrack = async () => {
        if (!selectedFile) return;

        setAnalyzing(true);
        setError(null);

        try {
            // Upload image and get analysis
            const uploadResponse = await apiClient.uploadImage(selectedFile);

            // Save report to database
            const reportData = {
                filename: selectedFile.name,
                image_path: uploadResponse.path,
                length_mm: uploadResponse.analysis.length_mm,
                width_mm: uploadResponse.analysis.width_mm,
                depth_mm: uploadResponse.analysis.depth_mm,
                severity: uploadResponse.analysis.severity,
                recommendation: uploadResponse.analysis.recommendation,
                analysis_data: uploadResponse.analysis
            };

            const saveResponse = await apiClient.saveReport(reportData);

            // Set analysis result for display
            const newReport: CrackReport = {
                id: saveResponse.report.id,
                filename: selectedFile.name,
                upload_date: new Date().toISOString().split('T')[0],
                length_mm: uploadResponse.analysis.length_mm,
                width_mm: uploadResponse.analysis.width_mm,
                depth_mm: uploadResponse.analysis.depth_mm,
                severity: uploadResponse.analysis.severity,
                recommendation: uploadResponse.analysis.recommendation,
                image_path: uploadResponse.path
            };

            setAnalysisResult(newReport);
            setReports([newReport, ...reports]);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Low': return 'text-green-600 bg-green-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'High': return 'text-orange-600 bg-orange-100';
            case 'Critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300`}>
                <div className="p-4 border-b">
                    <div className="flex items-center">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        {sidebarOpen && <span className="ml-2 text-xl font-bold">CrackDetect</span>}
                    </div>
                </div>

                <nav className="mt-8">
                    <button
                        onClick={() => setActiveTab('analyze')}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-indigo-50 ${activeTab === 'analyze' ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600' : 'text-gray-700'
                            }`}
                    >
                        <Upload className="h-5 w-5" />
                        {sidebarOpen && <span className="ml-3">Analyze Crack</span>}
                    </button>

                    <button
                        onClick={() => setActiveTab('history')}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-indigo-50 ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600' : 'text-gray-700'
                            }`}
                    >
                        <History className="h-5 w-5" />
                        {sidebarOpen && <span className="ml-3">History</span>}
                    </button>
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <h1 className="ml-4 text-2xl font-semibold text-gray-900">
                                {activeTab === 'analyze' ? 'Crack Analysis' : 'Analysis History'}
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <User className="h-8 w-8 text-gray-400 mr-2" />
                            <span className="text-gray-700">Welcome, {user.name}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {activeTab === 'analyze' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Upload Crack Image</h2>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        {selectedFile ? selectedFile.name : 'Drag and drop your image here, or click to browse'}
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                                    >
                                        Choose File
                                    </label>
                                </div>

                                {selectedFile && (
                                    <div className="mt-6">
                                        <button
                                            onClick={analyzeCrack}
                                            disabled={analyzing}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md"
                                        >
                                            {analyzing ? 'Analyzing...' : 'Analyze Crack'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {analyzing && (
                                <div className="bg-white rounded-lg shadow p-6 mb-6">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                                        <span>AI is analyzing your image...</span>
                                    </div>
                                </div>
                            )}

                            {analysisResult && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-xl font-semibold mb-4">Analysis Result</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <img
                                                src={analysisResult.image_path}
                                                alt="Crack analysis"
                                                className="w-full h-48 object-cover rounded-lg mb-4"
                                            />
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="font-medium">Severity: </span>
                                                    <span className={`px-2 py-1 rounded text-sm ${getSeverityColor(analysisResult.severity)}`}>
                                                        {analysisResult.severity}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Length: </span>
                                                    {analysisResult.length_mm.toFixed(1)} mm
                                                </div>
                                                <div>
                                                    <span className="font-medium">Width: </span>
                                                    {analysisResult.width_mm.toFixed(1)} mm
                                                </div>
                                                <div>
                                                    <span className="font-medium">Depth: </span>
                                                    {analysisResult.depth_mm.toFixed(1)} mm
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Recommendation</h4>
                                            <p className="text-gray-700 bg-gray-50 p-4 rounded">
                                                {analysisResult.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="max-w-6xl mx-auto">
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-semibold">Analysis History</h2>
                                            <p className="text-gray-600">View all your past crack analysis reports</p>
                                        </div>
                                        <button
                                            onClick={loadReports}
                                            disabled={loading}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-md"
                                        >
                                            {loading ? 'Loading...' : 'Refresh'}
                                        </button>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="p-6 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                                        <span>Loading reports...</span>
                                    </div>
                                ) : reports.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        No reports found. Upload your first crack image to get started!
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Image
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Filename
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Severity
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Dimensions
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {reports.map((report) => (
                                                    <tr key={report.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <img
                                                                src={report.image_path}
                                                                alt="Crack"
                                                                className="h-12 w-12 object-cover rounded"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {report.filename}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(report.upload_date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(report.severity)}`}>
                                                                {report.severity}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            L: {Number(report.length_mm).toFixed(1)}mm<br />
                                                            W: {Number(report.width_mm).toFixed(1)}mm<br />
                                                            D: {Number(report.depth_mm).toFixed(1)}mm
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <button className="text-indigo-600 hover:text-indigo-900">
                                                                <FileText className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// Main App
const CrackDetectionApp = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const { user, login, signup, logout, isLoading, error } = useAuth();

    const handleShowLogin = () => {
        setAuthMode('login');
        setShowAuthModal(true);
    };

    const handleShowSignup = () => {
        setAuthMode('signup');
        setShowAuthModal(true);
    };

    if (user) {
        return <Dashboard user={user} onLogout={logout} />;
    }

    return (
        <>
            <HomePage onShowLogin={handleShowLogin} onShowSignup={handleShowSignup} />
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                mode={authMode}
                onLogin={login}
                onSignup={signup}
                isLoading={isLoading}
                error={error}
            />
        </>
    );
};

export default CrackDetectionApp;