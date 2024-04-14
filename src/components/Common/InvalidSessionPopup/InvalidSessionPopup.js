import React, { useRef, useEffect } from 'react';
import './InvalidSessionPopup.css';


const InvalidSessionPopup = ({ onClose }) => {
  const popupRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };


    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);


  return (
    <div className="popup" ref={popupRef}>
      <div className="popup-inner">
        <h2>Invalid session code</h2>
        <p>Please enter a valid session code.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};


export default InvalidSessionPopup;
