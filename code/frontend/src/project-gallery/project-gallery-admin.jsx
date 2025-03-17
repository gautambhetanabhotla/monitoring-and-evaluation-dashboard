import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

const getAllClients = async () => {
    try {
        const response = await fetch("http://localhost:5011/api/user/clients", {
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
}

export const ClientGallery = () => {
    const [clientList, setClientList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            const clients = await getAllClients();
            setClientList(clients);
        }
        fetchClients();
    }, []);

    const logout = async () => {
        try {
            const response = await fetch("http://localhost:5011/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
    
            const data = await response.json();
            if (data.success) {
                navigate("/"); 
            } else {
                console.error("Logout failed:", data.message);
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen p-6">
            {/* Header with title and logout button */}
            <div className="flex justify-between mb-6 items-center">
                <h2 className="text-3xl font-bold">Client List</h2>
                <Button
                    className="text-xl font-bold py-2 px-4 bg-amber-300 text-black"
                    onPress={logout}
                    size="md"
                    radius="large"
                >
                    Logout
                </Button>
            </div>

            {/* Client cards stacked vertically with full width */}
            <div className="flex flex-col space-y-4 overflow-y-auto">
                {clientList.length === 0 ? (
                    <p className="text-xl text-gray-500">No clients found.</p>
                ) : (
                    clientList.map((client) => (
                        <Card
                            key={client._id}
                            isPressable
                            onPress={() => navigate(`/projects?clientId=${client._id}`)}
                            className="border border-amber-400 p-4 rounded-lg shadow-md w-full"
                        >
                            <CardBody>
                                <h3 className="font-medium">Username: {client.username}</h3>
                                <p>Email: {client.email}</p>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
