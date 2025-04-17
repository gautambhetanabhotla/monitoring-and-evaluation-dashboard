import React, { useState, useEffect, useContext, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Alert } from "@heroui/alert";
import { Form } from "@heroui/form";
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
            console.error("Error fetching clients:", data.message);
            return [];
        }
        return data.clients.map(({ username, email, _id }) => ({
            username,
            email,
            _id
        }));
    } catch (error) {
        console.error("Error fetching clients:", error);
        return [];
    }
};

export const ClientGallery = () => {
    const [clientList, setClientList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const { logout } = useContext(AuthContext);
    const [modalErrors, setModalErrors] = useState("");

    const resetFormFields = () => {
        setUsername("");
        setEmail("");
        setPhoneNumber("");
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

    const createClient = async () => {
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
                    role: 'client',
                    phone_number: phoneNumber
                })
            });
    
            const data = await response.json();
            if (data.success) {
                const updatedClients = await getAllClients();
                setClientList(updatedClients);

                setPassword(`Generated password: ${pwd}`);
                setShowAlert(true);
                
                setTimeout(() => {
                    setShowAlert(false);
                    setPassword("");
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

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-6">
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
                        <div className="text-xs mt-1">This password will only be shown once. Please copy it now.</div>
                    </Alert>
                </div>
            )}

            <h2 className="text-4xl font-bold mb-6 mt-8 text-center">Client List</h2>

            <Input
                isClearable
                className="w-full max-w-3xl mb-6"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={handleClearSearch}
                startContent={<i className="fas fa-search text-gray-400" />}
                classNames={{
                    clearButton: "opacity-100"
                }}
            />

            <div className="w-full max-w-3xl h-[60vh] overflow-y-auto border-2 border-cyan-800 rounded-lg p-4 mb-6 bg-white">
                <div className="flex flex-col space-y-4">
                    {filteredClients.length === 0 ? (
                        <p className="text-xl text-gray-500 text-center">
                            {searchQuery ? "No matching clients found." : "No clients found."}
                        </p>
                    ) : (
                        filteredClients.map((client) => (
                            <Card
                                key={client._id}
                                isPressable
                                onPress={() => navigate(`/projects?clientId=${client._id}`)}
                                className="border-2 rounded-lg shadow-md w-full border-cyan-800 hover:bg-gray-50"
                            >
                                <CardBody className="p-6">
                                    <h3 className="font-medium text-xl mb-2">Username: {client.username}</h3>
                                    <p>Email: {client.email}</p>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <div className="flex space-x-4">
                <Button
                    className="text-xl font-bold py-2 px-4"
                    onPress={onOpen}
                    size="md"
                    radius="large"
                    color="primary"
                >
                    Add Client
                </Button>
                <Button
                    className="text-xl font-bold py-2 px-4"
                    onPress={logout}
                    size="md"
                    radius="large"
                    color="primary"
                >
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
                                    createClient();
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