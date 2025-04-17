import React, { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { StoryForm } from './success_story_components/StoryForm';
import { StoryCard } from './success_story_components/StoryCard';

function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStoryIndex, setEditingStoryIndex] = useState(null);
  const { projectid } = useParams();

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
  
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch(`/api/success-story/get-success-stories/${projectid}`)
        const data = await response.json();
        if (data.success) {
          // data.data is an array of success stories
          const formattedStories = data.data.map(item => {
            return {
              id: item._id,
              name: item.name,
              location: item.location,
              text: item.text,
              images: item.images,
              date: item.date,
            };
          });
          setStories(formattedStories);
        } else {
          setStories([]);      
        }
      } catch (error) {
        console.error('Error fetching success stories:', error);
        setStories([]);
      }
    };
    fetchStories();
  }, [projectid]);

  const handleAddStory = async (storyData) => {
    const { id, ...storypayload } = storyData;
    const response = await fetch('/api/success-story/save-success-story', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(storypayload),
    });
    if(response.ok) {
      const data = await response.json();
      const newid = data.id;
      const newStory = {
          id: newid,
          ...storypayload,
      };
      setStories(prev => [newStory, ...prev]);
    }
  };

  const handleUpdateStory = async (updatedStory) => {
    const { id, ...storypayload } = updatedStory;
    const response = await fetch(`/api/success-story/update-success-story/${updatedStory.id}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(storypayload),
    });
    setStories(prev => prev.map((story, index) => 
      index === editingStoryIndex ? updatedStory : story
    ));
    setEditingStoryIndex(null);
  };

  const handleDeleteStory = (index) => {
    const response = fetch(`/api/success-story/delete-success-story/${stories[index].id}`, {
      method: 'DELETE',
    });
    setStories(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditClick = (index) => {
    setEditingStoryIndex(index);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Success Stories</h1>
          {user && user.role === 'admin' && (
          <button
            onClick={() => {
              setEditingStoryIndex(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusCircle size={20} />
            Add New Story
          </button>
          )}
        </div>

        {stories.length === 0 ? (
          user?.role === 'admin' ? (
            <div className="empty-state">
              { user?.role === 'admin' &&
                <div className="empty-icon-container">
                  <PlusCircle size={48} className="empty-icon" />
                </div>
              }
              { user?.role === 'admin' &&
                <p className="empty-text">No Success Stories Yet</p>
              }
              { user?.role === 'admin' &&
                <button
                  onClick={() => {
                    setEditingStoryIndex(null);
                    setIsFormOpen(true);
                  }}
                  className="btn btn-primary"
                >
                  Add The First Success Story
                </button>
              }
            </div>
          ) : (
            <p className='empty-text'>No Success Stories Yet</p>
          )
        ) : (
          <div className="space-y-8">
            {stories.map((story, index) => (
              <StoryCard 
                key={index}
                story={story} 
                onEdit={() => handleEditClick(index)}
                onDelete={() => handleDeleteStory(index)}
              />
            ))}
          </div>
        )}

        {isFormOpen && (
          <StoryForm
            story={editingStoryIndex !== null ? stories[editingStoryIndex] : null}
            onSubmit={editingStoryIndex !== null ? handleUpdateStory : handleAddStory}
            onClose={() => {
              setIsFormOpen(false);
              setEditingStoryIndex(null);
            }}
            projectid={projectid}
          />
        )}
      </div>
    </div>
  );
}

export default SuccessStories;