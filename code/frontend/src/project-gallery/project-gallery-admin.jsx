import React, { useState, useEffect, useContext } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Alert } from "@heroui/alert";
import { AuthContext } from "../AuthContext";

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
    const navigate = useNavigate();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const { logout } = useContext(AuthContext);

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

    const createClient = async () => {
        try {
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
                console.error("Adding client failed:", data.message);
            }
        } catch (error) {
            console.error("Error creating client:", error);
        }
    };

    const handleOpenChange = (open) => {
        if (!open) {
            resetFormFields();
        }
        onOpenChange(open);
    };

    return (
        <div className="flex flex-col h-screen">
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

            <div className="flex-none p-6 z-10 border-b border-cyan-800">
                <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-bold">Client List</h2>
                    <div className="flex space-x-4">
                        <Button
                            className="text-xl font-bold py-2 px-4 text-black"
                            onPress={onOpen}
                            size="md"
                            radius="large"
                            color="primary"
                        >
                            Add Client
                        </Button>
                        <Button
                            className="text-xl font-bold py-2 px-4 text-black"
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
                                    <ModalBody>
                                    <Input
                                        isRequired
                                        label="Username"
                                        labelPlacement="outside"
                                        placeholder="Enter username"
                                        variant="bordered"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <Input
                                        isRequired
                                        label="Email"
                                        labelPlacement="outside"
                                        placeholder="Enter email"
                                        variant="bordered"
                                        type="email"
                                        errorMessage="Please enter a valid email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Input
                                        isRequired
                                        label="Phone Number"
                                        labelPlacement="outside"
                                        placeholder="Enter phone number"
                                        variant="bordered"
                                        type="tel"
                                        maxLength="10"
                                        errorMessage="Please enter a valid phone number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary" onPress={createClient}>
                                            Add
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-4">
                <div className="flex flex-col space-y-4">
                    {clientList.length === 0 ? (
                        <p className="text-xl text-gray-500">No clients found.</p>
                    ) : (
                        clientList.map((client) => (
                            <Card
                                key={client._id}
                                isPressable
                                onPress={() => navigate(`/projects?clientId=${client._id}`)}
                                className="border rounded-lg shadow-md w-full border-cyan-800"
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
        </div>
    );
};