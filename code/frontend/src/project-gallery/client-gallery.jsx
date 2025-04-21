import React, { useState, useEffect, useContext, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Alert } from "@heroui/alert";
import { Form } from "@heroui/form";
import { RadioGroup, Radio } from "@heroui/radio";
import { Search, UserPlus, LogOut } from "lucide-react";
import { AuthContext } from "../AuthContext";

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
};

const getAllClients = async () => {
    try {
        const response = await fetch("/api/user/clients", {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (!data.success) {
            console.error("Couldn't fetch users:", data.message);
            return [];
        }
        return data.users.map(({ username, email, role, _id }) => ({
            username,
            email,
            role,
            _id
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const ClientGallery = () => {
    const [clientList, setClientList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const { logout } = useContext(AuthContext);
    const [modalErrors, setModalErrors] = useState("");
    const [userType, setUserType] = useState("client");

    const resetFormFields = () => {
        setUsername("");
        setEmail("");
        setPhoneNumber("");
        setUserType("client");
    };

    useEffect(() => {
        const fetchClients = async () => {
            const clients = await getAllClients();
            setClientList(clients);
        };
        fetchClients();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            resetFormFields();
        }
    }, [isOpen]);

    const filteredClients = useMemo(() => {
        return clientList.filter(client => 
            client.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [clientList, searchQuery]);

    const usersByRole = useMemo(() => {
        const clients = [];
        const staff = [];
        filteredClients.forEach((client) => {
            if (client.role === "field staff") {
                staff.push(client);
            } else {
                clients.push(client);
            }
        });
        return { clients, staff };
    }, [filteredClients]);

    const createUser = async () => {
        try {
            if (!isValidEmail(email)) {
                setModalErrors("Please enter a valid email address");
                return;
            }

            const length = Math.floor(Math.random() * (11 - 8 + 1)) + 8;
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let pwd = '';
          
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                pwd += characters[randomIndex];
            }

            const response = await fetch("/api/user/add", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    email,
                    password: pwd,
                    role: userType,
                    phone_number: phoneNumber
                })
            });
    
            const data = await response.json();
            if (data.success) {
                const updatedClients = await getAllClients();
                setClientList(updatedClients);
                setEmailSent(data.emailSent);
                setPassword(`Generated password: ${pwd}`);
                setShowAlert(true);
                
                setTimeout(() => {
                    setShowAlert(false);
                    setPassword("");
                    setEmailSent(false);
                }, 7000);

                resetFormFields();
                onOpenChange(false);
            } else {
                setModalErrors(data.message);
                setTimeout(() => {
                    setModalErrors("");
                }, 7000);
                console.error("Error adding client:", data.message);
            }
        } catch (error) {
            console.error("Error creating client:", error);
        }
    };

    const handleOpenChange = (open) => {
        if (!open) {
            resetFormFields();
            setModalErrors("");
        }
        onOpenChange(open);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-2">
            {showAlert && (
                <div className="fixed top-4 right-4 z-50">
                    <Alert 
                        className="max-w-md"
                        variant="solid"
                        color="success"
                        onClose={() => setShowAlert(false)}
                    >
                        <div className="font-medium text-sm">Client user account created successfully!</div>
                        <div className="text-sm">{password}</div>
                        <div className="text-xs mt-1">
                            {emailSent 
                                ? "An email containing the password has been sent to the client." 
                                : "Warning: Failed to send password email to the client."}
                        </div>
                    </Alert>
                </div>
            )}

            <h2 className="text-4xl font-bold mb-6 mt-8 text-center">User List</h2>

            <Input
                isClearable
                className="w-full max-w-3xl mb-6"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={()  => setSearchQuery("")}
                startContent={<Search className="text-gray-400 w-5 h-5" />}
                classNames={{
                    clearButton: "opacity-100"
                }}
            />

            <div className="w-full max-w-7xl mx-auto rounded-lg p-4 mb-6 bg-white shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh]">
                    <div className="flex flex-col overflow-hidden border rounded h-[60vh]">
                        <div className="bg-white z-10 p-4 sticky top-0">
                            <h3 className="text-xl font-semibold text-center">Clients</h3>
                            <hr className="mt-2 border-gray-300" />
                        </div>

                        <div className="overflow-y-auto px-4 pb-4">
                            {usersByRole.clients.length === 0 ? (
                                <p className="text-gray-500 text-center">No clients found.</p>
                            ) : (
                                usersByRole.clients.map((client) => (
                                    <Card
                                        key={client._id}
                                        isPressable
                                        onPress={() => navigate(`/projects?clientId=${client._id}`)}
                                        className="rounded-lg shadow-md w-full mb-4 bg-gray-50 hover:bg-gray-200 border border-gray-100"
                                    >
                                        <CardBody className="p-6">
                                            <h3 className="font-medium text-xl mb-2">Username: {client.username}</h3>
                                            <p className="text-sm mt-1">Email: {client.email}</p>
                                        </CardBody>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col overflow-hidden border rounded h-[60vh]">
                        <div className="bg-white z-10 p-4 sticky top-0">
                            <h3 className="text-xl font-semibold text-center">Field Staff</h3>
                            <hr className="mt-2 border-gray-300" />
                        </div>

                        <div className="overflow-y-auto px-4 pb-4">
                            {usersByRole.staff.length === 0 ? (
                                <p className="text-gray-500 text-center">No field staff found.</p>
                            ) : (
                                usersByRole.staff.map((staff) => (
                                    <Card
                                        key={staff._id}
                                        isPressable
                                        onPress={() => navigate(`/unauthorized`)}
                                        className="rounded-lg shadow-md w-full mb-4 bg-gray-50 hover:bg-gray-200 border border-gray-100"
                                    >
                                        <CardBody className="p-6">
                                            <h3 className="font-medium text-xl mb-2">Username: {staff.username}</h3>
                                            <p className="text-sm mt-1">Email: {staff.email}</p>
                                        </CardBody>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex space-x-4">
                <Button
                    className="text-lg py-2 px-4 flex items-center gap-2"
                    onPress={onOpen}
                    size="md"
                    radius="large"
                    color="primary"
                >
                    <UserPlus className="w-5 h-5" />
                    Add User
                </Button>
                <Button
                    className="text-lg py-2 px-4 flex items-center gap-2"
                    onPress={logout}
                    size="md"
                    radius="large"
                    color="danger"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </Button>
            </div>

            <Modal isOpen={isOpen} onOpenChange={handleOpenChange} placement="center" size="md">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Add Client</ModalHeader>
                            {modalErrors && (
                                <div className="px-6">
                                    <Alert
                                        className="mb-4"
                                        variant="solid"
                                        color="danger"
                                        onClose={() => setModalErrors("")}
                                    >
                                        <div className="font-medium text-sm">{modalErrors}</div>
                                        <div className="text-xs mt-1">Please try again.</div>
                                    </Alert>
                                </div>
                            )}
                            <Form 
                                validationBehavior="aria"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!isValidEmail(email)) {
                                        setModalErrors("Please enter a valid email address");
                                        return;
                                    }
                                    createUser();
                                }}
                                className="w-full"
                            >
                            <ModalBody className="gap-4">
                                <Input
                                    isRequired
                                    label="Username"
                                    labelPlacement="outside"
                                    placeholder="Enter username"
                                    variant="bordered"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    classNames={{
                                        inputWrapper: "w-full"
                                    }}
                                />
                                <Input
                                    isRequired
                                    label="Email"
                                    labelPlacement="outside"
                                    placeholder="Enter email"
                                    variant="bordered"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isInvalid={email !== "" && !isValidEmail(email)}
                                    errorMessage={email !== "" && !isValidEmail(email) ? "Please enter a valid email address" : ""}
                                    aria-invalid={email !== "" && !isValidEmail(email)}
                                    aria-errormessage="email-error"
                                    classNames={{
                                        inputWrapper: "w-full"
                                    }}
                                />
                                <Input
                                    isRequired
                                    label="Phone Number"
                                    labelPlacement="outside"
                                    placeholder="Enter phone number"
                                    variant="bordered"
                                    type="tel"
                                    maxLength="10"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    classNames={{
                                        inputWrapper: "w-full"
                                    }}
                                />
                                <RadioGroup
                                    label="Select User Type"
                                    orientation="horizontal"
                                    value={userType}
                                    onValueChange={setUserType}
                                >
                                    <Radio value="client">Client</Radio>
                                    <Radio value="field staff">Field Staff</Radio>
                                </RadioGroup>
                            </ModalBody>
                            <ModalFooter className="flex justify-end">
                                <Button type="submit" color="primary">
                                    Add
                                </Button>
                            </ModalFooter>
                            </Form>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};