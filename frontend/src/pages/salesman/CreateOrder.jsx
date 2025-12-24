import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SalesmanLayout from "../../components/layout/SalesmanLayout";
import {
  QrcodeIcon,
  CameraIcon,
  CashIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";
import api from "../../services/api";
import toast from "react-hot-toast";

const CreateOrder = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scannerLoaded, setScannerLoaded] = useState(false);

  const [step, setStep] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerErrors, setCustomerErrors] = useState({});
  const [orderErrors, setOrderErrors] = useState({});
  const [isScanning, setIsScanning] = useState(false);

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    mobile: "",
    vehicleNo: "",
    modelName: "",
    driverMobile: "",
  });

  const [orderData, setOrderData] = useState({
    qrId: "",
    paymentMode: "cash",
    transactionId: "",
  });

  /* ---------------- LOAD QR SCANNER ---------------- */
  useEffect(() => {
    let mounted = true;

    const loadScanner = async () => {
      if (typeof window === "undefined") return;

      try {
        // Dynamically import the QR scanner
        const module = await import("html5-qrcode");
        if (mounted) {
          scannerRef.current = {
            Html5QrcodeScanner: module.Html5QrcodeScanner,
            Html5Qrcode: module.Html5Qrcode,
          };
          setScannerLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load QR scanner:", error);
        toast.error("Failed to load QR scanner library");
      }
    };

    loadScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, []);

  /* ---------------- SCANNER FUNCTIONS ---------------- */
  const startScanner = async () => {
    if (!scannerRef.current?.Html5Qrcode) {
      toast.error("QR scanner not loaded. Please try again.");
      return;
    }

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      if (decodedText && decodedText.trim()) {
        setOrderData((prev) => ({ ...prev, qrId: decodedText.trim() }));
        toast.success("QR Code scanned successfully!");
        stopScanner();
      }
    };

    const qrCodeErrorCallback = (error) => {
      // Don't show error if scanning was intentionally stopped
      if (error && !error.includes("NotFoundException")) {
        console.warn("QR scan error:", error);
      }
    };

    try {
      setIsScanning(true);
      setShowScanner(true);

      // Wait a bit for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const qrCodeInstance = new scannerRef.current.Html5Qrcode(
        "qr-reader-container"
      );

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      await qrCodeInstance.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      );

      // Store the instance for cleanup
      scannerRef.current.instance = qrCodeInstance;
    } catch (error) {
      console.error("Scanner start error:", error);
      toast.error("Failed to start camera. Please check permissions.");
      setIsScanning(false);
      setShowScanner(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current?.instance) {
      scannerRef.current.instance.stop().then(() => {
        scannerRef.current.instance.clear();
        scannerRef.current.instance = null;
        setIsScanning(false);
        setShowScanner(false);
      }).catch(err => {
        console.error("Error stopping scanner:", err);
        setIsScanning(false);
        setShowScanner(false);
      });
    } else {
      setIsScanning(false);
      setShowScanner(false);
    }
  };

  /* ---------------- HANDLERS ---------------- */
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
    
    if (customerErrors[name]) {
      setCustomerErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
    
    if (orderErrors[name]) {
      setOrderErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePaymentModeChange = (mode) => {
    setOrderData((prev) => ({ 
      ...prev, 
      paymentMode: mode,
      transactionId: mode === "cash" ? "" : prev.transactionId
    }));
  };

  /* ---------------- VALIDATION ---------------- */
  const validateStep1 = () => {
    const errors = {};
    const { name, email, mobile, vehicleNo, modelName, driverMobile } = customerData;

    if (!name.trim()) {
      errors.name = "Customer name is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Invalid email format";
    }

    if (!mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = "Mobile must be 10 digits";
    }

    if (!vehicleNo.trim()) {
      errors.vehicleNo = "Vehicle number is required";
    }

    if (!modelName.trim()) {
      errors.modelName = "Model name is required";
    }

    if (driverMobile.trim() && !/^\d{10}$/.test(driverMobile)) {
      errors.driverMobile = "Driver mobile must be 10 digits";
    }

    setCustomerErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const errors = {};

    if (!orderData.qrId.trim()) {
      errors.qrId = "QR / VIN ID is required";
    }

    if (orderData.paymentMode === "online" && !orderData.transactionId.trim()) {
      errors.transactionId = "Transaction ID is required for online payment";
    }

    setOrderErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return false;
    }

    return true;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!validateStep2()) return;

    if (!window.confirm("Are you sure you want to submit this order?")) return;

    setLoading(true);
    try {
      await api.post("/orders/salesman/orders", {
        customer: customerData,
        ...orderData,
      });

      toast.success("Order created successfully!");
      navigate("/salesman/orders");
    } catch (err) {
      console.error("Order creation error:", err);
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to create order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <SalesmanLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
                <p className="mt-2 text-gray-600">Fill in customer and order details below</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Step {step}/2
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 border-2 border-gray-300'}`}>
                  {step > 1 ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <span className="font-bold">1</span>
                  )}
                </div>
                <div className="flex-1 h-2 mx-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${step >= 2 ? 'bg-blue-600' : ''}`}></div>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 border-2 border-gray-300'}`}>
                  <span className="font-bold">2</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 px-2">
              <div className="text-center">
                <div className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Customer Details
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Order Details
                </div>
              </div>
            </div>
          </div>

          {/* STEP 1: Customer Details */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fadeIn">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerData.name}
                    onChange={handleCustomerChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                      customerErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="Enter customer name"
                  />
                  {customerErrors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {customerErrors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerData.email}
                      onChange={handleCustomerChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                        customerErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="customer@example.com"
                    />
                    {customerErrors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {customerErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={customerData.mobile}
                      onChange={handleCustomerChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                        customerErrors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="10-digit mobile number"
                    />
                    {customerErrors.mobile && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {customerErrors.mobile}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Vehicle Number *
                    </label>
                    <input
                      type="text"
                      name="vehicleNo"
                      value={customerData.vehicleNo}
                      onChange={handleCustomerChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                        customerErrors.vehicleNo ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="e.g., MH12AB1234"
                    />
                    {customerErrors.vehicleNo && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {customerErrors.vehicleNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Model Name *
                    </label>
                    <input
                      type="text"
                      name="modelName"
                      value={customerData.modelName}
                      onChange={handleCustomerChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                        customerErrors.modelName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="e.g., Toyota Innova"
                    />
                    {customerErrors.modelName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {customerErrors.modelName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Driver Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="driverMobile"
                    value={customerData.driverMobile}
                    onChange={handleCustomerChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                      customerErrors.driverMobile ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="10-digit driver mobile number"
                  />
                  {customerErrors.driverMobile && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {customerErrors.driverMobile}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={() => {
                    if (validateStep1()) {
                      setStep(2);
                    }
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue to Order Details
                  <ArrowRightIcon className="ml-3 h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Order Details */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fadeIn">
              {/* QR Scanner Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">QR Code Scanner</h3>
                    <p className="mt-1 text-gray-600">Scan the product QR code using your camera</p>
                  </div>
                  {!showScanner && scannerLoaded && (
                    <button
                      onClick={startScanner}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center shadow-lg hover:shadow-xl"
                    >
                      <CameraIcon className="mr-3 h-5 w-5" />
                      {orderData.qrId ? "Re-scan QR Code" : "Scan QR Code"}
                    </button>
                  )}
                </div>

                {showScanner ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg">
                      <div id="qr-reader-container" className="w-full" />
                      {isScanning && (
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center space-x-2 bg-black/70 text-white px-3 py-1 rounded-full">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Scanning...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={stopScanner}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center"
                      >
                        <XIcon className="mr-2 h-5 w-5" />
                        Stop Scanner
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-3 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="inline-block p-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
                      <QrcodeIcon className="h-20 w-20 text-blue-600" />
                    </div>
                    <p className="mt-6 text-lg text-gray-700">
                      {orderData.qrId ? (
                        <>
                          <span className="font-semibold text-green-600">Scanned QR ID:</span>
                          <span className="block mt-2 font-mono bg-green-50 p-3 rounded-lg">{orderData.qrId}</span>
                        </>
                      ) : (
                        "Click 'Scan QR Code' to scan the product QR"
                      )}
                    </p>
                    {!scannerLoaded && (
                      <p className="mt-2 text-sm text-amber-600">
                        Loading scanner library...
                      </p>
                    )}
                  </div>
                )}

                {/* QR ID Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    QR / VIN ID *
                  </label>
                  <input
                    type="text"
                    name="qrId"
                    value={orderData.qrId}
                    onChange={handleOrderChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                      orderErrors.qrId ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="Scan QR code or manually enter QR/VIN ID"
                    readOnly={isScanning}
                  />
                  {orderErrors.qrId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {orderErrors.qrId}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Mode Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Payment Mode</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => handlePaymentModeChange("cash")}
                    className={`p-6 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-200 transform hover:-translate-y-1 ${
                      orderData.paymentMode === "cash"
                        ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg"
                        : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className={`p-4 rounded-full mb-4 ${
                      orderData.paymentMode === "cash" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <CashIcon className="h-10 w-10" />
                    </div>
                    <span className="text-lg font-semibold">Cash Payment</span>
                    <span className="mt-2 text-sm text-gray-600">Pay with cash on delivery</span>
                    {orderData.paymentMode === "cash" && (
                      <div className="mt-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handlePaymentModeChange("online")}
                    className={`p-6 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-200 transform hover:-translate-y-1 ${
                      orderData.paymentMode === "online"
                        ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg"
                        : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className={`p-4 rounded-full mb-4 ${
                      orderData.paymentMode === "online" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <CreditCardIcon className="h-10 w-10" />
                    </div>
                    <span className="text-lg font-semibold">Online Payment</span>
                    <span className="mt-2 text-sm text-gray-600">UPI, Card, or Net Banking</span>
                    {orderData.paymentMode === "online" && (
                      <div className="mt-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Transaction ID for Online Payment */}
                {orderData.paymentMode === "online" && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={orderData.transactionId}
                      onChange={handleOrderChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                        orderErrors.transactionId ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="Enter transaction/UPI ID"
                    />
                    {orderErrors.transactionId && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {orderErrors.transactionId}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between pt-8 border-t gap-4">
                <button
                  onClick={() => {
                    stopScanner();
                    setStep(1);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-xl hover:from-gray-300 hover:to-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center justify-center"
                >
                  <ArrowLeftIcon className="mr-3 h-5 w-5" />
                  Back to Customer Details
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !scannerLoaded}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Order...
                    </>
                  ) : (
                    "Submit Order"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SalesmanLayout>
  );
};

export default CreateOrder;