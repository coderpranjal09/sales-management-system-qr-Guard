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
  CreditCardIcon as PaymentIcon,
  RefreshIcon,
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";
import api from "../../services/api";
import toast from "react-hot-toast";

// Simple QR Code Generator using Canvas
const QRCodeGenerator = ({ value, size = 200 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;

    const generateQRCode = async () => {
      try {
        const QRCode = await import('qrcode');
        const canvas = canvasRef.current;
        
        QRCode.toCanvas(canvas, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        }, (error) => {
          if (error) {
            console.error('QR Code generation error:', error);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('QR Code', size/2, size/2);
          }
        });
      } catch (error) {
        console.error('Failed to load QR library:', error);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = '#6b7280';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code', size/2, size/2);
        }
      }
    };

    generateQRCode();
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="w-full h-auto"
    />
  );
};

// Payment Section Component
const PaymentSection = ({ 
  paymentAmount, 
  setPaymentAmount, 
  paymentCaptured, 
  setPaymentCaptured,
  orderData,
  setOrderData,
  orderErrors,
  onPaymentComplete
}) => {
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentStep, setPaymentStep] = useState('amount'); // 'amount' | 'qr' | 'transaction'
  const [isExpanded, setIsExpanded] = useState(false);
  const [manualTransactionId, setManualTransactionId] = useState("");
  
  // UPI Configuration
  const UPI_ID = "8791273578m@pnb";
  const UPI_NAME = "QRGuard Payments";

  const handleGenerateQR = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${paymentAmount}&cu=INR`;
      setQrValue(upiString);
      setShowQR(true);
      setPaymentStep('qr');
      setIsGenerating(false);
      setIsExpanded(true);
      toast.success("QR Code generated successfully!");
    }, 800);
  };

  const handlePaymentDone = () => {
    // Just mark payment as done, no auto-generation
    setPaymentCaptured(true);
    setPaymentStep('transaction');
    toast.success("Payment confirmed! Please enter transaction ID.");
  };

  const handleTransactionSubmit = () => {
    if (!manualTransactionId.trim()) {
      toast.error("Please enter a transaction ID");
      return;
    }
    
    // Save the manual transaction ID
    setOrderData(prev => ({ ...prev, transactionId: manualTransactionId.trim() }));
    toast.success("Transaction ID saved!");
    onPaymentComplete();
  };

  const handleReset = () => {
    setShowQR(false);
    setPaymentStep('amount');
    setPaymentCaptured(false);
    setPaymentAmount("");
    setQrValue("");
    setIsExpanded(false);
    setManualTransactionId("");
    setOrderData(prev => ({ ...prev, transactionId: "" }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <PaymentIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">UPI Payment</h4>
            {paymentCaptured ? (
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Payment Completed
              </p>
            ) : paymentStep === 'qr' ? (
              <p className="text-sm text-purple-600">QR Code Generated</p>
            ) : (
              <p className="text-sm text-gray-500">Generate QR to pay via UPI</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {paymentCaptured && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Completed
            </span>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Step 1: Amount Input */}
          {paymentStep === 'amount' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Payment Amount
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                      placeholder="0.00"
                      min="1"
                      step="1"
                    />
                  </div>
                  <button
                    onClick={handleGenerateQR}
                    disabled={isGenerating || !paymentAmount || parseFloat(paymentAmount) <= 0}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshIcon className="h-5 w-5 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrcodeIcon className="h-5 w-5 mr-2" />
                        Generate QR
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Enter amount and click generate to create UPI QR code
                </p>
              </div>
            </div>
          )}

          {/* Step 2: QR Code Display */}
          {paymentStep === 'qr' && showQR && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-200">
                      <QRCodeGenerator value={qrValue} size={220} />
                    </div>
                    <p className="mt-3 text-sm text-gray-600 font-medium">
                      Scan with any UPI App
                    </p>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Amount</span>
                        <span className="text-2xl font-bold text-purple-600">₹{paymentAmount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Pay to</span>
                        <span className="font-medium text-gray-800">{UPI_NAME}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">UPI ID</span>
                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-700">
                          {UPI_ID}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handlePaymentDone}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      I've Made the Payment
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Click after you've completed the payment via UPI app
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Go back and change amount
              </button>
            </div>
          )}

          {/* Step 3: Transaction ID - Manual Entry */}
          {paymentStep === 'transaction' && paymentCaptured && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">Payment Confirmed!</h4>
                    <p className="text-sm text-green-600">Please enter the transaction ID</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualTransactionId}
                    onChange={(e) => setManualTransactionId(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                      orderErrors.transactionId ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-400'
                    }`}
                    placeholder="Enter transaction/UPI ID from your UPI app"
                  />
                  {orderErrors.transactionId && (
                    <p className="text-sm text-red-600 flex items-center">
                      <XIcon className="h-4 w-4 mr-1" />
                      {orderErrors.transactionId}
                    </p>
                  )}
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <ClipboardIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>Enter the transaction ID from your UPI app (e.g., UPI Reference Number, Transaction ID)</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={handleTransactionSubmit}
                    disabled={!manualTransactionId.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Save Transaction ID
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completion Status */}
          {paymentCaptured && paymentStep === 'transaction' && orderData.transactionId && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <div>
                  <span className="font-medium">Transaction ID saved: </span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{orderData.transactionId}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.success("Ready to submit order!");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ✓ Ready to submit →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCaptured, setPaymentCaptured] = useState(false);

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

  /* ---------------- HELPER: Extract Vehicle ID from URL ---------------- */
  const extractVehicleIdFromUrl = (url) => {
    try {
      let vehicleId = null;
      
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const urlObj = new URL(url);
        vehicleId = urlObj.searchParams.get('vehicle_id');
      } 
      else if (url.includes('vehicle_id=')) {
        const params = new URLSearchParams(url.split('?')[1] || url);
        vehicleId = params.get('vehicle_id');
      }
      
      if (vehicleId && vehicleId.trim()) {
        return vehicleId.trim();
      }
      
      if (url && !url.includes('vehicle_id=') && !url.includes('http')) {
        return url.trim();
      }
      
      return null;
    } catch (error) {
      console.error("Error extracting vehicle ID:", error);
      const match = url.match(/vehicle_id=([^&]+)/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    }
  };

  /* ---------------- LOAD QR SCANNER ---------------- */
  useEffect(() => {
    let mounted = true;

    const loadScanner = async () => {
      if (typeof window === "undefined") return;

      try {
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
        const vehicleId = extractVehicleIdFromUrl(decodedText.trim());
        
        if (vehicleId) {
          setOrderData((prev) => ({ ...prev, qrId: vehicleId }));
          toast.success(`Vehicle ID extracted: ${vehicleId}`);
        } else {
          toast.error("Invalid QR code: Vehicle ID not found");
          console.warn("Scanned text:", decodedText);
        }
        stopScanner();
      }
    };

    const qrCodeErrorCallback = (error) => {
      if (error && !error.includes("NotFoundException")) {
        console.warn("QR scan error:", error);
      }
    };

    try {
      setIsScanning(true);
      setShowScanner(true);

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
    // Reset payment states when switching modes
    if (mode === "cash") {
      setPaymentCaptured(false);
      setPaymentAmount("");
    }
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

    if (orderData.paymentMode === "online") {
      if (!orderData.transactionId.trim()) {
        errors.transactionId = "Transaction ID is required for online payment";
      }
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
                          <span className="font-semibold text-green-600">Vehicle ID:</span>
                          <span className="block mt-2 font-mono bg-green-50 p-3 rounded-lg text-lg font-bold">
                            {orderData.qrId}
                          </span>
                        </>
                      ) : (
                        "Click 'Scan QR Code' to scan the vehicle QR"
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
                    Vehicle ID *
                  </label>
                  <input
                    type="text"
                    name="qrId"
                    value={orderData.qrId}
                    onChange={handleOrderChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                      orderErrors.qrId ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="Scan QR code or manually enter Vehicle ID"
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

                {/* Online Payment - Inline Expandable Section */}
                {orderData.paymentMode === "online" && (
                  <PaymentSection
                    paymentAmount={paymentAmount}
                    setPaymentAmount={setPaymentAmount}
                    paymentCaptured={paymentCaptured}
                    setPaymentCaptured={setPaymentCaptured}
                    orderData={orderData}
                    setOrderData={setOrderData}
                    orderErrors={orderErrors}
                    onPaymentComplete={() => {
                      toast.success("Payment section completed!");
                    }}
                  />
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
                  disabled={loading || !scannerLoaded || (orderData.paymentMode === "online" && !paymentCaptured)}
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