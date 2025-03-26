import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const [letter, setLetter] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [currentDraft, setCurrentDraft] = useState(null);
  const [message, setMessage] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const loadDrafts = () => {
    try {
      const savedDrafts = localStorage.getItem('drafts');
      if (savedDrafts) {
        const parsedDrafts = JSON.parse(savedDrafts);
        if (Array.isArray(parsedDrafts)) {
          setDrafts(parsedDrafts);
          
        } else {
          console.warn('Parsed drafts are not an array:', parsedDrafts);
          setDrafts([]);
        }
      } else {
        console.log('No drafts found in localStorage.');
        setDrafts([]);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  useEffect(() => {
   
    loadDrafts();
  }, []);

  useEffect(() => {
    const saveDrafts = () => {
      try {
        localStorage.setItem('drafts', JSON.stringify(drafts));
      } catch (error) {
        console.error('Error saving drafts:', error);
      }
    };

    if (drafts.length > 0) {
      saveDrafts();
    }
  }, [drafts]);

  const handleSaveDraft = () => {
    if (!letter.trim()) {
      setMessage('Cannot save an empty draft.');
      return;
    }

    const newDraft = {
      id: Date.now(),
      content: letter,
      preview: letter.substring(0, 30) + (letter.length > 30 ? '...' : ''),
      updatedAt: new Date().toLocaleString()
    };

    setDrafts([newDraft, ...drafts]);
    setLetter('');
    setCurrentDraft(null);
    setMessage('Draft saved successfully.');
    setTimeout(() => setMessage(''), 3000);
  };


    const handleUpdateDraft = () => {
      if (!letter.trim() || !currentDraft) {
        setMessage('Cannot update with empty content.');
        return;
      }
      const updatedDrafts = drafts.map(draft =>
        draft.id === currentDraft
          ? {
            ...draft,
            content: letter,
            preview: letter.substring(0, 30) + (letter.length > 30 ? '...' : ''),
            updatedAt: new Date().toLocaleString()
          }
          : draft
      );
      setDrafts(updatedDrafts);
      setMessage('Draft updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    };
  
    const handleLoadDraft = (draft) => {
      setLetter(draft.content);
      setCurrentDraft(draft.id);
      setMessage('');
      loadDrafts();
    };
  
    const handleDeleteDraft = (draftId) => {
      setDrafts(drafts.filter((draft) => draft.id !== draftId));
      if (currentDraft === draftId) {
        setLetter('');
        setCurrentDraft(null);
      }
      setMessage('Draft deleted.');
      setTimeout(() => setMessage(''), 3000);
    };
  
    const handleUploadToDrive = async () => {
      if (!letter.trim()) {
        setMessage('Cannot upload an empty letter.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      try {
        const response = await axios.post('http://localhost:3200/api/upload', { content: letter });
        if (response.status === 200) {
          setMessage('Letter uploaded to Google Drive successfully!');
          setLetter('');
          setCurrentDraft(null);
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error uploading letter:', error);
        setMessage('Failed to upload letter. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    };
  
    useEffect(() => {
      const fetchSavedLetters = async () => {
        if (!currentUser) {
          console.log('No user logged in - showing local drafts only');
          return;
        }
  
        try {
          let response;
          if (currentUser.googleAuth) {
            response = await axios.get('http://localhost:3200/api/list-files-oauth');
          } else {
            response = await axios.get('http://localhost:3200/api/list-files', {
              headers: {
                Authorization: `Bearer ${currentUser.accessToken}`
              }
            });
          }
          const cloudDrafts = response.data.files.map(file => ({
            id: file.id,
            name: file.name,
            webViewLink: file.webViewLink,
            lastModified: file.modifiedTime
          }));
  
          setDrafts(prevDrafts => {
            const uniqueLocalDrafts = prevDrafts.filter(localDraft => 
              !cloudDrafts.some(cloudDraft => cloudDraft.id === localDraft.id)
            );
            return [...cloudDrafts, ...uniqueLocalDrafts];
          });
        } catch (error) {
          console.error('Error fetching cloud drafts:', error);
          setMessage('Failed to fetch cloud drafts. Showing local drafts only.');
        }
      };
  
      fetchSavedLetters();
    }, [currentUser]);
  
    useEffect(() => {
      console.log('Current User:', currentUser);
    }, [currentUser]);
  
    const toggleBold = () => {
      setIsBold(!isBold);
    };
  
    const toggleItalic = () => {
      setIsItalic(!isItalic);
    };
  
    if (!currentUser) {
      return <div>Please log in to access your drafts.</div>;
    }


  return (
    <div className="letter-editor" style={{ width: '100%', padding: '10%' }}>
      <h2 style={{ textAlign: 'center', color: 'white' }}>Text Editor</h2>

      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={toggleBold}
          style={{
            fontWeight: 'bold',
            padding: '5px 10px',
            background: isBold ? '#ddd' : '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          B
        </button>
        <button
          onClick={toggleItalic}
          style={{
            fontStyle: 'italic',
            padding: '5px 10px',
            background: isItalic ? '#ddd' : '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          I
        </button>
      </div>

      <textarea
        value={letter}
        onChange={(e) => setLetter(e.target.value)}
        placeholder="Write your text here..."
        rows="15"
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          fontFamily: 'Arial, sans-serif',
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          marginBottom: '15px',
          boxSizing: 'border-box'
        }}
      />

      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center'
      }}>
        {currentDraft ? (
          <>
            <button
              onClick={handleUpdateDraft}
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Update Draft
            </button>
            <button
              onClick={() => {
                setLetter('');
                setCurrentDraft(null);
              }}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel Edit
            </button>
          </>
        ) : (
          <button
            onClick={handleSaveDraft}
            style={{
              padding: '8px 16px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save as New Draft
          </button>
        )}
        <button
          onClick={handleUploadToDrive}
          style={{
            padding: '8px 16px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Upload to Google Drive
        </button>
      </div>

      {message && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          background: message.includes('success') ? '#dff0d8' : '#f8d7da',
          color: message.includes('success') ? '#3c763d' : '#721c24',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {drafts.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Your Drafts</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px',
            marginTop: '15px'
          }}>
            {drafts.map((draft) => (
              <div
                key={draft.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '15px',
                  background: currentDraft === draft.id ? '#f0f7ff' : '#fff'
                }}
              >
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '10px',
                  color: 'black'
                }}>
                  Last updated: {draft.lastModified || draft.updatedAt}
                </div>
                <p style={{
                  marginBottom: '15px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'black'
                }}>
                  {draft.preview || draft.name}
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {draft.content ? (
                    <>
                      <button
                        onClick={() => handleLoadDraft(draft)}
                        style={{
                          padding: '5px 10px',
                          background: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(draft.id)}
                        style={{
                          padding: '5px 10px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <a
                      href={draft.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '5px 10px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      View Letter
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;