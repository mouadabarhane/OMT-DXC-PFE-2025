import { useState, useEffect, useRef } from 'react';
import { RiSendPlaneLine, RiRobot2Line, RiCloseLine, RiAlertLine, RiEmotionLine, RiImageLine } from 'react-icons/ri';
import { FaBrain } from 'react-icons/fa';

export default function VirtualAgent({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('gemini');
  const [error, setError] = useState(null);
  const [conversationState, setConversationState] = useState({
    stage: 'initial',
    selectedCategory: null,
    selectedAction: null,
    selectedItem: null,
    currentField: null,
    collectedFields: {},
    requiredFields: [],
    updateFields: [],
    collectedUpdateValues: {}
  });

  // Auto-scroll on message update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation based on model
  useEffect(() => {
    if (activeModel === 'gemini') {
      setMessages([{ 
        from: 'agent', 
        text: "👋 Hi! I'm your Product AI Assistant. How can I help with your product management today?" 
      }]);
      setConversationState({
        stage: 'initial',
        selectedCategory: null,
        selectedAction: null,
        selectedItem: null
      });
    } else {
      setMessages([{ 
        from: 'agent', 
        text: "👋 Hi! I'm your Product Management Assistant. What would you like help with today?",
        options: [
          { text: '📦 Product Offerings', value: 'product_offerings' },
          { text: '📑 Product Specifications', value: 'product_specifications' },
          { text: '⚠️ Issues', value: 'issues' },
          { text: '❓ Something Else', value: 'other' }
        ]
      }]);
      setConversationState({
        stage: 'category_selection',
        selectedCategory: null,
        selectedAction: null,
        selectedItem: null
      });
    }
  }, [activeModel]);

  const startSession = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/va/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start session');
      }

      if (data.result?.session_id) {
        setSessionId(data.result.session_id);
      } else {
        throw new Error('No session ID received');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          type: 'image',
          url: reader.result
        });
      };
      reader.readAsDataURL(file);
    } else {
      setError('Only image files are supported');
    }
  };

  const addEmoji = (emoji) => {
    setInput(prev => prev + emoji);
  };

  const handleServiceNowAction = async (userInput) => {
    try {
      setIsLoading(true);
      let response;
      
      switch (conversationState.stage) {
        case 'category_selection':
          const selectedCategory = userInput.toLowerCase();
          if (['product_offerings', 'product_specifications', 'issues'].includes(selectedCategory)) {
            setConversationState({
              ...conversationState,
              stage: 'action_selection',
              selectedCategory: selectedCategory
            });
            
            setMessages(prev => [...prev, {
              from: 'agent',
              text: `What action would you like to perform on ${selectedCategory.replace('_', ' ')}?`,
              options: [
                { text: '➕ Create', value: 'create' },
                { text: '✏️ Update', value: 'update' },
                { text: '❌ Delete', value: 'delete' },
                { text: '📄 View Details', value: 'view' }
              ]
            }]);
          } else {
            setMessages(prev => [...prev, {
              from: 'agent',
              text: "I can help you with Product Offerings, Product Specifications, or Issues. Which one would you like?",
              options: [
                { text: '📦 Product Offerings', value: 'product_offerings' },
                { text: '📑 Product Specifications', value: 'product_specifications' },
                { text: '⚠️ Issues', value: 'issues' }
              ]
            }]);
          }
          break;
          
        case 'action_selection':
          const selectedAction = userInput.toLowerCase();
          if (['create', 'update', 'delete', 'view'].includes(selectedAction)) {
            setConversationState({
              ...conversationState,
              stage: 'action_execution',
              selectedAction: selectedAction
            });
            
            if (conversationState.selectedCategory === 'product_specifications') {
              if (selectedAction === 'create') {
                setConversationState({
                  ...conversationState,
                  stage: 'collecting_spec_fields',
                  currentField: 'u_name',
                  collectedFields: {},
                  requiredFields: [
                    'u_name', 'u_description', 'u_version', 
                    'u_valid_from', 'u_valid_to'
                  ]
                });
                
                setMessages(prev => [...prev, {
                  from: 'agent',
                  text: "Please provide the name (u_name) for the product specification:"
                }]);
              } else {
                response = await fetch('http://localhost:3000/product-specifications');
                const specs = await response.json();
                
                if (specs.length > 0) {
                  setMessages(prev => [...prev, {
                    from: 'agent',
                    text: `Select the product specification you want to ${selectedAction}:`,
                    items: specs.map(spec => ({
                      id: spec.sys_id,
                      name: spec.u_name,
                      description: spec.u_description || 'No description available'
                    }))
                  }]);
                  
                  setConversationState({
                    ...conversationState,
                    stage: 'item_selection',
                    selectedAction: selectedAction
                  });
                } else {
                  setMessages(prev => [...prev, {
                    from: 'agent',
                    text: "No product specifications found. Would you like to create one?",
                    options: [
                      { text: 'Yes', value: 'yes_create' },
                      { text: 'No', value: 'no_create' }
                    ]
                  }]);
                }
              }
            } 
            else if (conversationState.selectedCategory === 'product_offerings') {
              if (selectedAction === 'create') {
                response = await fetch('http://localhost:3000/product-specifications');
                const specs = await response.json();
                
                if (specs.length > 0) {
                  setMessages(prev => [...prev, {
                    from: 'agent',
                    text: "Select the product specification this offering is based on:",
                    items: specs.map(spec => ({
                      id: spec.sys_id,
                      name: spec.u_name,
                      description: spec.u_description || 'No description available'
                    }))
                  }]);
                  
                  setConversationState({
                    ...conversationState,
                    stage: 'collecting_offering_ref',
                    selectedAction: selectedAction,
                    collectedFields: {}
                  });
                } else {
                  setMessages(prev => [...prev, {
                    from: 'agent',
                    text: "No product specifications found. You must create a product specification first.",
                    options: [
                      { text: 'Create Product Specification', value: 'product_specifications' },
                      { text: 'Cancel', value: 'cancel' }
                    ]
                  }]);
                }
              } else {
                response = await fetch('http://localhost:3000/product-offerings');
                const offerings = await response.json();
                
                if (offerings.length > 0) {
                  setMessages(prev => [...prev, {
                    from: 'agent',
                    text: `Select the product offering you want to ${selectedAction}:`,
                    items: offerings.map(offering => ({
                      id: offering.sys_id,
                      name: offering.u_name,
                      description: `Price: ${offering.u_price} | Category: ${offering.u_category}`
                    }))
                  }]);
                  
                  setConversationState({
                    ...conversationState,
                    stage: 'item_selection',
                    selectedAction: selectedAction
                  });
                } else {
                  setMessages(prev => [...prev, {
                    from: 'agent',
                    text: "No product offerings found. Would you like to create one?",
                    options: [
                      { text: 'Yes', value: 'yes_create' },
                      { text: 'No', value: 'no_create' }
                    ]
                  }]);
                }
              }
            }
          }
          break;
          
        case 'collecting_spec_fields':
          const { currentField, requiredFields, collectedFields } = conversationState;
          const updatedFields = { ...collectedFields, [currentField]: userInput };
          
          const currentIndex = requiredFields.indexOf(currentField);
          const nextField = requiredFields[currentIndex + 1];
          
          if (nextField) {
            setConversationState({
              ...conversationState,
              currentField: nextField,
              collectedFields: updatedFields
            });
            
            setMessages(prev => [...prev, {
              from: 'agent',
              text: `Please provide the ${nextField.replace('u_', '')}:`
            }]);
          } else {
            response = await fetch('http://localhost:3000/product-specifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedFields)
            });
            
            if (response.ok) {
              const createdSpec = await response.json();
              setMessages(prev => [...prev, {
                from: 'agent',
                text: `✅ Successfully created product specification "${createdSpec.u_name}"!`,
                options: [
                  { text: '⭐️⭐️⭐️⭐️⭐️', value: '5_stars' },
                  { text: '⭐️⭐️⭐️⭐️', value: '4_stars' },
                  { text: '⭐️⭐️⭐️', value: '3_stars' },
                  { text: '⭐️⭐️', value: '2_stars' },
                  { text: '⭐️', value: '1_star' }
                ]
              }]);
            } else {
              throw new Error('Failed to create product specification');
            }
            
            setConversationState({
              stage: 'initial',
              selectedCategory: null,
              selectedAction: null,
              selectedItem: null
            });
          }
          break;
          
        case 'collecting_offering_ref':
          const specResponse = await fetch(`http://localhost:3000/product-specifications/${userInput}`);
          const selectedSpec = await specResponse.json();
          
          setConversationState({
            ...conversationState,
            stage: 'collecting_offering_fields',
            currentField: 'u_name',
            collectedFields: {
              u_product_specification: selectedSpec.sys_id,
              u_specification_name: selectedSpec.u_name
            },
            requiredFields: [
              'u_name', 'u_price', 'u_category', 'u_unit_of_measure',
              'u_channel', 'u_status', 'u_external_id', 'u_valid_from', 'u_valid_to'
            ]
          });
          
          setMessages(prev => [...prev, {
            from: 'agent',
            text: `Creating product offering based on "${selectedSpec.u_name}". Please provide the name (u_name):`
          }]);
          break;
          
        case 'collecting_offering_fields':
          const { currentField: currentOfferingField, requiredFields: offeringRequiredFields, 
                collectedFields: offeringCollectedFields } = conversationState;
          const updatedOfferingFields = { ...offeringCollectedFields, [currentOfferingField]: userInput };
          
          const currentOfferingIndex = offeringRequiredFields.indexOf(currentOfferingField);
          const nextOfferingField = offeringRequiredFields[currentOfferingIndex + 1];
          
          if (nextOfferingField) {
            setConversationState({
              ...conversationState,
              currentField: nextOfferingField,
              collectedFields: updatedOfferingFields
            });
            
            setMessages(prev => [...prev, {
              from: 'agent',
              text: `Please provide the ${nextOfferingField.replace('u_', '')}:`
            }]);
          } else {
            response = await fetch('http://localhost:3000/product-offerings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedOfferingFields)
            });
            
            if (response.ok) {
              const createdOffering = await response.json();
              setMessages(prev => [...prev, {
                from: 'agent',
                text: `✅ Successfully created product offering "${createdOffering.u_name}"!`,
                options: [
                  { text: '⭐️⭐️⭐️⭐️⭐️', value: '5_stars' },
                  { text: '⭐️⭐️⭐️⭐️', value: '4_stars' },
                  { text: '⭐️⭐️⭐️', value: '3_stars' },
                  { text: '⭐️⭐️', value: '2_stars' },
                  { text: '⭐️', value: '1_star' }
                ]
              }]);
            } else {
              throw new Error('Failed to create product offering');
            }
            
            setConversationState({
              stage: 'initial',
              selectedCategory: null,
              selectedAction: null,
              selectedItem: null
            });
          }
          break;
          
        case 'item_selection':
          if (conversationState.selectedCategory === 'product_specifications') {
            if (conversationState.selectedAction === 'view') {
              response = await fetch(`http://localhost:3000/product-specifications/${userInput}`);
              const spec = await response.json();
              
              let details = `📋 Product Specification Details:\n`;
              details += `• Name: ${spec.u_name}\n`;
              details += `• Description: ${spec.u_description}\n`;
              details += `• Version: ${spec.u_version}\n`;
              details += `• Valid From: ${spec.u_valid_from}\n`;
              details += `• Valid To: ${spec.u_valid_to}\n`;
              
              setMessages(prev => [...prev, {
                from: 'agent',
                text: details,
                options: [
                  { text: '⭐️⭐️⭐️⭐️⭐️', value: '5_stars' },
                  { text: '⭐️⭐️⭐️⭐️', value: '4_stars' },
                  { text: '⭐️⭐️⭐️', value: '3_stars' },
                  { text: '⭐️⭐️', value: '2_stars' },
                  { text: '⭐️', value: '1_star' }
                ]
              }]);
            } 
            else if (conversationState.selectedAction === 'delete') {
              response = await fetch(`http://localhost:3000/product-specifications/${userInput}`, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                setMessages(prev => [...prev, {
                  from: 'agent',
                  text: "✅ Product specification deleted successfully!",
                  options: [
                    { text: '⭐️⭐️⭐️⭐️⭐️', value: '5_stars' },
                    { text: '⭐️⭐️⭐️⭐️', value: '4_stars' },
                    { text: '⭐️⭐️⭐️', value: '3_stars' },
                    { text: '⭐️⭐️', value: '2_stars' },
                    { text: '⭐️', value: '1_star' }
                  ]
                }]);
              } else {
                throw new Error('Failed to delete product specification');
              }
            } 
            else if (conversationState.selectedAction === 'update') {
              setConversationState({
                ...conversationState,
                stage: 'update_spec_fields',
                selectedItem: userInput,
                updateFields: []
              });
              
              setMessages(prev => [...prev, {
                from: 'agent',
                text: "Which fields would you like to update? (Select all that apply)",
                options: [
                  { text: 'Name (u_name)', value: 'u_name' },
                  { text: 'Description (u_description)', value: 'u_description' },
                  { text: 'Version (u_version)', value: 'u_version' },
                  { text: 'Valid From (u_valid_from)', value: 'u_valid_from' },
                  { text: 'Valid To (u_valid_to)', value: 'u_valid_to' }
                ]
              }]);
            }
          } 
          else if (conversationState.selectedCategory === 'product_offerings') {
            if (conversationState.selectedAction === 'view') {
              response = await fetch(`http://localhost:3000/product-offerings/${userInput}`);
              const offering = await response.json();
              
              let details = `📋 Product Offering Details:\n`;
              details += `• Name: ${offering.u_name}\n`;
              details += `• Price: ${offering.u_price}\n`;
              details += `• Category: ${offering.u_category}\n`;
              details += `• Unit: ${offering.u_unit_of_measure}\n`;
              details += `• Channel: ${offering.u_channel}\n`;
              details += `• Status: ${offering.u_status}\n`;
              details += `• External ID: ${offering.u_external_id}\n`;
              details += `• Valid From: ${offering.u_valid_from}\n`;
              details += `• Valid To: ${offering.u_valid_to}\n`;
              details += `• Based on: ${offering.u_specification_name}\n`;
              
              setMessages(prev => [...prev, {
                from: 'agent',
                text: details,
                options: [
                  { text: '⭐️⭐️⭐️⭐️⭐️', value: '5_stars' },
                  { text: '⭐️⭐️⭐️⭐️', value: '4_stars' },
                  { text: '⭐️⭐️⭐️', value: '3_stars' },
                  { text: '⭐️⭐️', value: '2_stars' },
                  { text: '⭐️', value: '1_star' }
                ]
              }]);
            } 
            else if (conversationState.selectedAction === 'delete') {
              response = await fetch(`http://localhost:3000/product-offerings/${userInput}`, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                setMessages(prev => [...prev, {
                  from: 'agent',
                  text: "✅ Product offering deleted successfully!",
                  options: [
                    { text: '⭐️⭐️⭐️⭐️⭐️', value: '5_stars' },
                    { text: '⭐️⭐️⭐️⭐️', value: '4_stars' },
                    { text: '⭐️⭐️⭐️', value: '3_stars' },
                    { text: '⭐️⭐️', value: '2_stars' },
                    { text: '⭐️', value: '1_star' }
                  ]
                }]);
              } else {
                throw new Error('Failed to delete product offering');
              }
            } 
            else if (conversationState.selectedAction === 'update') {
              setConversationState({
                ...conversationState,
                stage: 'update_offering_fields',
                selectedItem: userInput,
                updateFields: []
              });
              
              setMessages(prev => [...prev, {
                from: 'agent',
                text: "Which fields would you like to update? (Select all that apply)",
                options: [
                  { text: 'Name (u_name)', value: 'u_name' },
                  { text: 'Price (u_price)', value: 'u_price' },
                  { text: 'Category (u_category)', value: 'u_category' },
                  { text: 'Unit (u_unit_of_measure)', value: 'u_unit_of_measure' },
                  { text: 'Channel (u_channel)', value: 'u_channel' },
                  { text: 'Status (u_status)', value: 'u_status' },
                  { text: 'External ID (u_external_id)', value: 'u_external_id' },
                  { text: 'Valid From (u_valid_from)', value: 'u_valid_from' },
                  { text: 'Valid To (u_valid_to)', value: 'u_valid_to' }
                ]
              }]);
            }
          }
          
          if (!['update_spec_fields', 'update_offering_fields'].includes(conversationState.stage)) {
            setConversationState({
              stage: 'initial',
              selectedCategory: null,
              selectedAction: null,
              selectedItem: null
            });
          }
          break;
          
        case 'update_spec_fields':
          if (!conversationState.updateFields.includes(userInput)) {
            setConversationState(prev => ({
              ...prev,
              updateFields: [...prev.updateFields, userInput],
              currentUpdateField: userInput
            }));
            
            setMessages(prev => [...prev, {
              from: 'agent',
              text: `Please provide the new value for ${userInput.replace('u_', '')}:`
            }]);
          } else {
            const { currentUpdateField, updateFields, collectedUpdateValues = {} } = conversationState;
            const remainingFields = updateFields.filter(f => !collectedUpdateValues[f]);
            
            if (remainingFields.length > 0) {
              const nextField = remainingFields[0];
              setConversationState(prev => ({
                ...prev,
                currentUpdateField: nextField,
                collectedUpdateValues: {
                  ...prev.collectedUpdateValues,
                  [currentUpdateField]: userInput
                }
              }));
              
              setMessages(prev => [...prev, {
                from: 'agent',
                text: `Please provide the new value for ${nextField.replace('u_', '')}:`
              }]);
            } else {
              const finalUpdateValues = {
                ...conversationState.collectedUpdateValues,
                [currentUpdateField]: userInput
              };
              
              response = await fetch(`http://localhost:3000/product-specifications/${conversationState.selectedItem}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalUpdateValues)
              });
              
              if (response.ok) {
                const updatedSpec = await response.json();
                setMessages(prev => [...prev, {
                  from: 'agent',
                  text: `✅ Successfully updated product specification "${updatedSpec.u_name}"!`,
                  options: [
                    { text: '⭐️⭐️⭐️⭐️⭐️', value: '5_stars' },
                    { text: '⭐️⭐️⭐️⭐️', value: '4_stars' },
                    { text: '⭐️⭐️⭐️', value: '3_stars' },
                    { text: '⭐️⭐️', value: '2_stars' },
                    { text: '⭐️', value: '1_star' }
                  ]
                }]);
              } else {
                throw new Error('Failed to update product specification');
              }
              
              setConversationState({
                stage: 'initial',
                selectedCategory: null,
                selectedAction: null,
                selectedItem: null
              });
            }
          }
          break;
          
        case 'update_offering_fields':
          if (!conversationState.updateFields.includes(userInput)) {
            setConversationState(prev => ({
              ...prev,
              updateFields: [...prev.updateFields, userInput],
              currentUpdateField: userInput
            }));
            
            setMessages(prev => [...prev, {
              from: 'agent',
              text: `Please provide the new value for ${userInput.replace('u_', '')}:`
            }]);
          } else {
            const { currentUpdateField, updateFields, collectedUpdateValues = {} } = conversationState;
            const remainingFields = updateFields.filter(f => !collectedUpdateValues[f]);
            
            if (remainingFields.length > 0) {
              const nextField = remainingFields[0];
              setConversationState(prev => ({
                ...prev,
                currentUpdateField: nextField,
                collectedUpdateValues: {
                  ...prev.collectedUpdateValues,
                  [currentUpdateField]: userInput
                }
              }));
              
              setMessages(prev => [...prev, {
                from: 'agent',
                text: `Please provide the new value for ${nextField.replace('u_', '')}:`
              }]);
            } else {
              const finalUpdateValues = {
                ...conversationState.collectedUpdateValues,
                [currentUpdateField]: userInput
              };
              
              response = await fetch(`http://localhost:3000/product-offerings/${conversationState.selectedItem}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalUpdateValues)
              });
              
              if (response.ok) {
                const updatedOffering = await response.json();
                setMessages(prev => [...prev, {
                  from: 'agent',
                  text: `✅ Successfully updated product offering "${updatedOffering.u_name}"!`,
                  options: [
                    { text: '⭐️⭐️⭐️⭐️⭐️', value: '5_stars' },
                    { text: '⭐️⭐️⭐️⭐️', value: '4_stars' },
                    { text: '⭐️⭐️⭐️', value: '3_stars' },
                    { text: '⭐️⭐️', value: '2_stars' },
                    { text: '⭐️', value: '1_star' }
                  ]
                }]);
              } else {
                throw new Error('Failed to update product offering');
              }
              
              setConversationState({
                stage: 'initial',
                selectedCategory: null,
                selectedAction: null,
                selectedItem: null
              });
            }
          }
          break;
          
        default:
          setMessages(prev => [...prev, {
            from: 'agent',
            text: "What would you like help with today?",
            options: [
              { text: '📦 Product Offerings', value: 'product_offerings' },
              { text: '📑 Product Specifications', value: 'product_specifications' },
              { text: '⚠️ Issues', value: 'issues' },
              { text: '❓ Something Else', value: 'other' }
            ]
          }]);
          setConversationState({
            stage: 'category_selection',
            selectedCategory: null,
            selectedAction: null,
            selectedItem: null
          });
      }
    } catch (error) {
      console.error('ServiceNow action error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        from: 'agent', 
        text: `⚠️ Error: ${error.message || 'Failed to perform action'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !attachment) return;
    
    const userMessage = { 
      from: 'user', 
      text: input,
      ...(attachment && { attachment })
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input; 
    setInput('');
    setAttachment(null);
    setIsLoading(true);
    setError(null);

    try {
      if (activeModel === 'servicenow') {
        await handleServiceNowAction(currentInput);
      } else {
        const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
        const modelName = 'gemini-2.0-flash';
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: currentInput }] }]
            })
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'AI response error');
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "I'm having trouble generating a response.";
        
        setMessages(prev => [...prev, { 
          from: 'agent', 
          text: botReply
        }]);
      }
    } catch (error) {
      console.error('Message error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        from: 'agent', 
        text: `⚠️ Error: ${error.message || 'Failed to get response'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) sendMessage();
  };

  const toggleModel = () => {
    const newModel = activeModel === 'gemini' ? 'servicenow' : 'gemini';
    setActiveModel(newModel);
    setError(null);
    
    if (newModel === 'servicenow') {
      startSession();
    }
  };

  const handleOptionSelect = (optionValue) => {
    setInput(optionValue);
    sendMessage();
  };

  const emojis = ['😀', '😊', '👍', '👋', '🎉', '📊', '📈', '⚠️', '❓', '✅'];

  return (
    <div className="fixed bottom-15 right-4 w-96 h-[580px] rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col font-sans border border-[#374151] bg-[#1F2937]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 flex justify-between items-center border-b border-[#374151]">
        <div className="flex items-center gap-2">
          <RiRobot2Line className="text-xl" />
          <h2 className="text-lg font-semibold">Product Assistant</h2>
          <button 
            onClick={toggleModel}
            className="text-xs bg-white/10 p-1.5 rounded-md flex items-center gap-1 hover:bg-white/20 transition ml-2"
            title={`Switch to ${activeModel === 'gemini' ? 'Product AI' : 'Structured'}`}
            disabled={isLoading}
          >
            {activeModel === 'gemini' ? <FaBrain size={12} /> : <RiRobot2Line size={12} />}
            {activeModel === 'gemini' ? 'AI Mode' : 'Structured'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-xl hover:bg-white/10 p-1 rounded-full transition"
          disabled={isLoading}
        >
          <RiCloseLine />
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#1F2937]">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div
              className={`max-w-[80%] px-4 py-2 text-sm rounded-lg mb-2 ${
                msg.from === 'agent'
                  ? 'bg-[#111827] border border-[#374151] text-gray-200 self-start'
                  : 'bg-blue-600 text-white self-end ml-auto'
              }`}
            >
              {msg.attachment?.type === 'image' ? (
                <div>
                  <img 
                    src={msg.attachment.url} 
                    alt="User attachment" 
                    className="max-w-full h-auto rounded mb-2 border border-[#374151]"
                  />
                  {msg.text && <div>{msg.text}</div>}
                </div>
              ) : (
                <div>{msg.text}</div>
              )}
            </div>
            
            {/* Display options if available */}
            {msg.options && (
              <div className="flex flex-wrap gap-2 mb-3">
                {msg.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(option.value)}
                    className="px-3 py-1 bg-[#111827] hover:bg-[#1a2231] rounded-md text-sm border border-[#374151] text-gray-200"
                    disabled={isLoading}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}
            
            {/* Display items list if available */}
            {msg.items && (
              <div className="space-y-2 mb-3">
                {msg.items.map((item, i) => (
                  <div 
                    key={i}
                    onClick={() => handleOptionSelect(item.id)}
                    className="p-3 bg-[#111827] border border-[#374151] rounded-lg cursor-pointer hover:bg-[#1a2231] text-gray-200"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="max-w-[80%] px-4 py-2 text-sm rounded-lg bg-[#111827] border border-[#374151] text-gray-200 self-start">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs p-2">
            <RiAlertLine /> {error}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-4 py-2 border-t border-[#374151] bg-[#111827]">
          <div className="relative">
            <img 
              src={attachment.url} 
              alt="Preview" 
              className="max-h-32 w-auto rounded border border-[#374151]"
            />
            <button
              onClick={() => setAttachment(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 text-xs border border-red-400"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-[#111827] border-t border-[#374151]">
        <div className="flex items-center gap-2">
          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-[#1F2937] transition"
            >
              <RiEmotionLine />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-[#1F2937] border border-[#374151] rounded-lg shadow-lg p-2 z-10 w-48 grid grid-cols-5 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      addEmoji(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl p-1 hover:bg-[#111827] rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-[#1F2937] transition"
          >
            <RiImageLine />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          
          {/* Text Input */}
          <input
            type="text"
            className="flex-1 border border-[#374151] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#1F2937] text-gray-200 transition"
            placeholder="Ask about products..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !attachment)}
            className={`bg-blue-600 text-white p-2 rounded-lg transition transform ${
              isLoading || (!input.trim() && !attachment) ? 'opacity-50' : 'hover:bg-blue-500'
            }`}
          >
            <RiSendPlaneLine />
          </button>
        </div>
      </div>
    </div>
  );
}