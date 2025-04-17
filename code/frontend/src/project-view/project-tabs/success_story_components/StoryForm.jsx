import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';

export function StoryForm({ story, onSubmit, onClose, projectid }) {
  const [name, setName] = useState(story?.name || '');
  const [id, setId] = useState(story?.id || '');
  const [location, setLocation] = useState(story?.location || '');
  const [text, setText] = useState(story?.text || '');
  const [images, setImages] = useState(story?.images || []);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [hasTextFile, setHasTextFile] = useState(false);
  const textFileInputRef = useRef(null);
  const imageFileInputRef = useRef(null);

  const isSubmitDisabled = !name.trim() || (!text.trim() && images.length === 0);

  const handleTextFileUpload = (files) => {
    const file = files?.[0];
    if (file && text.trim() === '') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target?.result);
        setHasTextFile(true);
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveTextFile = () => {
    setText('');
    setHasTextFile(false);
    if (textFileInputRef.current) {
      textFileInputRef.current.value = '';
    }
  };

  const handleImageUpload = (files) => {
    if (files) {
      const fileArray = Array.from(files);
      const readers = fileArray.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({ name: file.name, type: file.type, data: e.target.result });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file); 
        });
      });
  
      Promise.all(readers).then(results => {
        setImages(prev => [...prev, ...results]);
      });
    }
  };
  

  const handleDragOver = (e, type) => {
    e.preventDefault();
    if (type === 'text' && text.trim() === '') setIsDraggingText(true);
    else if (type === 'image') setIsDraggingImage(true);
  };

  const handleDragLeave = (type) => {
    if (type === 'text') setIsDraggingText(false);
    else setIsDraggingImage(false);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDraggingText(false);
    setIsDraggingImage(false);
    
    const files = e.dataTransfer.files;
    if (type === 'text' && text.trim() === '') handleTextFileUpload(files);
    else if (type === 'image') handleImageUpload(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storypayload = {
      id,
      projectid,
      name,
      location,
      text,
      images,
      date: story?.date || new Date().toISOString()
    };
    onSubmit(storypayload);
    onClose();
  };
  

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (hasTextFile && e.target.value.trim() === '') {
      setHasTextFile(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{story ? 'Edit Story' : 'Add New Success Story'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Text</label>
            <div 
              className={`relative border-2 border-dashed rounded-lg ${isDraggingText ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragOver={(e) => handleDragOver(e, 'text')}
              onDragLeave={() => handleDragLeave('text')}
              onDrop={(e) => handleDrop(e, 'text')}
            >
              <textarea
                value={text}
                onChange={handleTextChange}
                className="w-full px-3 py-2 rounded-md h-32"
                placeholder="Type your story or drag & drop a text file"
              />
              <div className="p-4 text-center">
                <input
                  ref={textFileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleTextFileUpload(e.target.files)}
                  className="hidden"
                />
                <div className="flex justify-center gap-2">
                  {text.trim() === '' ? (
                    <button
                      type="button"
                      onClick={() => textFileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                    >
                      <Upload size={16} className="mr-2" />
                      Choose a text file
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemoveTextFile}
                      className="inline-flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Clear text
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${isDraggingImage ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragOver={(e) => handleDragOver(e, 'image')}
              onDragLeave={() => handleDragLeave('image')}
              onDrop={(e) => handleDrop(e, 'image')}
            >
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageFileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <Upload size={16} className="mr-2" />
                Choose images or drag & drop them here
              </button>
            </div>
            
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url.data}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`px-4 py-2 text-white rounded-md ${
                isSubmitDisabled 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {story ? 'Update Story' : 'Submit Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}