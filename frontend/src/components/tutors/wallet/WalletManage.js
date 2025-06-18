import React, { useEffect, useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaWallet,
  FaQuestionCircle,
  FaSort,
  FaFilter,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import {
  Card,
  Select,
  Input,
  Button,
  Spin,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Space,
  Divider,
  Empty,
  Badge,
  message as antdMessage,
} from "antd";
import {
  SearchOutlined,
  BankOutlined,
  EditOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Search } = Input;

const WalletManage = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [messageBalance, setMessageBalance] = useState("");
  const [message, setMessage] = useState();
  const [isWithdrawFormVisible, setIsWithdrawFormVisible] = useState(false);
  const [bankData, setBankData] = useState([]);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountHolder, setNewAccountHolder] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // New states for sorting and filtering
  const [sortOrder, setSortOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBankData, setFilteredBankData] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const bankList = [
    "SHB",
    "Sacombank",
    "Vietcombank",
    "Viettinbank",
    "Techcombank",
    "ACB",
    "BIDV",
    "MB Bank",
    "VPBank",
    "Eximbank",
    "LienVietPostBank",
    "OceanBank",
    "HDBank",
    "Bac A Bank",
    "SeABank",
    "NamABank",
    "KienLongBank",
    "SCB",
    "VIB",
    "PGBank",
    "TPBank",
    "Asia Commercial Bank (ACB)",
    "DongA Bank",
    "Shinhan Bank",
    "Standard Chartered Bank",
    "HSBC Vietnam",
    "Citibank",
    "JPMorgan Chase Bank",
    "ANZ Vietnam",
    "UOB Vietnam",
    "VietABank",
    "BaoViet Bank",
    "Saigonbank",
    "VietCapital Bank",
    "Public Bank Vietnam",
    "First Commercial Bank Vietnam",
    "Woori Bank",
    "Hong Leong Bank Vietnam",
    "Indovina Bank",
    "Shanghai Pudong Development Bank",
    "OCB (Orient Commercial Bank)",
    "Hong Kong and Shanghai Banking Corporation (HSBC)",
    "China Construction Bank Vietnam",
    "VIB Bank",
    "CitiBank Vietnam",
    "Agribank",
    "Techcom Securities",
    "Vietnam International Bank (VIB)",
    "Keppel Bank",
  ];

  const handleUpdateClick = (bank) => {
    setNewBankName(bank.bank_name);
    setNewAccountNumber(bank.account_number);
    setNewAccountHolder(bank.account_name);
    setIsUpdateFormVisible(true);
  };

  const handleAccountHolderChange = (e) => {
    const value = e.target.value;
    if (/\d/.test(value)) {
      antdMessage.error("Invalid account name.");
      return;
    }
    setNewAccountHolder(value);
  };

  const fetchWithdrawHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/wallet/requests-history",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.withdrawals) {
        const pendingRequest = data.withdrawals.some(
          (withdrawal) => withdrawal.status === "Pending"
        );
        setHasPendingRequest(pendingRequest);
        setWithdrawalHistory(data.withdrawals);
      } else {
        antdMessage.error(data.message || "Error fetching withdrawal history.");
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      antdMessage.error("An error occurred while fetching withdrawal history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawHistory();
  }, [fetchWithdrawHistory]);

  const handleCancelUpdate = () => {
    setNewBankName("");
    setNewAccountNumber("");
    setNewAccountHolder("");
    setIsUpdateFormVisible(false);
  };

  const isWithdrawalButtonEnabled =
    withdrawAmount > 0 && withdrawAmount <= balance && bankData.length > 0;

  const handleBankNameChange = (e) => {
    const value = e.target.value;
    setNewBankName(value);
    const filtered = bankList.filter((bank) =>
      bank.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBanks(filtered);
  };

  const handleBankSelection = (bank) => {
    setNewBankName(bank);
    setFilteredBanks([]);
  };

  // Apply sorting and filtering to bank data
  useEffect(() => {
    let filtered = [...bankData];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (bank) =>
          bank.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bank.account_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bank.account_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortOrder === "name-asc") {
      filtered.sort((a, b) => a.bank_name.localeCompare(b.bank_name));
    } else if (sortOrder === "name-desc") {
      filtered.sort((a, b) => b.bank_name.localeCompare(a.bank_name));
    }

    setFilteredBankData(filtered);
  }, [bankData, searchQuery, sortOrder]);

  // Filter withdrawal history
  const filteredHistory = withdrawalHistory.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status.toLowerCase() === statusFilter.toLowerCase();
  });

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/wallet/show-balance",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.current_balance !== undefined) {
          setBalance(data.current_balance);
        } else {
          antdMessage.error(data.message || "No balance found");
          setBalance(0);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/users/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.bankAccount) {
          setBankData(data.bankAccount);
        } else {
          antdMessage.error("No bank account found in profile data.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        antdMessage.error("Error fetching user profile");
      }
    };

    fetchUserProfile();
  }, []);

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) {
      antdMessage.error("Invalid withdrawal amount.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/wallet/withdrawal-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            amount: withdrawAmount,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        antdMessage.success(
          "Withdrawal request has been submitted successfully."
        );
        setHasPendingRequest(true);
        setWithdrawAmount(0);
        setIsWithdrawFormVisible(false);
        setIsConfirmVisible(false);
        fetchWithdrawHistory();
      } else {
        if (data.message === "You already have a pending withdrawal request.") {
          antdMessage.error(
            "You have a pending withdrawal request. Please wait and try again later!"
          );
          setHasPendingRequest(true);
        } else {
          antdMessage.error(
            data.message || "Please fill in your bank information completely."
          );
        }
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      antdMessage.error("An error occurred while sending the request.");
    }
  };

  const handleUpdateBank = async () => {
    if (!newBankName || !newAccountNumber || !newAccountHolder) {
      antdMessage.error("Please fill in your bank information completely.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/users/update-bank-account",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            bank_name: newBankName,
            account_number: newAccountNumber,
            account_name: newAccountHolder,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        antdMessage.success("Bank information updated successfully.");
        setBankData([
          {
            bank_name: newBankName,
            account_number: newAccountNumber,
            account_name: newAccountHolder,
          },
        ]);
        setIsUpdateFormVisible(false);
      } else {
        antdMessage.error(data.message || "An error occurred while updating.");
      }
    } catch (error) {
      console.error("Error updating bank account:", error);
      antdMessage.error("An error occurred while updating bank information.");
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <Spin indicator={antIcon} size="large" />
        <p className="mt-4 text-gray-600 ml-4 text-xl font-semibold">
          Loading wallet balance...
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status === "Pending") {
      return (
        <Badge status="processing" text="Pending" className="text-blue-500" />
      );
    } else if (status === "Approved") {
      return (
        <Badge status="success" text="Approved" className="text-green-500" />
      );
    } else if (status === "Rejected") {
      return <Badge status="error" text="Rejected" className="text-red-500" />;
    }
    return <Badge status="default" text={status} />;
  };

  return (
    <div className="min-h-screen flex justify-start items-start pt-10 pb-10 bg-gray-100">
      <Card
        className="max-w-4xl w-full mx-auto rounded-xl shadow-xl"
        bodyStyle={{ padding: 24 }}
      >
        <div className="flex items-center justify-center mb-6">
          <FaWallet className="text-blue-500 text-3xl mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">
            Wallet Management
          </h1>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <p className="text-base sm:text-lg font-semibold text-gray-600">
                Current Balance
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 transition-all">
                {balance?.toLocaleString("vi-VN")} VND
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                type="primary"
                size="large"
                disabled={hasPendingRequest}
                className={`${
                  hasPendingRequest
                    ? "bg-gray-400"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                onClick={() => setIsWithdrawFormVisible(!isWithdrawFormVisible)}
                icon={<FaWallet className="mr-2" />}
              >
                {isWithdrawFormVisible
                  ? "Cancel Request"
                  : "Withdrawal Request"}
              </Button>
            </div>
          </div>
        </Card>

        {hasPendingRequest && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You have a pending withdrawal request. Please wait for it to
                  be processed before submitting another request.
                </p>
              </div>
            </div>
          </div>
        )}

        {isWithdrawFormVisible && (
          <Card className="mb-6" title="Withdrawal Request" bordered={false}>
            <Form layout="vertical">
              <Form.Item
                label="Withdrawal Amount"
                validateStatus={messageBalance ? "error" : ""}
                help={messageBalance}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  value={withdrawAmount}
                  min={0}
                  max={balance}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={(value) => {
                    if (value > balance) {
                      setMessageBalance(
                        "The withdrawal amount cannot exceed the current balance."
                      );
                    } else {
                      setMessageBalance("");
                    }
                    setWithdrawAmount(value || 0);
                  }}
                  placeholder="Enter withdrawal amount"
                  addonAfter="VND"
                />
              </Form.Item>

              <Tooltip title="Withdrawal requires a valid bank account, amount greater than 0, and not exceeding your balance">
                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={!isWithdrawalButtonEnabled}
                  onClick={() => setIsConfirmVisible(true)}
                  className={
                    isWithdrawalButtonEnabled
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-300"
                  }
                >
                  Withdrawal Confirmation
                </Button>
              </Tooltip>
            </Form>
          </Card>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Bank Information
            </h2>
            <div className="flex space-x-2">
              <Button
                icon={<SearchOutlined />}
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center"
              >
                {showHistory ? "Hide History" : "View History"}
              </Button>

              {/* Sort button */}
              <Select
                placeholder="Sort by"
                style={{ width: 130 }}
                onChange={(value) => setSortOrder(value)}
                value={sortOrder}
              >
                <Option value={null}>No Sort</Option>
                <Option value="name-asc">Bank Name (A-Z)</Option>
                <Option value="name-desc">Bank Name (Z-A)</Option>
              </Select>
            </div>
          </div>

          {/* Search bar */}
          <Input
            placeholder="Search by bank name, account number, or holder name"
            prefix={<SearchOutlined className="site-form-item-icon" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
            allowClear
          />

          {showHistory ? (
            <Card className="mb-6" title="Withdrawal History">
              <div className="mb-4">
                <Select
                  placeholder="Filter by status"
                  style={{ width: 150 }}
                  onChange={(value) => setStatusFilter(value)}
                  value={statusFilter}
                >
                  <Option value="all">All Status</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistory.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {parseInt(item.amount).toLocaleString()} VND
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(item.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty description="No withdrawal history" />
              )}
            </Card>
          ) : filteredBankData.length > 0 ? (
            filteredBankData.map((bank, index) => (
              <Card
                key={index}
                className="mb-4 hover:shadow-lg transition-all duration-300"
                actions={[
                  <Button
                    onClick={() => handleUpdateClick(bank)}
                    icon={<EditOutlined />}
                    type="link"
                  >
                    Update
                  </Button>,
                ]}
              >
                <div className="flex items-center mb-2">
                  <BankOutlined className="text-blue-500 text-xl mr-2" />
                  <span className="text-lg font-medium text-gray-700">
                    {bank.bank_name}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500">
                      <span className="font-semibold">Account Number:</span>{" "}
                      {bank.account_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">
                      <span className="font-semibold">Account Holder:</span>{" "}
                      {bank.account_name}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Empty
                description="No bank information available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <Button
                type="primary"
                onClick={() => setIsUpdateFormVisible(true)}
                className="mt-4 bg-blue-500 hover:bg-blue-600"
              >
                Add Bank Account
              </Button>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        <Modal
          title="Withdrawal Confirmation"
          visible={isConfirmVisible}
          onOk={handleWithdraw}
          onCancel={() => setIsConfirmVisible(false)}
          okText="Confirm"
          cancelText="Cancel"
          okButtonProps={{ className: "bg-green-500 hover:bg-green-600" }}
        >
          <p className="text-gray-600">
            Are you sure you want to withdraw{" "}
            <span className="font-bold text-gray-800">
              {withdrawAmount.toLocaleString("vi-VN")} VND
            </span>
            ?
          </p>
        </Modal>

        {/* Bank Update Modal */}
        <Modal
          title={
            bankData.length > 0 ? "Update Bank Account" : "Add Bank Account"
          }
          visible={isUpdateFormVisible}
          onOk={handleUpdateBank}
          onCancel={handleCancelUpdate}
          okText="Save"
          cancelText="Cancel"
          okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
        >
          <Form layout="vertical">
            <Form.Item label="Bank Name" required>
              <div className="relative">
                <Input
                  value={newBankName}
                  onChange={handleBankNameChange}
                  placeholder="Start typing to search banks..."
                />
                {newBankName && filteredBanks.length > 0 && (
                  <div className="absolute z-10 w-full bg-white shadow-lg max-h-60 overflow-y-auto rounded-md border border-gray-200">
                    {filteredBanks.map((bank, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleBankSelection(bank)}
                      >
                        {bank}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item label="Account Number" required>
              <Input
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
                placeholder="Enter your account number"
              />
            </Form.Item>

            <Form.Item label="Account Holder Name" required>
              <Input
                value={newAccountHolder}
                onChange={handleAccountHolderChange}
                placeholder="Enter account holder name"
              />
            </Form.Item>
          </Form>
        </Modal>

        {message && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded mb-4">
            <p className="text-red-700">{message}</p>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={5000} />
      </Card>
    </div>
  );
};

export default WalletManage;
