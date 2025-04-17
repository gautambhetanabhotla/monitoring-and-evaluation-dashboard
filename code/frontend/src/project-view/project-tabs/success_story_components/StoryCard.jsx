import React from 'react';
import { useState, useEffect } from 'react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';

export function StoryCard({ story, onEdit, onDelete }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
    const fetchUserDetails = async () => {
        try {
        const response = await fetch(`/api/user/getUser`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            setUser(data.user);
        } else {
            alert(data.message);
        }
        } catch (error) {
        console.error('Error fetching user details:', error);
        }
    };
    
    fetchUserDetails();
    }, []);
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex-1">
            <h3 className="text-2xl font-bold pr-24">{story.name}</h3>
            <div className="flex items-center text-gray-600 mt-2">
              <MapPin size={16} className="mr-1" />
              <span className="text-sm">{story.location}</span>
            </div>
          </div>
          {user && user.role === 'admin' && (
          <div className="absolute top-0 right-0 flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
            )}
        </div>
        
        {story.images.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mb-6">
            <div className={`grid ${story.images.length > 1 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-4`}>
              {story.images.map((image, index) => (
                <div key={index} className="relative aspect-[4/3] max-h-[300px]">
                  <img
                    src={image.data}
                    alt={`${story.name}'s story image ${index + 1}`}
                    className="w-full h-full object-contain rounded-lg bg-gray-50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{story.text}</p>
        
        <div className="mt-6 text-sm text-gray-500">
          {new Date(story.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}